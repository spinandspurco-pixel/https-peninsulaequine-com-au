#!/usr/bin/env python3
"""
Live smoke test for the Knowledge Graph phase (C.1b).

Hardened release:
  - Timestamped artifact directory per run (out/<ISO>/)
  - Full failure diagnostics (URL, screenshot, DOM, console, network)
  - Cleanup guaranteed via finally block
  - Granular exit codes (1..6)
  - Production safety flag required for --env live

See scripts/live-smoke-test/README.md.
"""
from __future__ import annotations

import argparse
import asyncio
import json
import os
import platform
import socket
import subprocess
import sys
import traceback
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


# Heavy deps imported lazily inside main() so --help works without install.
psycopg2 = None  # type: ignore[assignment]
psycopg2_extras = None  # type: ignore[assignment]
async_playwright = None  # type: ignore[assignment]
BrowserContext = Any  # type: ignore[assignment,misc]
Page = Any  # type: ignore[assignment,misc]
PlaywrightTimeout = Exception  # type: ignore[assignment,misc]


def _import_runtime_deps() -> None:
    global psycopg2, psycopg2_extras, async_playwright
    global BrowserContext, Page, PlaywrightTimeout
    import psycopg2 as _pg
    import psycopg2.extras as _pgx
    from playwright.async_api import (
        async_playwright as _apw,
        BrowserContext as _BC,
        Page as _P,
        TimeoutError as _PT,
    )
    psycopg2 = _pg
    psycopg2_extras = _pgx
    async_playwright = _apw
    BrowserContext = _BC
    Page = _P
    PlaywrightTimeout = _PT


# --------------------------------------------------------------------------
# Exit codes (granular)
# --------------------------------------------------------------------------

EXIT_OK              = 0
EXIT_CONFIG          = 1  # missing env / safety flag / SQL seed verification
EXIT_VERIFY_MISMATCH = 2  # graph integrity / coverage mismatch
EXIT_UI_NAV          = 3  # UI navigation or selector failure
EXIT_UPLOAD          = 4  # throwaway insert / trigger did not fire
EXIT_VERIFY_FLOW     = 5  # Verify button / edge status transition failed
EXIT_CLEANUP         = 6  # residue left after cleanup (suggested != 0, orphans)

# --------------------------------------------------------------------------
# Run context / artifact directory
# --------------------------------------------------------------------------

RUN_TS = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H-%M-%SZ")
OUT_ROOT = Path(__file__).parent / "out"
RUN_DIR = OUT_ROOT / RUN_TS
RUN_DIR.mkdir(parents=True, exist_ok=True)

REPORT: dict[str, Any] = {
    "run_id": RUN_TS,
    "started_at": datetime.now(timezone.utc).isoformat(),
    "runtime": {
        "python": sys.version.split()[0],
        "platform": platform.platform(),
        "hostname": socket.gethostname(),
    },
    "phases": {},
    "steps": [],
}

REQUIRED_ENV = [
    "LIVE_URL",
    "LIVE_DATABASE_URL",
    "LIVE_ADMIN_EMAIL",
    "LIVE_ADMIN_PASSWORD",
    "LIVE_SUPABASE_URL",
    "LIVE_SUPABASE_ANON_KEY",
]
LIVE_SAFETY_TOKEN = "I_UNDERSTAND_THIS_TOUCHES_PRODUCTION"
MAIN_RIDGE_CODE = "PE-MR-014"


# --------------------------------------------------------------------------
# Logging helpers
# --------------------------------------------------------------------------


def ok(msg: str) -> None:
    print(f"  ✓ {msg}")
    REPORT["steps"].append({"ok": True, "msg": msg})


def info(msg: str) -> None:
    print(f"  · {msg}")
    REPORT["steps"].append({"ok": True, "msg": msg, "info": True})


def write_report(extra: dict[str, Any] | None = None) -> None:
    if extra:
        REPORT.update(extra)
    REPORT["ended_at"] = datetime.now(timezone.utc).isoformat()
    (RUN_DIR / "report.json").write_text(json.dumps(REPORT, indent=2, default=str))


# --------------------------------------------------------------------------
# Failure diagnostics
# --------------------------------------------------------------------------


async def capture_page_diagnostics(
    page: Page | None,
    label: str,
    console_log: list[dict[str, Any]] | None,
    network_failures: list[dict[str, Any]] | None,
) -> dict[str, Any]:
    diag: dict[str, Any] = {"label": label}
    if page is None:
        return diag
    try:
        diag["url"] = page.url
        await page.screenshot(path=str(RUN_DIR / f"FAIL_{label}.png"), full_page=False)
        diag["screenshot"] = f"FAIL_{label}.png"
        html = await page.content()
        (RUN_DIR / f"FAIL_{label}.html").write_text(html)
        diag["dom"] = f"FAIL_{label}.html"
    except Exception as e:  # noqa: BLE001
        diag["capture_error"] = str(e)
    if console_log is not None:
        (RUN_DIR / f"FAIL_{label}.console.json").write_text(json.dumps(console_log, indent=2))
        diag["console"] = f"FAIL_{label}.console.json"
    if network_failures is not None:
        (RUN_DIR / f"FAIL_{label}.network.json").write_text(json.dumps(network_failures, indent=2))
        diag["network_failures"] = f"FAIL_{label}.network.json"
    return diag


def die(
    code: int,
    msg: str,
    sql: str | None = None,
    diag: dict[str, Any] | None = None,
) -> None:
    print(f"\nFAIL [{code}] {msg}")
    REPORT["result"] = "FAIL"
    REPORT["error"] = {"code": code, "message": msg}
    if sql:
        REPORT["error"]["sql"] = sql
    if diag:
        REPORT["error"]["diagnostics"] = diag
    REPORT["exit_code"] = code
    write_report()
    sys.exit(code)


# --------------------------------------------------------------------------
# Env / safety
# --------------------------------------------------------------------------


def load_env_file() -> None:
    env_file = Path(__file__).parent / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def detect_build_id() -> str | None:
    for var in ("LOVABLE_COMMIT", "COMMIT_SHA", "GIT_COMMIT", "GITHUB_SHA"):
        if os.environ.get(var):
            return os.environ[var]
    try:
        return (
            subprocess.check_output(
                ["git", "rev-parse", "--short", "HEAD"],
                cwd=Path(__file__).resolve().parents[2],
                stderr=subprocess.DEVNULL,
            )
            .decode()
            .strip()
        )
    except Exception:  # noqa: BLE001
        return None


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Knowledge Graph Live smoke test")
    p.add_argument("--env", choices=["test", "live"], required=True,
                   help="Target environment label (writes to report).")
    p.add_argument("--skip-pipeline", action="store_true",
                   help="Skip Phase 3 (read-only verification only).")
    return p.parse_args()


def assert_safety(args: argparse.Namespace) -> dict[str, str]:
    load_env_file()
    missing = [k for k in REQUIRED_ENV if not os.environ.get(k)]
    if missing:
        die(EXIT_CONFIG, f"Missing env vars: {', '.join(missing)}")

    if args.env == "live":
        token = os.environ.get("LIVE_CONFIRM", "")
        if token != LIVE_SAFETY_TOKEN:
            die(
                EXIT_CONFIG,
                f"Refusing to run against Live without LIVE_CONFIRM={LIVE_SAFETY_TOKEN}",
            )

    REPORT["environment"] = args.env
    REPORT["build_id"] = detect_build_id()
    REPORT["live_url"] = os.environ["LIVE_URL"]
    REPORT["admin_email"] = os.environ["LIVE_ADMIN_EMAIL"]
    return {k: os.environ[k] for k in REQUIRED_ENV}


# --------------------------------------------------------------------------
# Phase 1 — SQL seed verification
# --------------------------------------------------------------------------


def phase_sql_verify(conn) -> dict[str, Any]:
    print("\n[1/3] SQL seed verification")
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    q = "SELECT status, count(*) AS n FROM public.hq_graph_edges GROUP BY status ORDER BY status;"
    cur.execute(q)
    status_map = {r["status"]: r["n"] for r in cur.fetchall()}
    ok(f"status counts: {status_map}")

    if status_map.get("suggested", 0) != 0:
        die(EXIT_VERIFY_MISMATCH, f"suggested != 0 (got {status_map.get('suggested')})", sql=q)
    ok("suggested = 0")

    q = """
        SELECT count(*) AS n
          FROM public.hq_graph_edges e
          JOIN public.managed_projects p ON p.id = e.from_id AND p.code = %s
         WHERE e.from_type='project' AND e.to_type='media' AND e.status='system_linked';
    """
    cur.execute(q, (MAIN_RIDGE_CODE,))
    mr = cur.fetchone()["n"]
    if mr != 5:
        die(EXIT_VERIFY_MISMATCH, f"Main Ridge system_linked media edges = {mr}, expected 5", sql=q)
    ok("Main Ridge system_linked media edges = 5")

    q = """
        SELECT count(*) AS n FROM public.hq_graph_edges e
         WHERE (e.from_type='project' AND NOT EXISTS (SELECT 1 FROM public.managed_projects p WHERE p.id=e.from_id))
            OR (e.from_type='media'   AND NOT EXISTS (SELECT 1 FROM public.media_assets    m WHERE m.id=e.from_id))
            OR (e.to_type  ='project' AND NOT EXISTS (SELECT 1 FROM public.managed_projects p WHERE p.id=e.to_id))
            OR (e.to_type  ='media'   AND NOT EXISTS (SELECT 1 FROM public.media_assets    m WHERE m.id=e.to_id));
    """
    cur.execute(q)
    orphans = cur.fetchone()["n"]
    if orphans != 0:
        die(EXIT_VERIFY_MISMATCH, f"orphans = {orphans}, expected 0", sql=q)
    ok("orphans = 0")

    q = """
        SELECT count(*) AS n FROM (
          SELECT 1 FROM public.hq_graph_edges
           GROUP BY from_type, from_id, to_type, to_id, relation
          HAVING count(*) > 1
        ) d;
    """
    cur.execute(q)
    dupes = cur.fetchone()["n"]
    if dupes != 0:
        die(EXIT_VERIFY_MISMATCH, f"duplicate edges = {dupes}, expected 0", sql=q)
    ok("duplicate edges = 0")

    cur.execute("SELECT id FROM public.managed_projects WHERE code=%s LIMIT 1;", (MAIN_RIDGE_CODE,))
    row = cur.fetchone()
    if not row:
        die(EXIT_VERIFY_MISMATCH, f"Main Ridge project {MAIN_RIDGE_CODE} missing")
    main_ridge_id = str(row["id"])

    REPORT["phases"]["sql_verify"] = {"status_counts": status_map, "main_ridge_id": main_ridge_id}
    return {"main_ridge_id": main_ridge_id}


# --------------------------------------------------------------------------
# Browser plumbing
# --------------------------------------------------------------------------


async def new_context(pw) -> tuple[BrowserContext, list[dict[str, Any]], list[dict[str, Any]]]:
    browser = await pw.chromium.launch(headless=True)
    context = await browser.new_context(viewport={"width": 1280, "height": 1800})
    console_log: list[dict[str, Any]] = []
    network_failures: list[dict[str, Any]] = []

    def _on_console(msg) -> None:
        console_log.append({"type": msg.type, "text": msg.text})

    def _on_response(resp) -> None:
        if resp.status >= 400:
            network_failures.append({"url": resp.url, "status": resp.status})

    context.on("console", _on_console)
    context.on("response", _on_response)
    return context, console_log, network_failures


async def login(page: Page, env: dict[str, str]) -> None:
    import urllib.request

    project_ref = env["LIVE_SUPABASE_URL"].rstrip("/").split("//")[-1].split(".")[0]
    storage_key = f"sb-{project_ref}-auth-token"

    req = urllib.request.Request(
        f"{env['LIVE_SUPABASE_URL']}/auth/v1/token?grant_type=password",
        data=json.dumps(
            {"email": env["LIVE_ADMIN_EMAIL"], "password": env["LIVE_ADMIN_PASSWORD"]}
        ).encode(),
        headers={"apikey": env["LIVE_SUPABASE_ANON_KEY"], "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            session = json.loads(resp.read())
    except Exception as e:  # noqa: BLE001
        die(EXIT_UI_NAV, f"admin login failed: {e}")

    await page.goto(env["LIVE_URL"], wait_until="domcontentloaded")
    await page.evaluate(
        f"window.localStorage.setItem({json.dumps(storage_key)}, {json.dumps(json.dumps(session))})"
    )


# --------------------------------------------------------------------------
# Phase 2 — UI sweep
# --------------------------------------------------------------------------

# Per-step timeouts
NAV_TIMEOUT_MS = 20_000          # page.goto
ASSERT_TIMEOUT_MS = 8_000        # locator waits
RETRY_BACKOFF_S = 1.5


async def retry_ui(label: str, fn) -> None:
    """Run a UI assertion coroutine factory with one retry (UI/nav only)."""
    last_exc: Exception | None = None
    for attempt in (1, 2):
        try:
            await fn()
            if attempt > 1:
                info(f"{label}: passed on retry {attempt}")
            return
        except SystemExit:
            raise
        except Exception as e:  # noqa: BLE001
            last_exc = e
            if attempt == 1:
                info(f"{label}: attempt 1 failed ({e}); retrying once after {RETRY_BACKOFF_S}s")
                await asyncio.sleep(RETRY_BACKOFF_S)
    raise last_exc  # type: ignore[misc]


async def phase_ui_sweep(env: dict[str, str], main_ridge_id: str) -> None:
    print("\n[2/3] UI sweep")
    async with async_playwright() as pw:
        context, console_log, network_failures = await new_context(pw)
        context.set_default_timeout(ASSERT_TIMEOUT_MS)
        context.set_default_navigation_timeout(NAV_TIMEOUT_MS)
        page = await context.new_page()
        try:
            await login(page, env)

            async def _coverage() -> None:
                await page.goto(f"{env['LIVE_URL']}/hq/projects/{main_ridge_id}", wait_until="networkidle")
                await page.screenshot(path=str(RUN_DIR / "ui_project.png"))
                body = (await page.text_content("body")) or ""
                if "Media" not in body or "5" not in body:
                    raise AssertionError("Project Coverage: expected 'Media' and count 5")
                for label in ("Documents", "Field Notes"):
                    if label not in body:
                        raise AssertionError(f"Project Coverage: missing '{label}'")

            try:
                await retry_ui("project_coverage", _coverage)
            except Exception as e:  # noqa: BLE001
                diag = await capture_page_diagnostics(page, "project_coverage", console_log, network_failures)
                die(EXIT_VERIFY_MISMATCH, str(e), diag=diag)
            ok("Project Coverage: Media 5 / Documents / Field Notes")

            async def _media_vault() -> None:
                await page.goto(f"{env['LIVE_URL']}/hq/media", wait_until="networkidle")
                await page.screenshot(path=str(RUN_DIR / "ui_media.png"))
                chips = await page.locator("text=/^Suggested$/i").count()
                if chips != 0:
                    raise AssertionError(f"Media Vault: {chips} Suggested chip(s); expected 0")

            try:
                await retry_ui("media_vault", _media_vault)
            except Exception as e:  # noqa: BLE001
                diag = await capture_page_diagnostics(page, "media_vault", console_log, network_failures)
                die(EXIT_VERIFY_MISMATCH, str(e), diag=diag)
            ok("Media Vault: 0 Suggested chips")

            async def _review_empty() -> None:
                await page.goto(f"{env['LIVE_URL']}/hq/review", wait_until="networkidle")
                await page.screenshot(path=str(RUN_DIR / "ui_review_empty.png"))
                body = (await page.text_content("body")) or ""
                if "queue is clear" not in body.lower():
                    raise AssertionError("/hq/review: expected empty-state copy")

            try:
                await retry_ui("review_empty", _review_empty)
            except Exception as e:  # noqa: BLE001
                diag = await capture_page_diagnostics(page, "review_empty", console_log, network_failures)
                die(EXIT_UI_NAV, str(e), diag=diag)
            ok("/hq/review: queue empty")

        except SystemExit:
            raise
        except Exception as e:  # noqa: BLE001
            diag = await capture_page_diagnostics(page, "ui_sweep_unhandled", console_log, network_failures)
            diag["exception"] = traceback.format_exc()
            die(EXIT_UI_NAV, f"UI sweep crashed: {e}", diag=diag)
        finally:
            await context.browser.close() if context.browser else None


# --------------------------------------------------------------------------
# Phase 3 — pipeline smoke test (with guaranteed cleanup)
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


def delete_throwaway(conn, asset_id: str) -> None:
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM public.hq_graph_edges WHERE to_type='media' AND to_id=%s;", (asset_id,))
        cur.execute("DELETE FROM public.media_assets WHERE id=%s;", (asset_id,))
        conn.commit()
    except Exception as e:  # noqa: BLE001
        print(f"  ! cleanup error (will report): {e}")
        REPORT.setdefault("cleanup_errors", []).append(str(e))


def fetch_edge_for(conn, asset_id: str, status: str | None = None) -> dict[str, Any] | None:
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    if status:
        cur.execute(
            "SELECT id, from_id, to_id, status, matched_rules FROM public.hq_graph_edges "
            "WHERE to_type='media' AND to_id=%s AND status=%s LIMIT 1;",
            (asset_id, status),
        )
    else:
        cur.execute(
            "SELECT id, from_id, to_id, status, matched_rules FROM public.hq_graph_edges "
            "WHERE to_type='media' AND to_id=%s LIMIT 1;",
            (asset_id,),
        )
    return cur.fetchone()


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
    asset_id: str | None = None
    try:
        asset_id = insert_throwaway(conn)
        info(f"inserted throwaway media_assets.id={asset_id}")

        edge = None
        for _ in range(10):
            edge = fetch_edge_for(conn, asset_id, "suggested")
            if edge:
                break
            await asyncio.sleep(0.5)
        if not edge:
            die(EXIT_UPLOAD, "trigger did not produce a suggested edge within 5s")
        if str(edge["from_id"]) != str(main_ridge_id):
            die(EXIT_UPLOAD, f"suggested edge points to {edge['from_id']}, expected Main Ridge {main_ridge_id}")
        ok(f"suggested edge created (rules: {edge['matched_rules']})")

        async with async_playwright() as pw:
            context, console_log, network_failures = await new_context(pw)
            page = await context.new_page()
            try:
                await login(page, env)
                await page.goto(f"{env['LIVE_URL']}/hq/review", wait_until="networkidle")
                await page.screenshot(path=str(RUN_DIR / "ui_review_with_item.png"))

                verify_btn = page.get_by_role("button", name="Verify →")
                try:
                    await verify_btn.first.wait_for(timeout=5000)
                except PlaywrightTimeout:
                    diag = await capture_page_diagnostics(page, "review_no_verify", console_log, network_failures)
                    die(EXIT_VERIFY_FLOW, "Verify button not visible in /hq/review", diag=diag)

                await verify_btn.first.click()
                try:
                    await page.wait_for_function(
                        "() => !document.body.innerText.includes('main-ridge-test.jpg')",
                        timeout=5000,
                    )
                except PlaywrightTimeout:
                    pass
                await page.screenshot(path=str(RUN_DIR / "ui_review_after_verify.png"))
                ok("clicked Verify in /hq/review")
            finally:
                await context.browser.close() if context.browser else None

        after = fetch_edge_for(conn, asset_id)
        if not after or after["status"] != "verified":
            die(EXIT_VERIFY_FLOW, f"edge status after Verify = {after}, expected verified")
        ok("edge status = verified")
    finally:
        if asset_id:
            delete_throwaway(conn, asset_id)
            ok("throwaway asset cleaned up (finally)")

    final_suggested = count_suggested(conn)
    final_orphans = count_orphans(conn)
    REPORT["phases"]["pipeline"] = {
        "asset_id": asset_id,
        "final_suggested": final_suggested,
        "final_orphans": final_orphans,
    }
    if final_suggested != 0:
        die(EXIT_CLEANUP, f"suggested != 0 after cleanup (got {final_suggested}) — the final bell")
    if final_orphans != 0:
        die(EXIT_CLEANUP, f"orphans != 0 after cleanup (got {final_orphans})")
    ok("suggested = 0 after cleanup (the final bell)")
    ok("orphans = 0 after cleanup")


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------


async def main() -> None:
    args = parse_args()
    _import_runtime_deps()

    env = assert_safety(args)
    print(f"Run dir:    {RUN_DIR}")
    print(f"Env:        {args.env}")
    print(f"Build:      {REPORT.get('build_id') or '(unknown)'}")
    print(f"Live URL:   {env['LIVE_URL']}")
    print(f"Admin:      {env['LIVE_ADMIN_EMAIL']}")

    conn = psycopg2.connect(env["LIVE_DATABASE_URL"])
    try:
        sql_ctx = phase_sql_verify(conn)
        await phase_ui_sweep(env, sql_ctx["main_ridge_id"])
        if not args.skip_pipeline:
            await phase_pipeline(env, conn, sql_ctx["main_ridge_id"])
        else:
            info("Phase 3 skipped (--skip-pipeline)")
    finally:
        conn.close()

    REPORT["exit_code"] = EXIT_OK
    REPORT["result"] = "PASS"
    REPORT["summary"] = "Knowledge Graph C.1b production-ready"
    write_report()
    print(f"\nPASS — Knowledge Graph C.1b is production-ready on {args.env.upper()}.")
    print(f"Report: {RUN_DIR / 'report.json'}")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except SystemExit:
        raise
    except Exception as e:  # noqa: BLE001
        REPORT["unhandled_exception"] = traceback.format_exc()
        die(EXIT_CONFIG, f"unhandled exception: {e}")
