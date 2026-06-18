# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Prerender verification

After every build, `scripts/verify-prerender.ts` checks that each prerendered route ships the correct head tags (`og:image`, `twitter:image`, `canonical`, route-specific alt text, and more). It can emit a machine-readable JSON report and validate that report against a JSON Schema so downstream tooling never receives malformed output.

### JSON report

Generate the report by passing `--json` (default path) or `--json=<path>`:

```bash
bun run build
bunx tsx scripts/verify-prerender.ts --json
```

This writes `dist/prerender-verify.json` and validates it automatically against `scripts/prerender-verify.schema.json`.

Re-verify only the routes that failed:

```bash
bunx tsx scripts/verify-prerender.ts --only="/about,/arenas"
```

### Schema location and required fields

| File | Purpose |
|------|---------|
| `scripts/prerender-verify.schema.json` | JSON Schema (Draft-07) consumed by the verifier to validate every report |

The report object must contain these top-level fields:

- `timestamp` — ISO 8601 date-time of report generation  
- `siteOrigin` — canonical origin used for self-reference checks  
- `checked` — total routes evaluated (integer)  
- `passed` — routes with zero failures (integer)  
- `failed` — routes with at least one failure (integer)  
- `allPassed` — boolean, `true` when no failures were found  
- `rerunCommand` — shell command to re-verify only the failing routes  
- `routes` — array of per-route results, each with:  
  - `path` — route path (e.g. `/about`)  
  - `file` — absolute path to the prerendered HTML file that was checked  
  - `passed` — boolean  
  - `failures` — array of failure objects, each with `route`, `check`, and `detail`

If the report fails schema validation, the verifier logs the mismatch, records a `_report` level failure, and still exits non-zero so CI catches it.
