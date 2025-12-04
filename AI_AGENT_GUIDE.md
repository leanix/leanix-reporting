# LeanIX Custom Reports - AI Agent Development Guide

---

## Your Mission

**Your goal is to help the user alter this LeanIX custom report.** You are working within a scaffolded custom report project that already has `@leanix/reporting` installed as a dependency. This guide contains the critical information you need to write correct, deployable code.

### Important Notes

Code that doesn't follow this guide will:

- **Fail to work correctly** due to wrong assumptions about the data model
- **Break in production** when deployed to LeanIX workspaces
- **Waste time** requiring complete rewrites
- **Violate platform requirements** and best practices

---

## Architecture Context

### How You Access Information

You have access to **LeanIX MCP Server tools** that allow you to:

- Discover available GraphQL types in the workspace schema
- Get detailed SDL definitions for specific types
- Access TypeScript definitions from `index.d.ts` with all `lxr` namespace types
- Load documentation and guides

---

## Iterative Development Cycle

**ALWAYS follow this cycle when working on custom reports:**

### 1. Write Code

- Implement the feature or fix
- Use TypeScript with proper types from `lxr` namespace
- Follow the patterns in this guide

### 2. Lint

- Run `npm run lint` to catch issues
- Fix any linting errors before proceeding
- Ensures code quality and consistency

### 3. Build

- Run `npm run build` to compile TypeScript
- Verify no compilation errors
- Checks type safety and build correctness

### 4. Test in Browser

- Run `npm run dev` to start the development server
- The terminal will output a LeanIX-hosted development URL
- Copy and open the complete URL in your browser
- Test using Chrome DevTools MCP server if available, or any browser automation tool
- Verify the report works as expected with real data

**Getting the Development URL:**

When you run `npm run dev`, the terminal will output a LeanIX-hosted development URL. **Always use this URL** instead of the local `localhost` URL.

Example output:

```
🚀 Your development server is available here =>
https://demo-eu-1.leanix.net/workspaceDemo/reporting/dev?url=https%3A%2F%2Flocalhost%3A5173#access_token=eyJraWQiOiI0MDJjOD.....
```

**Important:** Copy and open this complete URL in your browser. It provides:

- Live reload on code changes
- Real LeanIX workspace data
- Proper authentication
- Full LeanIX UI context

### 5. Repeat

- If issues found, go back to step 1
- Iterate until the report works correctly
- Only then consider the task complete

**Never skip steps!** Each step catches different classes of errors.

---

## Golden Rules

1. **NEVER hardcode data** - Always use LeanIX reporting framework APIs to fetch data dynamically
2. **ALWAYS verify the meta model** - Fact sheet types and fields vary per workspace
3. **PREFER facet-based filtering** - Facets provide automatic filtering UI in the left sidebar and handle data retrieval with built-in pagination and permissions
4. **USE available MCP tools** - Query the GraphQL schema to discover available types and fields

---

## Package & Import Context

The `@leanix/reporting` npm package is the runtime framework that connects reports to LeanIX workspaces. It is installed by default.

### Import Syntax

```typescript
import { lx, lxr } from "@leanix/reporting";

// lxr is the main namespace containing all types and interfaces
// lx is an instance of lxr.LxCustomReportLib that provides the runtime API

lx.init().then((setup) => {
  // setup contains lxr types and data
});
```

---

## Type Definitions Available

All types are available in the `lxr` namespace after importing from `@leanix/reporting`:

- `lxr.ReportSetup` - Initialization data
- `lxr.ReportConfiguration` - Config object structure
- `lxr.FactSheet` - Fact sheet data
- `lxr.ReportFacetsConfig` - Facet configuration
- `lxr.DataModel` - Meta model structure
- And 100+ more types for all framework features

**Access TypeScript definitions:**

- Use LeanIX MCP Server tools to access TypeScript definitions programmatically

**Note:** Types are accessed via the `lxr.` prefix after import, not globally.

---

## Understanding the Meta Model

**The meta model defines everything about a workspace's data structure.**

### Critical Concept

Every LeanIX workspace has a **unique meta model** that defines:

- Available fact sheet types (Application, ITComponent, BusinessCapability, etc.)
- Fields for each type (name, description, lifecycle, custom fields)
- Relations between types (Application → ITComponent, etc.)
- Lifecycle phases (Active, Plan, Phase Out, End of Life)
- Tag groups and custom constraints

**Important:** While base fields (id, name, displayName, type) are guaranteed via BaseFactSheet, they are all optional. Type-specific fields (lifecycle, technicalSuitability) and custom fields vary by workspace. Always verify field existence before use and use MCP tools to discover the workspace metamodel available fields.

### How to Verify the Meta Model

**Check for Available MCP Tools**

First, check if MCP tools are available to get workspace meta model information directly. If available, use them to discover the schema.

**Use MCP Tools to Build GraphQL Queries**

Use LeanIX MCP Server tools to get GraphQL type definitions during development:

**For GraphQL queries:**

- Always start with the `Query` type - it's the entry point for all GraphQL queries
- Request the type definition for `Query` to see all available query operations

**For fact sheet fields:**

- Request type definitions for specific fact sheet types (e.g., `Application`, `ITComponent`)
- Request `BaseFactSheet` to see common fields available on all fact sheets
- Request `AllFactSheetsBaseFactSheet` to see the GraphQL interface used by the `allFactSheets` query

**Process:**

1. Identify what you need (query operations vs. fact sheet fields)
2. Use MCP tools to request the appropriate type definition
3. Review the returned SDL (Schema Definition Language) to see available fields and types
4. Write your code based on the actual schema

The MCP tools provide detailed descriptions on how to use them - refer to their documentation for specific usage patterns.

**If MCP Tools Are Not Available**

Query the GraphQL schema directly:

```typescript
import { lx } from "@leanix/reporting";

// Query fact sheets directly
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

**Runtime Meta Model Access (Optional)**

**Note:** Runtime meta model access is optional. Runtime checks add unnecessary overhead through loops and validation logic. Use MCP tools during development to verify the schema instead.

```typescript
import { lx, lxr } from "@leanix/reporting";

async function bootstrap() {
  const setup = await lx.init();

  // Optional: Check what fact sheet types exist at runtime
  // WARNING: Adds execution overhead through loops and checks
  setup.settings.dataModel.factSheets.forEach((fs) => {
    console.log(fs.type); // e.g., "Application"
    console.log(fs.displayName); // Translated name

    // Check available fields
    fs.fields.forEach((field) => {
      console.log(field.key, field.type, field.displayName);
    });
  });
}
```

---

## Data Retrieval Patterns

### Pattern 1: Facet-Based Filtering (RECOMMENDED)

**Use this for 95% of data retrieval needs.**

Facets provide an automatic filtering UI in the left sidebar where users can filter data by various criteria.

```typescript
import { lx, lxr } from "@leanix/reporting";

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
    console.log(`Received ${data.length} applications`);
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

**Why facet-based filtering?**

- Automatic filtering UI in the left sidebar
- Handles pagination automatically
- Respects user permissions
- Consistent with LeanIX UX
- Less code to write

### Pattern 2: GraphQL Queries (Advanced)

**Use only when:**

- You need data in subsequent processing steps
- GraphQL Queries allow you to perform mutations
- Facets cannot express your requirements

**Before writing GraphQL queries:**

1. Use MCP tools to get the `Query` type definition to see available queries
2. Use MCP tools to get type definitions for specific fact sheet types (e.g., `Application`)
3. Then write your query based on the actual schema

```typescript
import { lx, lxr } from "@leanix/reporting";

// Query structure based on actual schema from MCP tools
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

- Field names must match meta model exactly (use MCP tools to verify!)
- Inline fragments required for type-specific fields
- Pagination must be handled manually
- No automatic filtering UI

---

## Chart Integration

### Using Chart.js (Recommended)

**Chart.js** is the default choice for visualizations:

- Simple, powerful API
- Excellent documentation
- Works perfectly with LeanIX styling
- Easy to maintain and customize
- Covers 95% of visualization needs

**Only consider alternatives when:**

- Chart.js cannot achieve the specific visualization requested
- User explicitly requests a specific charting library
- You have exhausted Chart.js capabilities and documented why it doesn't work

---

## UI Components & Styling

### Built-in LeanIX UI Components

**ALWAYS prefer built-in components:**

```typescript
// Show loading spinner
lx.showSpinner();
// ... fetch data ...
lx.hideSpinner();

// Show toast notifications
lx.showToastr("success", "Report loaded successfully");
lx.showToastr("error", "Failed to load data");
lx.showToastr("warning", "Some data is missing");
lx.showToastr("info", "Processing...");

// Display legend
lx.showLegend([
  { name: "Active", color: "#00aa00" },
  { name: "Phase Out", color: "#ff6600" },
  { name: "End of Life", color: "#cc0000" },
]);
```

### React Components

```tsx
import { lx, lxr } from "@leanix/reporting";
import { useState, useEffect } from "react";

interface AppCardProps {
  app: lxr.FactSheet;
}

const AppCard: React.FC<AppCardProps> = ({ app }) => {
  const handleClick = () => {
    lx.openLink(`/factsheet/Application/${app.id}`);
  };

  return (
    <div
      onClick={handleClick}
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
  );
};

const MyReport: React.FC = () => {
  const [apps, setApps] = useState<lxr.FactSheet[]>([]);

  useEffect(() => {
    lx.init().then((setup) => {
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
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
};
```

---

## Linking and Navigation

### Link to Fact Sheets

```typescript
// Link to specific fact sheet
lx.openLink(`/factsheet/Application/${factSheetId}`);

// Link with selected tab
lx.openLink(`/factsheet/Application/${factSheetId}?tab=relations`);
```

### Navigate to Inventory with Filters

```typescript
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

### Complete Configuration Example

```typescript
import { lxr } from "@leanix/reporting";

const config: lxr.ReportConfiguration = {
  // Required: Define data sources via facets
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

  // Optional: Custom dropdowns for user interaction
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

## Common Pitfalls & Solutions

### Pitfall 1: Hardcoded Field Names

```typescript
// BAD - Assumes field exists
const lifecycle = app.lifecycle.phase;

// GOOD - Check existence
const lifecycle = app.lifecycle?.phase || "Unknown";

// BETTER - Verify in meta model first via MCP tools
// Request type definition for "Application"
// Then check if lifecycle field exists in SDL
```

### Pitfall 2: Not Using MCP Tools for Schema Discovery

```typescript
// BAD - Guessing field names
const query = `
  query {
    allApplications {
      customField  # Does this exist?
    }
  }
`;

// GOOD - Use MCP tools first
// 1. Request type definition for "Query"
// 2. Request type definition for "Application"
// 3. Review SDL to see actual available fields
// 4. Write query based on actual schema
```

### Pitfall 3: Not Handling Empty States

Be aware that returned data might be empty and handle that accordingly.

---

## TypeScript Best Practices

```typescript
import { lx, lxr } from "@leanix/reporting";

// Type your report class
class MyReport {
  createConfig(): lxr.ReportConfiguration {
    return {
      /* ... */
    };
  }

  render(data: lxr.FactSheet[]): void {
    // Type-safe data access
  }
}

// Type your bootstrap
async function bootstrap(): Promise<void> {
  const setup: lxr.ReportSetup = await lx.init();
  const report = new MyReport();
  lx.ready(report.createConfig());
}
```

---

## Pre-Deploy Checklist

- [ ] Code follows patterns in this guide
- [ ] Used MCP tools to verify GraphQL schema
- [ ] No hardcoded fact sheet types or field names
- [ ] Empty states are handled gracefully
- [ ] Loading states use `lx.showSpinner()`
- [ ] Success/error feedback uses `lx.showToastr()`
- [ ] Links use `lx.openLink()` or `lx.navigateToInventory()`
- [ ] TypeScript types are used (no `any` types)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Tested in browser (`npm run dev` and test in browser using Chrome DevTools MCP or other tools)

---

## Quick Start Template

```typescript
import { lx, lxr } from "@leanix/reporting";

class CustomReport {
  createConfig(): lxr.ReportConfiguration {
    return {
      facets: [
        {
          key: "main",
          fixedFactSheetType: "Application", // Verify via MCP tools!
          attributes: ["name", "description"], // Verify field names via MCP tools!
          callback: (data) => this.render(data),
        },
      ],
    };
  }

  render(data: lxr.FactSheet[]): void {
    const root = document.getElementById("report");
    if (!root) return;

    // Handle empty state
    if (!data || data.length === 0) {
      root.innerHTML = "<p>No data available</p>";
      lx.showToastr("info", "No data to display");
      return;
    }

    // Render data
    root.innerHTML = `
      <h1>Report Results (${data.length})</h1>
      <ul>
        ${data.map((item) => `<li>${item.name}</li>`).join("")}
      </ul>
    `;

    lx.showToastr("success", `Loaded ${data.length} items`);
  }
}

async function bootstrap() {
  try {
    lx.showSpinner();

    const setup = await lx.init();
    const report = new CustomReport();

    lx.ready(report.createConfig());
  } catch (error) {
    console.error("Bootstrap failed:", error);
    lx.showToastr("error", "Failed to initialize report");
  } finally {
    lx.hideSpinner();
  }
}

bootstrap();
```

---

## Security & Best Practices

### Data Privacy

- **Never log sensitive data** - Fact sheet data may contain PII
- **Respect permissions** - Facets handle this automatically
- **Don't expose API tokens** - Handled by framework

### Performance

- **Use pagination** - Don't fetch all data at once
- **Debounce user input** - Avoid excessive re-renders
- **Lazy load charts** - Render only visible data

### Code Quality

- **No magic numbers** - Use constants
- **No hardcoded strings** - Use meta model via MCP tools
- **Handle errors gracefully** - Always catch and show feedback
- **Type everything** - Use TypeScript types from `lxr` namespace
- **Follow the cycle** - Write → Lint → Build → Test → Repeat

---

**Your goal: Help the user alter this custom report correctly, following these guidelines strictly.**
