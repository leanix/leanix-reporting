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
2. **NEVER hardcode expected values in charts** - Derive all values dynamically from the dataset (e.g., lifecycle phases, statuses)
3. **ALWAYS verify the schema and typings first** - Use LeanIX MCP tools before writing code
4. **PREFER facet-based data loading** - Provides automatic UI, pagination, and permissions
5. **HANDLE null values** - Use optional chaining (`?.`) as fields may be null

---

## Handling Missing or Unavailable Data

When a user requests data that is not available in the current workspace:

**DO NOT:**

- Assume values exist
- Hardcode mock data
- Proceed with placeholder values

**DO:**

- Explicitly inform the user about the data gap
- Ask how the user would like to proceed
- Suggest alternatives if applicable

---

## Report Metadata Protection

**The AI must NOT change the following unless explicitly requested by the user:**

In `package.json`:

- `name`: Project/repository name
- `leanixReport.title`: Report title displayed in LeanIX
- `leanixReport.id`: Report ID used to identify that two uploads are the same report
- `leanixReport.description`
- `leanixReport.author`

### Report ID Rules

Report IDs may only contain lowercase letters (`a-z`), digits (`0-9`), dots (`.`), and underscores (`_`), and must not end with a dot.

---

## Dynamic Chart Values (No Hardcoding)

Extract unique values from the actual dataset being visualized since these values are dynamic and workspace-specific.

---

## Default Styling Rules

When the user does **not explicitly specify styling**, apply these defaults:

1. **Background:** White background for single chart report, for dashboards: gray background `#f0f2f5` with white cards
2. **No redundant titles:** Do NOT add a report title (rendered outside the custom report iframe) or "Total number of fact sheets" counters (unless explicitly requested)
3. **Single chart or charts with matching/similar values:** Use LeanIX default legends through `lx.showLegend()`

---

## Understanding the Meta Model

Every LeanIX workspace has a **unique meta model**, consisting of a viewModel and a dataModel, which together define:

- Fact sheet types (Application, ITComponent, BusinessCapability, etc.)
- Fields for each type (name, description, lifecycle, custom fields)
- Relations between types
- Lifecycle phases and tag groups

All fact sheet types extend the GraphQL interface `BaseFactSheet`, which defines the common fields: id, name, displayName, and type.

Users can customize the meta model by:

- Defining custom fields for any fact sheet type
- Configuring possible values for select fields (single/multiple select)
- Setting up relations between fact sheet types

---

## Product-Specific Behaviors

### Lifecycle Value Interpretation

A dash (`-`) as a lifecycle value indicates that lifecycles are defined, but none has started yet (the lifecycle value exists only in the future as a planned lifecycle).

**Treat `-` the same as `null`, `undefined`, or `"n/a"`** in lifecycle-related logic and filtering.

### Implicit Filtering of Drafts in Facet Filters

**Facet filters implicitly filter by quality seal (`lxState`):**

- By default, facet filters show only `APPROVED` and `BROKEN_QUALITY_SEAL` fact sheets
- `DRAFT` and `REJECTED` fact sheets are filtered out automatically

This implicit filtering happens automatically and can cause **incomplete data** in custom reports data (e.g., showing missing initiatives count)

---

**Use `defaultFilters` to include all fact sheets**

To show **all fact sheets** in a faceted report (including `DRAFT` and `REJECTED`), explicitly set `defaultFilters` with an **empty `keys` array**:

```typescript
facets: [
  {
    key: "initiatives",
    fixedFactSheetType: "Initiative",
    attributes: ["id", "displayName" /* ... */],
    defaultFilters: [
      {
        facetKey: "lxState",
        keys: [], // Empty array = no quality seal filtering
      },
    ],
    callback: (factSheets) => {
      // Will now receive ALL fact sheets regardless of quality seal status
    },
  },
];
```

---

**GraphQL queries behave differently:**

- GraphQL queries (`lx.executeGraphQL()`) return **all fact sheets** by default, regardless of quality seal
- You must explicitly filter by `lxState` in GraphQL if you want to exclude certain statuses

---

## Data Retrieval Patterns

### Pattern 1: Facets (RECOMMENDED)

**This is your default approach for almost all data retrieval scenarios.**

Facets are a declarative way to retrieve fact sheets in custom reports. They are defined in the `ReportConfiguration` that is passed to `lx.ready()`.

For the first facet, LeanIX automatically displays a filter side pane on the left side of the page. This pane provides a built-in filter UI, enabling users to adjust filters at runtime and dynamically refine the data shown in the report.

The optional field `fixedFactSheetType` specifies that only fact sheets of one type are returned. The names refer to entries in the GraphQL enum `FactSheetType`. For each of them there is an GraphQL interface with the same name.

`attributes` defines which fields of the fact sheet should be returned. They refer to fields on the underlying GraphQL Object. Think of them as parts of a GraphQL query. E.g. since `Application.lifecycle` is an object, you can not access it directly. You have to specify the fields that you want, e.g., `lifecycle { phases { phase startDate } }`.

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
            "lifecycle { phases { phase startDate } }",
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
          lifecycle { phases { phase startDate } }
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

**Use the appropriate navigation functions based on the target:**

### Opening a Single Fact Sheet

Use `lx.openLink()` to open a single fact sheet page:

```typescript
// Link to fact sheet
lx.openLink(`/factsheet/Application/${factSheetId}`);

// Link with specific tab
lx.openLink(`/factsheet/Application/${factSheetId}?tab=relations`);
```

### Opening a Group of Fact Sheets (Inventory)

The **Inventory** is the LeanIX Fact Sheets overview page - a table view that displays multiple fact sheets with their attributes. It uses the same facet filters as custom reports to filter and refine the displayed fact sheets.

Use `lx.navigateToInventory()` to open a filtered inventory view.

---

## Using the Data Model

The Data Model provides runtime metadata about fact sheet types, fields, relations, and their configurations in the current workspace.

**Access the Data Model:**

```typescript
const dataModel = lx.currentSetup.settings.dataModel;
```

**Key capabilities:**

- **Fact Sheet definitions:** `dataModel.factSheets[factSheetType]` provides field definitions, relations, and configuration for a specific fact sheet type
- **Field definitions:** Each field includes its type (`INTEGER`, `LIFECYCLE`,`COMPLETION`, `QUALITYSEALSTATUS`, `SINGLE_SELECT` etc.) and available values
- **Relation definitions:** `dataModel.relations[relationName]` provides information about relations between fact sheet types
- **External ID fields:** `dataModel.externalIdFields` contains metadata for external ID configurations

**When to use the Data Model:**

- To get all possible values for a field (e.g., all lifecycle phases, all select field options)
- To discover available fields and relations for a fact sheet type
- To validate field types before rendering them in charts or tables
- To check field configurations (mandatory fields, facet availability, etc.)

**Helper utilities:**

The `lx.dataModelHelpers` provides utility methods for working with the data model, such as `getRelationDefinition()` and `isConstrainingRelation()`.

---

## View Model Colors

Users configure colors for fact sheet types, field values (lifecycle phases, status fields, select fields), and icons.
**Always use these workspace-defined colors to ensure visual consistency across custom reports.**

All `lx` methods (e.g., `getFactSheetFieldMetaData()`) require `lx.init()` to be called first.

**Accessing colors:**

- **Fact sheet type colors** - Access via `lx.currentSetup.settings.viewModel.factSheets.find(f => f.type === fsType).bgColor`
- **Field value colors** (lifecycle, functional fit, etc.) - Use `lx.getFactSheetFieldMetaData(fsType, fieldName)`
- **Relation field value colors** (fields on relations) - Use `lx.getFactSheetRelationFieldMetaData(fsType, relationName, fieldName)`

**Color properties:** `bgColor` (for element colors, icon colors), `color` (for text on colored backgrounds).

**Best Practices:** Always use workspace colors, never hardcode. Use optional chaining (`?.`) to handle missing values.

---

## Using Translations

Users can switch languages, define custom field translations, and customize labels for field values.
**Always translate fact sheet types, fields, and values from their technical/internal names to user-friendly display names.**

Field values, relation values, and fact sheet types have workspace-specific translations:

- **Field values** are stored as technical IDs (e.g., `"phaseIn"`, `"missionCritical"`) - not display labels
- **Relation values** are stored as technical IDs (e.g., relation type names like `"relApplicationToITComponent"`)
- **Fact sheet types** are stored as technical IDs (e.g., `"Application"`, `"ITComponent"`, `"BusinessCapability"`)
- Always use `displayName` property when available, or translation functions to convert technical IDs to user-friendly display names

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
- **No hardcoded values** - All chart data, lifecycle phases, and field values derived dynamically
- **Loading states** - Uses `lx.showSpinner()` / `lx.hideSpinner()` when doing raw GraphQL queries
- **User feedback** - Uses `lx.showToastr()` for important success/error messages
- **Navigation** - Uses `lx.openLink()` for single fact sheets or `lx.navigateToInventory()` for multiple fact sheets
- **TypeScript types** - Uses no `any` types, instead uses types from `lxr` namespace
- **View model colors** - Colors all technical fact sheet types, fields, and values through workspace colors
- **Translations** - Translates all technical keys (fact sheet types, fields, relations, values) to user-friendly display names
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
