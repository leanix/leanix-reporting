# LeanIX Custom Reports - AI Agent Development Guide

---

## Your Mission

**Your goal is to help the user to create a LeanIX custom report.**

You are probably working in a custom report project that has `@leanix/reporting` installed as a dependency.
It might be an existing project or a newly initialized one with example code.

If you see code comments specifying that it is a starter project with demo content, delete that comment and alter everything according to the user's needs. Feel free to completely rewire everything.

If you are not in a custom report project, instruct the user to initialize a custom report using `npm create lxr`.

---

## LeanIX Reporting Package

The `@leanix/reporting` npm package is the runtime framework that lets reports interact with the LeanIX workspace.

**All code examples in this guide assume these imports:**

```typescript
import type { lxr } from "@leanix/reporting";
import { lx } from "@leanix/reporting";
```

- `lxr` is the main namespace containing all types and interfaces
- `lx` is an instance of `lxr.LxCustomReportLib` that provides the runtime API

Initialization happens with `await lx.init()`. Configuration is done using `lx.ready(config)`.
Use the LeanIX MCP Tools to get information about the usage.

In `lxr` there are also some utility functions (`lxr.cloneDeep`, `lxr.difference`, etc.).
When using them, the import needs to be changed to: `import { lx, lxr } from '@leanix/reporting'`

---

## LeanIX MCP Tools

Before writing any code, use MCP tools to discover the schema of the connected workspace.

You have access to **LeanIX MCP Server tools** that provide:

- **GraphQL type definitions** - Request Schema in SDL for types like `Query`, `Application`, `ITComponent`, `BaseFactSheet`

There may be more LeanIX MCP tools available.
Do not use other LeanIX MCP tools to modify data or to fetch data and hardcoding it in the report

The LeanIX MCP Server is always connected to a specific workspace via an API token. Since each workspace can have different configurations, the GraphQL schema definitions may vary between workspaces.

### TypeScript Definitions

Complete TypeScript type definitions for the `@leanix/reporting` package are included in the **TypeScript Type Definitions** section.

### Discovery Process

1. **Identify what you need** - Methods from `LxCustomReportLib`? GraphQL Query operations? Fact sheet fields? Relations?
2. **Request GraphQL SDL** - Use LeanIX MCP tools to get GraphQL Schema Definition Language for workspace-specific types
3. **Reference TypeScript definitions** - See the **TypeScript Type Definitions** section for `@leanix/reporting` types
4. **Write code** - Use the information received, not assumptions

---

## Development

**Follow this cycle for every change:**

1. **Write Code** - Implement using TypeScript with `lxr.*` types
2. **Lint** - Run `npm run lint` to catch issues
3. **Test** - Run `npm run dev` to start a dev server with hot reload and test in browser
4. **Repeat** - Iterate based on the input from the user

### Testing Your Report

Run `npm run dev` to get a **LeanIX-hosted development URL**. Copy the complete URL from the terminal output and open it in a browser for live testing with real workspace data. If you do not have the ability to run code in the browser, ask the user to set up the Chrome MCP Server.

In the main folder there is the `lxr.json` which contains an API token for the connected workspace. Do not attempt to access it.
If the commands like `npm run dev` are not working, the error might be here.

---

## Golden Rules

1. **NEVER hardcode data** - Always fetch dynamically via LeanIX APIs
2. **ALWAYS verify the schema and typings first** - Use LeanIX MCP tools before writing code
3. **PREFER facet-based data loading** - Provides automatic UI, pagination, and permissions
4. **HANDLE null values** - Use optional chaining (`?.`) as fields may be null

---

## Understanding the Meta Model

Every LeanIX workspace has a **unique meta model** defining:

- Fact sheet types (Application, ITComponent, BusinessCapability, etc.)
- Fields for each type (name, description, lifecycle, custom fields)
- Relations between types
- Lifecycle phases and tag groups

All fact sheet types extend the GraphQL interface `BaseFactSheet`, which defines the common fields: id, name, displayName, and type.

---

## Data Retrieval Patterns

### Pattern 1: Facets (RECOMMENDED)

**This is your default approach for almost all data retrieval scenarios.**

Facets are a declarative way to retrieve fact sheets in custom reports. They are defined in the `ReportConfiguration` that is passed to `lx.ready()`.

For the first facet, LeanIX automatically displays a filter side pane on the left side of the page. This pane provides a built-in filter UI, enabling users to adjust filters at runtime and dynamically refine the data shown in the report.

The optional field `fixedFactSheetType` specifies that only fact sheets of one type are returned. The names refer to entries in the GraphQL enum `FactSheetType`. For each of them there is an GraphQL interface with the same name.

`attributes` defines which fields of the fact sheet should be returned. They refer to fields on the underlying GraphQL Object. Think of them as parts of a GraphQL query. E.g. since `Application.lifecycle` is an object, you can not access it directly. You have to specify the fields that you want, e.g., `lifecycle { asString phases: { phase startDate } }`.

A loading spinner is automatically displayed when the facets fetch data.

```typescript
class MyReport {
  createConfig(): lxr.ReportConfiguration {
    return {
      facets: [
        {
          key: "main",
          fixedFactSheetType: "Application",
          attributes: [
            "id",
            "name",
            "description",
            "lifecycle { asString phases { phase startDate } }",
          ],
          callback: (data) => this.render(data),
        },
      ],
    };
  }

  render(data: lxr.FactSheet[]) {
    if (!data?.length) return;

    data.forEach((app) => {
      console.log(app.name, app.lifecycle?.phases);
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

- Facets cannot express your filtering requirements
- You need data for subsequent processing (not just display)
- You need to **write data** (perform mutations)

**Always use the LeanIX MCP tools to discover the schema before writing a query**

Example of reading data:

```typescript
const result = await lx.executeGraphQL(`
{
  allFactSheets(factSheetType: Application, first: 50) {
    edges {
      node {
        id
        name
        description
        ... on Application {
          lifecycle { asString phases { phase startDate } }
        }
      }
    }
  }
}`);
console.log(result.allFactSheets.edges[0].node.description);
```

Example of writing data:

```typescript
const result = await lx.executeGraphQL(
  `
    mutation ($tagGroupId: ID) {
      createTag(
        name: "TestName",
        tagGroupId: $tagGroupId
      ) {
        id
      }
    }
  `,
  `
    {
      "tagGroupId": "GUID-OF-TAG-GROUP"
    }
  `,
);
console.log(result.createTag.id);
```

**Only create code that is running mutations, if the user explicitly asked for it.**

---

## Chart Integration

**Chart.js** is the default choice - it covers 95% of visualization needs with excellent LeanIX styling compatibility.

**Alternatives:** If Chart.js cannot achieve the visualization, and the user has no preference, select one of the broadly used ones. (D3.js, Apache Echarts, Recharts, etc.)

**Data aggregation:** Charts should summarize **fact sheet-level data** by default (e.g., count applications by lifecycle phase). Only explore relations when the user explicitly requests relationship analysis (e.g., "show which applications use which IT components").

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

There are many more UI components in `lxr.LxCustomReportLib`.
Reference the **TypeScript Type Definitions** section to explore all available methods and properties.

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

## Using Workspace View Model Colors

Users configure colors for fact sheet types, field values (lifecycle phases, status fields, select fields), and icons.
**Always use these workspace-defined colors to ensure visual consistency across custom reports.**

**IMPORTANT:** `lx.getFactSheetFieldMetaData()` requires `lx.init()` to be called first.

**Accessing colors:**

- **Fact sheet type colors** - Access via `lx.currentSetup.settings.viewModel.factSheets.find(f => f.type === fsType).bgColor`
- **Field value colors** (lifecycle, functional fit, etc.) - Use `lx.getFactSheetFieldMetaData(fsType, fieldName)`

**Color properties:** `bgColor` (for element colors, icon colors), `color` (for text on colored backgrounds).

**Best Practices:** Always use workspace colors, never hardcode. Use optional chaining (`?.`) to handle missing values.

---

## Using Translations

Users can switch languages, define custom field translations, and customize labels for field values.
**Always translate fact sheet types, fields, and values from their technical/internal names to user-friendly display names.**
Translation methods are available on the `lx` object. Refer to the TypeScript definitions for available translation functions and their usage.
Translation methods automatically respect the user's current language setting. When a translation is not found, methods return the original name as a fallback. 

---

## Uploading to LeanIX

Once your report is ready, upload it to your LeanIX workspace:

1. **Increment the patch version number** - Can be found in the `package.json`
2. **Upload to workspace** - Run `npm run upload`
3. **Verify upload** - Check console output for success message
4. **Tell user to activate the report** - In LeanIX the report needs to be activated under Administration > Reports

---

## Pre-Upload Checklist

Before uploading your report:

- **Schema verified** - Used LeanIX MCP MCP tools to verify all fact sheet types and field names
- **Empty states handled** - Code handles null/undefined/empty data gracefully
- **Loading states** - Uses `lx.showSpinner()` / `lx.hideSpinner()` when doing raw GraphQL queries
- **User feedback** - Uses `lx.showToastr()` for important success/error messages
- **Navigation** - Uses `lx.openLink()` or `lx.navigateToInventory()` instead of links
- **TypeScript types** - Uses no `any` types, instead uses types from `lxr` namespace
- **View model colors** - Uses workspace colors from `lx.currentSetup.settings.viewModel` for visual consistency
- **Translations** - Translates all technical keys (fact sheet types, fields, values) to user-friendly display names
- **Linting passes** - `npm run lint` succeeds
- **Browser tested** - `npm run dev` tested in browser with real data

---

## LeanIX-Specific Requirements

### Data Privacy

- **Never log sensitive data** - Fact sheet data may contain PII
- **Don't expose the API token** - It is stored in `lxr.json` and it is handled by the `vite-plugin-lxr`

### Performance

- **Facets handle pagination** - No manual implementation needed
- **Lazy load large visualizations** - Render only visible data
