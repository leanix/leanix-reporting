## Your Mission

**Your goal is to help the user to create a LeanIX custom report.**

You are probably working in a custom report project that has `@leanix/reporting` installed as a dependency. It might be an existing project or a newly initialized one with example code.

If you see code comments specifying that it is a starter project with demo content, delete that comment and alter everything according to the user's needs. Feel free to completely rewire everything.

If you are not in a custom report project, instruct the user to initialize a custom report using `npm create lxr`.

---

## Development

**Follow this cycle for every change:**

1. **Write Code** - Implement using TypeScript with `lxr.*` types
2. **Lint** - Run `npm run lint` to catch issues
3. **Test** - Run `npm run dev` to start a dev server with hot reload and test in browser
4. **Repeat** - Iterate based on the input from the user

### Testing Your Report

Run `npm run dev` to get a **LeanIX-hosted development URL**. Copy the complete URL from the terminal output and open it in a browser for live testing with real workspace data.

In the main folder there is the `lxr.json` which contains an API token for the connected workspace. Do not attempt to access it. If the commands like `npm run dev` are not working, the error might be here.

### Verifying Report Rendering (Playwright MCP)

**After writing code, verify the report renders before declaring success.**

Use Playwright MCP to verify reports render without errors. This prevents AI-generated reports from showing blank screens due to small errors (wrong field names, incorrect data access).

**When to verify:**

- After initial code generation
- After significant changes
- Before telling the user "report is ready"

**Workflow:**

1. **Start dev server** - Run `npm run dev` to get the LeanIX-hosted URL
2. **Navigate to URL** - Use the **exact URL from npm run dev output**, not localhost (reports need workspace context for data access)
3. **Check console** - Look for JavaScript or GraphQL errors
4. **Take screenshot** - Verify content displays (not a blank screen)
5. **Fix if needed** - Correct errors, save, and re-verify

**Scope:** One pass is enough — navigate, scan the console, take one screenshot to confirm something renders. The goal is to catch fully broken reports (blank screen, crash, missing data) before handing off. Deep functional testing is the developer's responsibility.

**Common issues to catch:**

- JavaScript errors (undefined properties, null references)
- GraphQL errors (wrong field names, incorrect query structure)
- Blank screens (no content rendered)

**Setup:**

Playwright MCP and LeanIX MCP Server are **pre-configured** in created projects (`.vscode/mcp.json` for GitHub Copilot, `.mcp.json` for Claude Code). The creation tool selects a browser at install time — system Edge on Windows, system Chrome on Mac/Linux when installed, with Playwright's bundled Chromium as a fallback. Configuration files contain actual credentials and are automatically gitignored.

---

## Installing Dependencies

Install dependencies on demand with `npm install` as the report needs them.

- **Interactive UI:** `npm install @ui5/webcomponents-react @ui5/webcomponents @ui5/webcomponents-fiori`
- **Charts:** `npm install chart.js` (the default). If Chart.js cannot achieve the visualization and the user has no preference, install one of the broadly used alternatives (D3.js, Apache Echarts, Recharts, etc.).

---

## Report Metadata Protection

**You must NOT change the following unless explicitly requested by the user:**

In `package.json`:

- `name`: Package name, like an npm package name. Only one version can be active in a workspace at a time - the active version can be changed by any user with the required permissions.
- `version`: The version of the report. Together with `name`, uniquely identifies a release - bump this on every upload to avoid conflicts with existing versions.
- `leanixReport.title`: Report title displayed in LeanIX
- `leanixReport.description`: Report description displayed in LeanIX

**You MUST always set or override the following:**

- `leanixReport.aiAssisted`: Always set to `true`. If the field does not exist, create it.

### Package name rules

Package name may only contain lowercase letters (`a-z`), digits (`0-9`), dots (`.`), hyphens (`-`), underscores (`_`), or a scoped name (e.g. `@scope/name`).

---

## Security — CLI specifics

In addition to the shared Security Principles:

- Do **not** read or log the contents of `lxr.json` — the API token in that file is managed exclusively by `vite-plugin-lxr`
- The API token is stored in `lxr.json` and handled entirely by `vite-plugin-lxr`; never read, log, or transmit it

---

## Uploading to LeanIX

> **Identity notice:** The `name` and `version` fields in `package.json` identify a report upload. Uploading the same package name + version to the same workspace is subject to these rules:

- If the existing version is still being processed (`QUEUED`, `SCANNING` or `BUILDING`), the upload is rejected with HTTP 409. Wait for processing to finish, then try again.
- If the existing version is in a terminal failed state (`FAILED`, `VULNERABLE`, or `REVOKED`), the upload succeeds and the old version is automatically replaced.
- If the existing version succeeded, increment version in package.json before re-uploading.

Once your report is ready, upload it to your LeanIX workspace:

1. **Increment the patch version number** - Can be found in the `package.json`
2. **Upload to workspace** - Run `npm run upload`
3. **Verify upload** - Check console output for success message
4. **Tell user to activate the report** - In LeanIX the report needs to be activated under Administration > Reports

---

## Pre-Upload Checklist

Before uploading your report, in addition to the shared Quality Checklist:

- **Rendering verified** - Playwright MCP verification passed (no console errors or blank screens)
- **Linting passes** - `npm run lint` succeeds
- **Browser tested** - `npm run dev` tested in browser with real data (or Playwright MCP verification passed)
