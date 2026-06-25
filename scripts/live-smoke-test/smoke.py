#!/usr/bin/env python3
"""
Live smoke test for the Knowledge Graph phase (C.1b).

Runs end-to-end against the Live environment:
  1. SQL seed verification
  2. UI sweep (Coverage / Media Vault / Review queue)
  3. Pipeline smoke test (insert throwaway -> verify -> delete -> confirm clean)

Exits non-zero on any failure. See scripts/live-smoke-test/README.md.
"""
from __future__ import annotations

import asyncio
import json
import os
import sys
import uuid
from pathlib import Path
from typing import Any

import psycopg2
import psycopg2.extras
from playwright.async_api import async_playwright, Page, TimeoutError as PlaywrightTimeout

# --------------------------------------------------------------------------
# Config / env
# --------------------------------------------------------------------------

OUT = Path(__file__).parent / "out"
OUT.mkdir(exist_ok=True)

REQUIRED_ENV = [
    "LIVE_URL",
    "LIVE_DATABASE_URL",
    "LIVE_ADMIN_EMAIL",
    "LIVE_ADMIN_PASSWORD",
    "LIVE_SUPABASE_URL",
    "LIVE_SUPABASE_ANON_KEY",
]


def load_env() -> dict[str, str]:
    # Optional .env loader (no extra dep)
    env_file = Path(__file__).parent / ".env"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
    missing = [k for k in REQUIRED_ENV if not os.environ.get(k)]
    if missing:
        die(1, f"Missing env vars: {', '.join(missing)}")
    return {k: os.environ[k] for k in REQUIRED_ENV}


REPORT: dict[str, Any] = {"phases": {}}


def die(code: int, msg: str) -> None:
    print(f"FAIL [{code}] {msg}")
    REPORT["error"] = msg
    REPORT["exit_code"] = code
    (OUT / "report.json").write_text(json.dumps(REPORT, indent=2, default=str))
    sys.exit(code)


def ok(msg: str) -> None:
    print(f"  ✓ {msg}")


# --------------------------------------------------------------------------
# Phase 1 — SQL seed verification
# --------------------------------------------------------------------------

MAIN_RIDGE_CODE = "PE-MR-014"


def phase_sql_verify(conn) -> dict[str, Any]:
    print("\n[1/3] SQL seed verification")
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("SELECT status, count(*) AS n FROM public.hq_graph_edges GROUP BY status ORDER BY status;")
    status_rows = cur.fetchall()
    status_map = {r["status"]: r["n"] for r in status_rows}
    ok(f"status counts: {status_map}")

    if status_map.get("suggested", 0) != 0:
        die(1, f"suggested != 0 (got {status_map.get('suggested')})")
    ok("suggested = 0")

    cur.execute(
        """
        SELECT count(*) AS n
          FROM public.hq_graph_edges e
          JOIN public.managed_projects p ON p.id = e.from_id AND p.code = %s
         WHERE e.from_type='project' AND e.to_type='media' AND e.status='system_linked';
        """,
        (MAIN_RIDGE_CODE,),
    )
    mr = cur.fetchone()["n"]
    if mr != 5:
        die(1, f"Main Ridge system_linked media edges = {mr}, expected 5")
    ok("Main Ridge system_linked media edges = 5")

    cur.execute(
        """
        SELECT count(*) AS n FROM public.hq_graph_edges e
         WHERE (e.from_type='project' AND NOT EXISTS (SELECT 1 FROM public.managed_projects p WHERE p.id=e.from_id))
            OR (e.from_type='media'   AND NOT EXISTS (SELECT 1 FROM public.media_assets    m WHERE m.id=e.from_id))
            OR (e.to_type  ='project' AND NOT EXISTS (SELECT 1 FROM public.managed_projects p WHERE p.id=e.to_id))
            OR (e.to_type  ='media'   AND NOT EXISTS (SELECT 1 FROM public.media_assets    m WHERE m.id=e.to_id));
        """
    )
    orphans = cur.fetchone()["n"]
    if orphans != 0:
        die(1, f"orphans = {orphans}, expected 0")
    ok("orphans = 0")

    cur.execute(
        """
        SELECT count(*) AS n FROM (
          SELECT 1 FROM public.hq_graph_edges
           GROUP BY from_type, from_id, to_type, to_id, relation
          HAVING count(*) > 1
        ) d;
        """
    )
    dupes = cur.fetchone()["n"]
    if dupes != 0:
        die(1, f"duplicate edges = {dupes}, expected 0")
    ok("duplicate edges = 0")

    cur.execute(
        "SELECT id FROM public.managed_projects WHERE code = %s LIMIT 1;",
        (MAIN_RIDGE_CODE,),
    )
    row = cur.fetchone()
    if not row:
        die(1, f"Main Ridge project {MAIN_RIDGE_CODE} missing")
    main_ridge_id = row["id"]

    REPORT["phases"]["sql_verify"] = {
        "status_counts": status_map,
        "main_ridge_id": str(main_ridge_id),
    }
    return {"main_ridge_id": main_ridge_id}


# --------------------------------------------------------------------------
# Phase 2 — UI sweep
# --------------------------------------------------------------------------


async def login(page: Page, env: dict[str, str]) -> None:
    # Mint a Supabase session via REST and stash it in localStorage so the
    # SPA boots already authenticated. Avoids fragile login-form scraping.
    import urllib.request

    project_ref = env["LIVE_SUPABASE_URL"].rstrip("/").split("//")[-1].split(".")[0]
    storage_key = f"sb-{project_ref}-auth-token"

    req = urllib.request.Request(
        f"{env['LIVE_SUPABASE_URL']}/auth/v1/token?grant_type=password",
        data=json.dumps(
            {"email": env["LIVE_ADMIN_EMAIL"], "password": env["LIVE_ADMIN_PASSWORD"]}
        ).encode(),
        headers={
            "apikey": env["LIVE_SUPABASE_ANON_KEY"],
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            session = json.loads(resp.read())
    except Exception as e:  # noqa: BLE001
        die(2, f"admin login failed: {e}")

    await page.goto(env["LIVE_URL"], wait_until="domcontentloaded")
    await page.evaluate(
        f"window.localStorage.setItem({json.dumps(storage_key)}, {json.dumps(json.dumps(session))})"
    )


async def phase_ui_sweep(env: dict[str, str], main_ridge_id: str) -> None:
    print("\n[2/3] UI sweep")
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()

        await login(page, env)

        # Project Coverage
        url = f"{env['LIVE_URL']}/hq/projects/{main_ridge_id}"
        await page.goto(url, wait_until="networkidle")
        await page.screenshot(path=str(OUT / "ui_project.png"))
        body = (await page.text_content("body")) or ""
        if "Media" not in body or "5" not in body:
            die(2, "Project Coverage: expected 'Media' and count 5 in visible text")
        for label in ("Documents", "Field Notes"):
            if label not in body:
                die(2, f"Project Coverage: missing '{label}'")
        ok("Project Coverage shows Media 5 / Documents / Field Notes")

        # Media Vault
        await page.goto(f"{env['LIVE_URL']}/hq/media", wait_until="networkidle")
        await page.screenshot(path=str(OUT / "ui_media.png"))
        body = (await page.text_content("body")) or ""
        suggested_chip_count = await page.locator("text=/^Suggested$/i").count()
        if suggested_chip_count != 0:
            die(2, f"Media Vault: {suggested_chip_count} Suggested chip(s) visible; expected 0")
        ok("Media Vault: 0 Suggested chips")

        # /hq/review empty
        await page.goto(f"{env['LIVE_URL']}/hq/review", wait_until="networkidle")
        await page.screenshot(path=str(OUT / "ui_review_empty.png"))
        body = (await page.text_content("body")) or ""
        if "queue is clear" not in body.lower():
            die(2, "/hq/review: expected empty-state copy")
        ok("/hq/review queue empty")

        await browser.close()


# --------------------------------------------------------------------------
# Phase 3 — pipeline smoke test
# --------------------------------------------------------------------------


def insert_throwaway(conn) -> str:
    cur = conn.cursor()
    asset_id = str(uuid.uuid4())
    cur.execute(
        """
        INSERT INTO public.media_assets
          (id, title, description, tags, project_id, is_demo, approval_state, asset_type, storage_path)
        VALUES (%s, 'main-ridge-test.jpg', 'live smoke test', ARRAY['main-ridge'], NULL,
                false, 'draft', 'image', %s)
        """,
        (asset_id, f"smoke/{asset_id}.jpg"),
    )
    conn.commit()
    return asset_id


def fetch_suggested_edge_for(conn, asset_id: str) -> dict[str, Any] | None:
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(
        """
        SELECT id, from_id, to_id, status, matched_rules
          FROM public.hq_graph_edges
         WHERE to_type='media' AND to_id=%s AND status='suggested'
         LIMIT 1;
        """,
        (asset_id,),
    )
    return cur.fetchone()


def delete_throwaway(conn, asset_id: str) -> None:
    cur = conn.cursor()
    cur.execute("DELETE FROM public.hq_graph_edges WHERE to_type='media' AND to_id=%s;", (asset_id,))
    cur.execute("DELETE FROM public.media_assets WHERE id=%s;", (asset_id,))
    conn.commit()


def count_suggested(conn) -> int:
    cur = conn.cursor()
    cur.execute("SELECT count(*) FROM public.hq_graph_edges WHERE status='suggested';")
    return cur.fetchone()[0]


def count_orphans(conn) -> int:
    cur = conn.cursor()
    cur.execute(
        """
        SELECT count(*) FROM public.hq_graph_edges e
         WHERE (e.from_type='project' AND NOT EXISTS (SELECT 1 FROM public.managed_projects p WHERE p.id=e.from_id))
            OR (e.from_type='media'   AND NOT EXISTS (SELECT 1 FROM public.media_assets    m WHERE m.id=e.from_id))
            OR (e.to_type  ='project' AND NOT EXISTS (SELECT 1 FROM public.managed_projects p WHERE p.id=e.to_id))
            OR (e.to_type  ='media'   AND NOT EXISTS (SELECT 1 FROM public.media_assets    m WHERE m.id=e.to_id));
        """
    )
    return cur.fetchone()[0]


async def phase_pipeline(env: dict[str, str], conn, main_ridge_id: str) -> None:
    print("\n[3/3] Pipeline smoke test")
    asset_id = insert_throwaway(conn)
    print(f"  inserted throwaway media_assets.id={asset_id}")

    edge = None
    for _ in range(10):
        edge = fetch_suggested_edge_for(conn, asset_id)
        if edge:
            break
        await asyncio.sleep(0.5)
    if not edge:
        delete_throwaway(conn, asset_id)
        die(3, "trigger did not produce a suggested edge within 5s")
    if str(edge["from_id"]) != str(main_ridge_id):
        delete_throwaway(conn, asset_id)
        die(3, f"suggested edge points to {edge['from_id']}, expected Main Ridge {main_ridge_id}")
    ok(f"suggested edge created (rules: {edge['matched_rules']})")

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()
        await login(page, env)

        await page.goto(f"{env['LIVE_URL']}/hq/review", wait_until="networkidle")
        await page.screenshot(path=str(OUT / "ui_review_with_item.png"))

        verify_btn = page.get_by_role("button", name="Verify →")
        try:
            await verify_btn.first.wait_for(timeout=5000)
        except PlaywrightTimeout:
            delete_throwaway(conn, asset_id)
            die(3, "Verify button not visible in /hq/review")

        await verify_btn.first.click()
        # Wait for toast or row removal
        try:
            await page.wait_for_function(
                "() => !document.body.innerText.includes('main-ridge-test.jpg')",
                timeout=5000,
            )
        except PlaywrightTimeout:
            pass
        await page.screenshot(path=str(OUT / "ui_review_after_verify.png"))
        ok("clicked Verify in /hq/review")

        await browser.close()

    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(
        "SELECT status FROM public.hq_graph_edges WHERE to_type='media' AND to_id=%s;",
        (asset_id,),
    )
    after = cur.fetchone()
    if not after or after["status"] != "verified":
        delete_throwaway(conn, asset_id)
        die(3, f"edge status after Verify = {after}, expected verified")
    ok("edge status = verified")

    delete_throwaway(conn, asset_id)
    ok("throwaway asset deleted")

    final_suggested = count_suggested(conn)
    final_orphans = count_orphans(conn)
    REPORT["phases"]["pipeline"] = {
        "asset_id": asset_id,
        "final_suggested": final_suggested,
        "final_orphans": final_orphans,
    }
    if final_suggested != 0:
        die(4, f"suggested != 0 after cleanup (got {final_suggested}) — the final bell")
    if final_orphans != 0:
        die(4, f"orphans != 0 after cleanup (got {final_orphans})")
    ok("suggested = 0 after cleanup (the final bell)")
    ok("orphans = 0 after cleanup")


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------


async def main() -> None:
    env = load_env()
    print(f"Live URL:  {env['LIVE_URL']}")
    print(f"Admin:     {env['LIVE_ADMIN_EMAIL']}")

    conn = psycopg2.connect(env["LIVE_DATABASE_URL"])
    try:
        sql_ctx = phase_sql_verify(conn)
        await phase_ui_sweep(env, str(sql_ctx["main_ridge_id"]))
        await phase_pipeline(env, conn, str(sql_ctx["main_ridge_id"]))
    finally:
        conn.close()

    REPORT["exit_code"] = 0
    REPORT["result"] = "PASS — C.1b production-ready"
    (OUT / "report.json").write_text(json.dumps(REPORT, indent=2, default=str))
    print("\nPASS — Knowledge Graph C.1b is production-ready on Live.")


if __name__ == "__main__":
    asyncio.run(main())
