# LeanIX Custom Reports - AI Agent Development Guide

---

## 🎯 Your Mission

**Your goal is to help the user alter this LeanIX custom report.** You are working within a scaffolded custom report project that already has `@leanix/reporting` installed as a dependency. This guide contains the critical information you need to write correct, deployable code.

---

## 🚨 MANDATORY - READ THIS FIRST 🚨

**STOP!** Before you write ANY code for this custom report:

**YOU MUST READ THIS ENTIRE GUIDE.** This is **NOT optional**. This is **MANDATORY**.

### ⚠️ Why This Matters

Code that doesn't follow this guide will:

- ❌ **Fail to work correctly** due to wrong assumptions about the data model
- ❌ **Break in production** when deployed to LeanIX workspaces
- ❌ **Waste time** requiring complete rewrites
- ❌ **Violate platform requirements** and best practices

**This enforcement exists because AI agents frequently skip documentation and make incorrect assumptions that lead to non-deployable code. Do not be that agent.**

---

## 🏗️ Architecture Context

### How You Access Information

Based on the current architecture, you have access to these **LeanIX MCP Server tools**:

1. **`list_graphql_types`** - Discover available GraphQL types in the workspace schema
2. **`get_graphql_type_definition`** - Get detailed SDL definitions for specific types
3. **`get_ai_agent_guide`** - Load this guide (you're reading it now)
4. **`get_reporting_ts_definition`** - Access TypeScript definitions from `index.d.ts` with all `lxr` namespace types

---

## 🔄 Iterative Development Cycle

**ALWAYS follow this cycle when working on custom reports:**

### 1. **Write Code** 📝

- Implement the feature or fix
- Use TypeScript with proper types from `lxr` namespace
- Follow the patterns in this guide

### 2. **Lint** 🔍

- Run `npm run lint` to catch issues
- Fix any linting errors before proceeding
- Ensures code quality and consistency

### 3. **Build** 🔨

- Run `npm run build` to compile TypeScript
- Verify no compilation errors
- Checks type safety and build correctness

### 4. **Test in Browser** 🌐

- **Option A**: Use Chrome DevTools MCP server if available
  - Provides automated browser testing
  - Can interact with the report programmatically
- **Option B**: Use any available browser automation tool
- Verify the report works as expected with real data

**Getting the Development URL:**

When you run `npm run dev`, the terminal will output a LeanIX-hosted development URL. **Always use this URL** instead of the local `localhost` URL.

Example output:

```
🚀 Your development server is available here =>
https://demo-eu-1.leanix.net/workspaceDemo/reporting/dev?url=https%3A%2F%2Flocalhost%3A5173#access_token=eyJraWQiOiI0MDJjOD.....
```

**URL Structure:**

- `demo-eu-1` - Instance from `lxr.json` `host` attribute
- `workspaceDemo` - Your workspace ID
- `access_token` - Your user access token
- The URL automatically connects your local dev server to the LeanIX workspace

**Important:** Copy and open this complete URL in your browser. It provides:

- ✅ Live reload on code changes
- ✅ Real LeanIX workspace data
- ✅ Proper authentication
- ✅ Full LeanIX UI context

### 5. **Repeat** 🔁

- If issues found, go back to step 1
- Iterate until the report works correctly
- Only then consider the task complete

**Never skip steps!** Each step catches different classes of errors.

---

## 🎯 Golden Rules

1. **NEVER hardcode data** - Always use LeanIX reporting framework APIs to fetch data dynamically
2. **ALWAYS verify the meta model** - Fact sheet types and fields vary per workspace
3. **PREFER facet-based filtering** - Use facets for data retrieval (GraphQL only for advanced cases)
4. **USE available MCP tools** - Query GraphQL schema via `list_graphql_types` and `get_graphql_type_definition`

---

## 📦 Package & Import Context

This guide is part of the `@leanix/reporting` npm package, which is:

- **Already installed** in this custom report project as a dependency
- **The runtime framework** that connects reports to LeanIX workspaces
- **Provides all necessary types** and runtime APIs

### Import Syntax

```typescript
import { lx, lxr } from "@leanix/reporting";

// Use lx and lxr objects
lx.init().then((setup) => {
  // setup contains lxr types and data
});
```

---

## 🧬 Understanding the Meta Model

**The meta model defines everything about a workspace's data structure.**

### Critical Concept

Every LeanIX workspace has a **unique meta model** that defines:

- Available fact sheet types (Application, ITComponent, BusinessCapability, etc.)
- Fields for each type (name, description, lifecycle, custom fields)
- Relations between types (Application → ITComponent, etc.)
- Lifecycle phases (Active, Plan, Phase Out, End of Life)
- Tag groups and custom constraints

**⚠️ NEVER assume standard field names or types exist!**

### How to Verify the Meta Model

**Use the LeanIX MCP Server tools:**

```typescript
// Step 1: List available types
// Call MCP tool: list_graphql_types()
// Returns: ["Application", "ITComponent", "BusinessCapability", ...]

// Step 2: Get detailed schema for specific type
// Call MCP tool: get_graphql_type_definition(type_name="Application")
// Returns: SDL definition with all fields, types, and descriptions
```

### Accessing Meta Model at Runtime

```typescript
import { lx, lxr } from "@leanix/reporting";

async function bootstrap() {
  const setup = await lx.init();

  // Check what fact sheet types exist
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

### Before Writing ANY Code

1. **Use MCP tools** to query the GraphQL schema
2. **Verify the fact sheet type exists** in the workspace
3. **Check field names** via `get_graphql_type_definition`
4. **Confirm relations** - cardinality and direction matter
5. **Review lifecycle phases** - custom phases are common

**Example - Don't assume "Application" exists:**

```typescript
// ❌ BAD - Assumes "Application" exists
const config = {
  facets: [{ fixedFactSheetType: 'Application', ... }]
}

// ✅ GOOD - Verify first via MCP tools or runtime meta model
const setup = await lx.init();
const hasApplications = setup.settings.dataModel.factSheets
  .some(fs => fs.type === 'Application');

if (!hasApplications) {
  throw new Error('Application type not found in workspace');
}
```

---

## 🎨 Technology Stack Opinions

### Data Retrieval

**Preference Order:**

1. **Facet-Based Filtering** ⭐⭐⭐⭐⭐ (Use this by default)

   - Automatic filtering UI
   - Built-in pagination
   - Respects permissions
   - Less code to write

2. **GraphQL Queries** ⭐⭐ (Advanced cases only)
   - For subsequent data processing
   - For mutations
   - When facets can't express requirements

### Charting Libraries

**Always Use Chart.js:**

**Chart.js** ⭐⭐⭐⭐⭐ (Default Choice)

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

## 🔄 Data Retrieval Patterns

### Pattern 1: Facet-Based Filtering (RECOMMENDED)

**Use this for 95% of data retrieval needs.**

```typescript
import { lx, lxr } from "@leanix/reporting";

class MyReport {
  private setup: lxr.ReportSetup;

  constructor(setup: lxr.ReportSetup) {
    this.setup = setup;
  }

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
  const report = new MyReport(setup);
  lx.ready(report.createConfig());
}

bootstrap();
```

**Why facet-based filtering?**

- ✅ Automatic filtering UI in LeanIX
- ✅ Handles pagination automatically
- ✅ Respects user permissions
- ✅ Consistent with LeanIX UX
- ✅ Less code to write

### Pattern 2: GraphQL Queries (Advanced)

**Use only when:**

- You need data in subsequent processing steps
- You need to perform mutations
- Facets cannot express your requirements

**Before writing GraphQL queries:**

1. Use MCP tool `list_graphql_types()` to see available types
2. Use MCP tool `get_graphql_type_definition(type_name="Application")` to see fields
3. Then write your query based on the actual schema

```typescript
import { lx, lxr } from "@leanix/reporting";

// Query structure based on actual schema from MCP tools
const query = `
  query GetApplications {
    allFactSheets(factSheetType: Application, first: 50) {
      edges {
        node {
          id
          name
          ... on Application {
            lifecycle { phase }
          }
        }
      }
    }
  }
`;

const result = await lx.executeGraphQL(query);
```

**⚠️ GraphQL Gotchas:**

- Field names must match meta model exactly (use MCP tools to verify!)
- Inline fragments required for type-specific fields
- Pagination must be handled manually
- No automatic filtering UI

---

## 🎨 UI Components & Styling

### Built-in LeanIX UI Components

**ALWAYS prefer built-in components:**

```typescript
// ✅ Show loading spinner
lx.showSpinner();
// ... fetch data ...
lx.hideSpinner();

// ✅ Show toast notifications
lx.showToastr("success", "Report loaded successfully");
lx.showToastr("error", "Failed to load data");
lx.showToastr("warning", "Some data is missing");
lx.showToastr("info", "Processing...");

// ✅ Display legend
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

## 📊 Chart Integration

### Using Chart.js (Recommended)

```typescript
import { lxr } from "@leanix/reporting";
import Chart from "chart.js/auto";

function renderChart(data: lxr.FactSheet[]) {
  const ctx = document.getElementById("myChart") as HTMLCanvasElement;

  // Count applications by lifecycle phase
  const phaseCounts = data.reduce((acc, app) => {
    const phase = app.lifecycle?.phase || "Unknown";
    acc[phase] = (acc[phase] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(phaseCounts),
      datasets: [
        {
          label: "Applications by Lifecycle",
          data: Object.values(phaseCounts),
          backgroundColor: [
            "#00aa00", // Active
            "#ff6600", // Phase Out
            "#cc0000", // End of Life
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        title: { display: true, text: "Application Lifecycle Distribution" },
      },
    },
  });
}
```

---

## 🔗 Linking and Navigation

### Link to Fact Sheets

```typescript
// Link to specific fact sheet
lx.openLink(`/factsheet/Application/${factSheetId}`);

// Link with selected tab
lx.openLink(`/factsheet/Application/${factSheetId}?tab=relations`);
```

### Navigate to Inventory with Filters

```typescript
// Open filtered Inventory view
lx.navigateToInventory({
  factSheetType: "Application",
  filters: {
    lifecycle: ["Active"],
    tags: ["Production"],
  },
});
```

---

## 📋 Report Configuration Reference

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

## 🚨 Common Pitfalls & Solutions

### Pitfall 1: Hardcoded Field Names

```typescript
// ❌ BAD - Assumes field exists
const lifecycle = app.lifecycle.phase;

// ✅ GOOD - Check existence
const lifecycle = app.lifecycle?.phase || "Unknown";

// ✅ BETTER - Verify in meta model first via MCP tools
// Use: get_graphql_type_definition(type_name="Application")
// Then check if lifecycle field exists in SDL
```

### Pitfall 2: Not Using MCP Tools for Schema Discovery

```typescript
// ❌ BAD - Guessing field names
const query = `
  query {
    allApplications {
      customField  # Does this exist?
    }
  }
`;

// ✅ GOOD - Use MCP tools first
// 1. Call: list_graphql_types(filter="Application")
// 2. Call: get_graphql_type_definition(type_name="Application")
// 3. Review SDL to see actual available fields
// 4. Write query based on actual schema
```

### Pitfall 3: Not Handling Empty States

```typescript
// ❌ BAD - Crashes if no data
render(data: lxr.FactSheet[]) {
  const html = data.map(item => `...`).join('');
  root.innerHTML = html;
}

// ✅ GOOD - Handle empty case
render(data: lxr.FactSheet[]) {
  if (!data || data.length === 0) {
    root.innerHTML = '<p>No data available. Try adjusting filters.</p>';
    return;
  }

  const html = data.map(item => `...`).join('');
  root.innerHTML = html;
}
```

### Pitfall 4: Not Using TypeScript Types

```typescript
// ❌ BAD - Using 'any' types
function render(data: any) {
  data.forEach((item: any) => {
    console.log(item.name);
  });
}

// ✅ GOOD - Use proper types from lxr namespace
function render(data: lxr.FactSheet[]) {
  data.forEach((item) => {
    console.log(item.name); // Type-safe!
  });
}
```

---

## 📝 TypeScript Best Practices

### Use Proper Types

```typescript
import { lx, lxr } from "@leanix/reporting";

// ✅ Type your report class
class MyReport {
  private setup: lxr.ReportSetup;

  constructor(setup: lxr.ReportSetup) {
    this.setup = setup;
  }

  createConfig(): lxr.ReportConfiguration {
    return {
      /* ... */
    };
  }

  render(data: lxr.FactSheet[]): void {
    // Type-safe data access
  }
}

// ✅ Type your bootstrap
async function bootstrap(): Promise<void> {
  const setup: lxr.ReportSetup = await lx.init();
  const report = new MyReport(setup);
  lx.ready(report.createConfig());
}
```

### Type Definitions Available

All types are in the `lxr` namespace (available globally after import):

- `lxr.ReportSetup` - Initialization data
- `lxr.ReportConfiguration` - Config object structure
- `lxr.FactSheet` - Fact sheet data
- `lxr.ReportFacetsConfig` - Facet configuration
- `lxr.DataModel` - Meta model structure
- And 100+ more types for all framework features

**Access TypeScript definitions:**

- Use your IDE's autocomplete to explore available types
- Use LeanIX MCP Server tool `get_reporting_ts_definition` to access definitions programmatically

---

## 🧪 Development & Testing Workflow

### The Complete Cycle

```bash
# 1. Write code (this step)
# Edit your TypeScript/React files

# 2. Lint
npm run lint
# Fix any linting errors

# 3. Build
npm run build
# Fix any compilation errors

# 4. Test in browser
npm run dev
# The terminal will output a LeanIX-hosted development URL
# Copy and open the complete URL from terminal output (includes workspace and auth)
# Example: https://demo-eu-1.leanix.net/workspaceDemo/reporting/dev?url=https%3A%2F%2Flocalhost%3A5173#access_token=...
# OR use Chrome DevTools MCP server if available for automated testing
# Verify report works with real data

# 5. Repeat if needed
# Go back to step 1 if issues found

# When satisfied:
npm run upload
# Deploy to LeanIX workspace
```

### Pre-Deploy Checklist

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
- [ ] Tested in browser (`npm run dev` or Chrome DevTools MCP)

---

## 🎯 Decision Trees

### Data Retrieval Decision

```
Need to get data?
├─ Is it the main report data? → Use FACETS ⭐
├─ Need it for subsequent processing? → Use GRAPHQL
├─ Need to mutate data? → Use GRAPHQL
└─ Everything else → Use FACETS (default) ⭐
```

### Charting Decision

```
Need to show chart?
└─ ALWAYS start with Chart.js ⭐
   └─ Only use alternatives if Chart.js cannot achieve the visualization
      AND you've documented why Chart.js doesn't work
```

### Schema Discovery Decision

```
Need to know available types/fields?
├─ First time? → Use list_graphql_types() ⭐
├─ Need field details? → Use get_graphql_type_definition() ⭐
├─ At runtime? → Access setup.settings.dataModel
└─ TypeScript types? → Use get_reporting_ts_definition() ⭐
```

---

## 🛠️ Available MCP Server Tools

### GraphQL Schema Tools

**`list_graphql_types(filter?: string)`**

- Lists all available GraphQL types in the workspace
- Optional filter for substring matching
- Use this first to discover types

**`get_graphql_type_definition(type_name: string)`**

- Returns SDL definition for a specific type
- Shows all fields, types, descriptions
- Use after `list_graphql_types` to get details

### TypeScript Definitions Tool

**`get_reporting_ts_definition()`**

- Returns TypeScript definitions `index.d.ts`
- Provides all `lxr` namespace types and interfaces
- Useful for understanding available types and their structure
- Access programmatically when you need type information

**Example workflow:**

```typescript
// 1. Discover types
// Call: list_graphql_types(filter="Application")
// Result: ["Application", "ApplicationConnection", "ApplicationEdge", ...]

// 2. Get details for Application
// Call: get_graphql_type_definition(type_name="Application")
// Result: SDL showing all fields like:
// type Application implements FactSheet {
//   id: ID!
//   name: String!
//   description: String
//   lifecycle: Lifecycle
//   ...
// }

// 3. Now write code with confidence
const config = {
  facets: [
    {
      fixedFactSheetType: "Application",
      attributes: ["name", "description", "lifecycle"], // These exist!
      callback: (data) => this.render(data),
    },
  ],
};
```

---

## 🚀 Quick Start Template

```typescript
import { lx, lxr } from "@leanix/reporting";

class CustomReport {
  private setup: lxr.ReportSetup;

  constructor(setup: lxr.ReportSetup) {
    this.setup = setup;
  }

  createConfig(): lxr.ReportConfiguration {
    return {
      facets: [
        {
          key: "main",
          fixedFactSheetType: "Application", // Verify via MCP tools!
          attributes: ["name", "description"], // Check via get_graphql_type_definition!
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
    const report = new CustomReport(setup);

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

## 🔒 Security & Best Practices

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

## 📞 Support & Resources

**When you encounter issues:**

1. **Use MCP tools** - Query GraphQL schema with `list_graphql_types` and `get_graphql_type_definition`
2. **Check the runtime meta model** - Access via `setup.settings.dataModel`
3. **Review TypeScript types** - The `lxr` namespace has all definitions
4. **Follow the development cycle** - Write → Lint → Build → Test → Repeat
5. **Test with dev server** - `npm run dev` for immediate feedback

**Remember:**

- This guide is part of `@leanix/reporting` package
- Accessed via LeanIX MCP Server tool `get_ai_agent_guide`
- Single source of truth for AI-assisted custom report development

---

## 📚 Summary

### What You Must Do

1. ✅ **Read this guide completely** before writing code
2. ✅ **Use MCP tools** to query GraphQL schema before making assumptions
3. ✅ **Follow the development cycle**: Write → Lint → Build → Test → Repeat
4. ✅ **Prefer facets over GraphQL** for data retrieval
5. ✅ **Use proper TypeScript types** from `lxr` namespace
6. ✅ **Test in browser** before considering task complete

### What You Must NOT Do

1. ❌ **Don't hardcode** fact sheet types or field names
2. ❌ **Don't assume** fields exist without verification
3. ❌ **Don't skip** the iterative development cycle steps
4. ❌ **Don't use** the side-effect import syntax (import "@leanix/reporting")
5. ❌ **Don't write** GraphQL queries without checking schema via MCP tools
6. ❌ **Don't deploy** without testing in browser first

**Your goal: Help the user alter this custom report correctly, following these guidelines strictly.**
