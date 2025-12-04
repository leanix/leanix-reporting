# LeanIX Custom Reports - AI Agent Development Guide

---

## Your Mission

**Your goal is to help the user alter this LeanIX custom report.** You are working within a scaffolded custom report project that already has `@leanix/reporting` installed as a dependency.

---

## Package & Import Context

The `@leanix/reporting` npm package is the runtime framework that connects reports to LeanIX workspaces. It is installed by default.

**All code examples in this guide assume this import:**

```typescript
import { lx, lxr } from "@leanix/reporting";
```

- `lxr` is the main namespace containing all types and interfaces
- `lx` is an instance of `lxr.LxCustomReportLib` that provides the runtime API

---

## Schema Discovery with MCP Tools

**Before writing any code, use MCP tools to discover the workspace schema.**

You have access to **LeanIX MCP Server tools** that provide:

- **GraphQL type definitions** - Request SDL for types like `Query`, `Application`, `ITComponent`, `BaseFactSheet`
- **TypeScript definitions** - Access TypeScript definitions from the `@leanix/reporting` package
- **Available types listing** - Discover all GraphQL types in the workspace

### Discovery Process

1. **Identify what you need** - Query operations? Fact sheet fields? Relations?
2. **Request type definitions** - Use MCP tools to get SDL for specific types
3. **Review the schema** - Check available fields, their types, and whether they're optional
4. **Write code** - Use the actual schema, not assumptions

**Example:** To query applications, first request the `Query` type definition to see available queries, then request the `Application` type definition to see available fields.

**The MCP tools provide detailed usage instructions - refer to their documentation.**

---

## Iterative Development Cycle

**Follow this cycle for every change:**

1. **Write Code** - Implement using TypeScript with `lxr` types
2. **Lint** - Run `npm run lint` to catch issues
3. **Test** - Run `npm run dev` and test in browser
4. **Repeat** - Iterate until working

**Note:** The dev server handles compilation automatically. Only run `npm run build` before uploading to LeanIX.

### Testing Your Report

Run `npm run dev` to get a **LeanIX-hosted development URL** (not localhost). Copy the complete URL from the terminal output and open it in your browser for live testing with real workspace data.

---

## Golden Rules

1. **NEVER hardcode data** - Always fetch dynamically via LeanIX APIs
2. **ALWAYS verify the schema first** - Use MCP tools before writing queries
3. **PREFER facet-based filtering** - Provides automatic UI, pagination, and permissions
4. **HANDLE null values** - Use optional chaining (`?.`) as fields may be null

---

## Understanding the Meta Model

Every LeanIX workspace has a **unique meta model** defining:

- Available fact sheet types (Application, ITComponent, BusinessCapability, etc.)
- Fields for each type (name, description, lifecycle, custom fields)
- Relations between types
- Lifecycle phases and tag groups

**Critical:** While `BaseFactSheet` defines common fields (id, name, displayName, type), these fields exist on all fact sheets but their **values may be null**. Type-specific fields (lifecycle, technicalSuitability) and custom fields vary by workspace. Always use optional chaining (`?.`) and verify fields exist.

### Verifying the Schema

**Primary Method: Use MCP Tools**

See "Schema Discovery with MCP Tools" section above.

**Fallback: Query GraphQL Directly**

```typescript
const result = await lx.executeGraphQL(`{
  allFactSheets(factSheetType: Application) {
    edges {
      node {
        id
        name
        type
        description
      }
    }
  }
}`);
```

---

## Type Definitions Available

All types are in the `lxr` namespace after importing from `@leanix/reporting`:

- `lxr.ReportSetup` - Initialization data
- `lxr.ReportConfiguration` - Config object structure
- `lxr.FactSheet` - Fact sheet data
- `lxr.ReportFacetsConfig` - Facet configuration
- `lxr.DataModel` - Meta model structure
- And 100+ more types

---

## Data Retrieval Patterns

### Pattern 1: Facet-Based Filtering (RECOMMENDED)

**Use this for 95% of data retrieval needs.**

Facets provide automatic filtering UI in the left sidebar, handle pagination, respect permissions, and provide consistent UX.

```typescript
class MyReport {
  createConfig(): lxr.ReportConfiguration {
    return {
      facets: [
        {
          key: "main",
          fixedFactSheetType: "Application",
          attributes: ["name", "description", "lifecycle"],
          callback: (data) => this.render(data),
        },
      ],
    };
  }

  render(data: lxr.FactSheet[]) {
    if (!data?.length) return;

    data.forEach((app) => {
      console.log(app.name, app.lifecycle?.phase);
    });
  }
}

async function bootstrap() {
  const setup = await lx.init();
  const report = new MyReport();
  lx.ready(report.createConfig());
}

bootstrap();
```

### Pattern 2: GraphQL Queries (Advanced)

**Use only when:**

- You need to **write data** (perform mutations)
- You need data for subsequent processing (not just display)
- Facets cannot express your filtering requirements

**Always use MCP tools to discover the schema first** (see "Schema Discovery with MCP Tools" section).

```typescript
// Example: Query structure based on actual schema from MCP tools
const result = await lx.executeGraphQL(`{
  allFactSheets(factSheetType: Application, first: 50) {
    edges {
      node {
        id
        name
        type
        description
        ... on Application {
          lifecycle { phase }
        }
      }
    }
  }
}`);
```

**GraphQL Gotchas:**

- Field names must match schema exactly
- Inline fragments required for type-specific fields
- Manual pagination required
- No automatic filtering UI

---

## Chart Integration

### Using Chart.js (Recommended)

**Chart.js** is the default choice - it covers 95% of visualization needs with excellent LeanIX styling compatibility.

**Alternatives:** If Chart.js cannot achieve the visualization, ask the user which library they prefer (D3.js, Recharts, etc.) or if they have specific requirements.

---

## UI Components & Styling

### Built-in LeanIX Components

**Always prefer built-in components:**

```typescript
// Loading states
lx.showSpinner();
lx.hideSpinner();

// User feedback
lx.showToastr("success", "Report loaded successfully");
lx.showToastr("error", "Failed to load data");
lx.showToastr("warning", "Some data is missing");
lx.showToastr("info", "Processing...");

// Legend
lx.showLegend([
  { name: "Active", color: "#00aa00" },
  { name: "Phase Out", color: "#ff6600" },
  { name: "End of Life", color: "#cc0000" },
]);
```

### React Integration

Focus on LeanIX-specific parts:

```tsx
import { useState, useEffect } from "react";

const MyReport: React.FC = () => {
  const [apps, setApps] = useState<lxr.FactSheet[]>([]);

  useEffect(() => {
    lx.init().then(() => {
      lx.ready({
        facets: [
          {
            key: "main",
            fixedFactSheetType: "Application",
            attributes: ["name", "description"],
            callback: setApps,
          },
        ],
      });
    });
  }, []);

  const handleClick = (app: lxr.FactSheet) => {
    lx.openLink(`/factsheet/Application/${app.id}`);
  };

  if (!apps.length) return <p>No data available</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Applications ({apps.length})</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
      >
        {apps.map((app) => (
          <div
            key={app.id}
            onClick={() => handleClick(app)}
            style={{
              border: "1px solid #ddd",
              padding: "12px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            <h3>{app.name}</h3>
            <p>{app.description || "No description"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## Linking and Navigation

```typescript
// Link to fact sheet
lx.openLink(`/factsheet/Application/${factSheetId}`);

// Link with specific tab
lx.openLink(`/factsheet/Application/${factSheetId}?tab=relations`);

// Open filtered Inventory factsheets view
lx.navigateToInventory({
  factSheetType: "Application",
  filters: {
    lifecycle: ["Active"],
    tags: ["Production"],
  },
});
```

---

## Report Configuration Reference

```typescript
const config: lxr.ReportConfiguration = {
  facets: [
    {
      key: "main",
      fixedFactSheetType: "Application",
      attributes: ["name", "description", "lifecycle", "tags"],
      callback: (data) => this.renderApplications(data),
    },
    {
      key: "components",
      fixedFactSheetType: "ITComponent",
      attributes: ["name", "category"],
      callback: (data) => this.renderComponents(data),
    },
  ],

  menuActions: {
    dropdowns: [
      {
        id: "viewMode",
        name: "View Mode",
        entries: [
          { id: "grid", label: "Grid View" },
          { id: "list", label: "List View" },
        ],
        callback: (selected) => this.changeView(selected),
      },
    ],
  },
};
```

---

## Uploading to LeanIX

Once your report is ready, upload it to your LeanIX workspace:

1. **Build the report** - Run `npm run build` to create production bundle
2. **Upload to workspace** - Run `npm run upload` (executes `vite build --mode upload`)
3. **Verify upload** - Check console output for success message, then confirm in Administration > Reports

---

## Pre-Upload Checklist

Before uploading your report:

- [ ] **Schema verified** - Used MCP tools to verify all field names and types
- [ ] **No hardcoded assumptions** - All fact sheet types and field names verified
- [ ] **Empty states handled** - Code handles null/undefined/empty data gracefully
- [ ] **Loading states** - Uses `lx.showSpinner()` / `lx.hideSpinner()`
- [ ] **User feedback** - Uses `lx.showToastr()` for success/error messages
- [ ] **Navigation** - Uses `lx.openLink()` or `lx.navigateToInventory()`
- [ ] **TypeScript types** - No `any` types, uses `lxr` namespace types
- [ ] **Linting passes** - `npm run lint` succeeds
- [ ] **Build succeeds** - `npm run build` succeeds
- [ ] **Browser tested** - `npm run dev` tested in browser with real data
- [ ] **Credentials configured** - `lxr.json` has a host URL and token

---

## LeanIX-Specific Requirements

### Data Privacy

- **Never log sensitive data** - Fact sheet data may contain PII
- **Don't expose API tokens** - Handled by framework

### Performance

- **Facets handle pagination** - No manual implementation needed
- **Lazy load large visualizations** - Render only visible data

---

**Your goal: Help the user alter this custom report correctly, following these guidelines strictly.**
