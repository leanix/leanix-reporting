# LeanIX Custom Reports — AI Agent Development Guide

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

- **GraphQL type definitions** - Request Schema in SDL for types like `Query`, `Mutation`, `Application`, `ITComponent`, `BaseFactSheet`

There may be more LeanIX MCP tools available.
Do not use other LeanIX MCP tools to modify data or to fetch data and hardcoding it in the report

The LeanIX MCP Server is always connected to a specific workspace via an API token. Since each workspace can have different configurations, the GraphQL schema definitions may vary between workspaces.

### TypeScript Definitions

When you need **autocomplete functions, TypeScript definitions, or detailed type information** for the `@leanix/reporting` package (including `lx`, `lxr` types, or any reporting-lib specific definitions):

1. **Do NOT load the entire file** - The complete TypeScript definitions file is very large
2. **Search on-demand** - Use file search/grep to find specific types, interfaces, or functions in `node_modules/@leanix/reporting/index.d.ts`
3. **Be specific** - Search for exact type names, function names, or interface names you need (e.g., "ReportConfiguration", "LxCustomReportLib", "executeGraphQL")

**Example searches:**

- Finding a specific type: Search for `interface ReportConfiguration` or `type FacetConfig`
- Finding a method signature: Search for `executeGraphQL` or `showLegend`
- Finding available properties: Search for the interface name, then read just that section

### Discovery Process

1. **Identify what you need** - Methods from `LxCustomReportLib`? GraphQL Query operations? Fact sheet fields? Relations?
2. **Request GraphQL SDL** - Use LeanIX MCP tools to get GraphQL Schema Definition Language for workspace-specific types
3. **Search TypeScript definitions on-demand** - Use file search in `node_modules/@leanix/reporting/index.d.ts` for specific types, interfaces, or method signatures you need
4. **Write code** - Use the information received, not assumptions

---

## Golden Rules

1. **NEVER hardcode data** - Always fetch dynamically via LeanIX APIs
2. **NEVER hardcode expected values in charts** - Derive all values dynamically from the dataset (e.g., lifecycle phases, statuses)
3. **ALWAYS verify the schema and typings first** - Use LeanIX MCP tools before writing code
4. **PREFER facet-based data loading** - Provides automatic UI, pagination, and permissions
5. **HANDLE null values** - Use optional chaining (`?.`) as fields may be null

---

## When You Don't Know - ASK (Critical)

**NEVER make assumptions.** When you encounter any uncertainty, you MUST stop and ask clarifying questions. Users prefer informed questions over broken reports they cannot understand.

### Missing Data or Unavailable Fields

When a user requests data that doesn't exist in the workspace:

**YOU MUST:**

- Stop immediately and verify the schema using LeanIX MCP tools
- Inform the user about the missing data
- Ask which alternative field or approach to use
- Suggest available alternatives based on the actual schema

**Example:** User asks for "business criticality" but the field doesn't exist → Ask if they want to use "lifecycle" or "technicalSuitability" instead, or show what fields ARE available.

### Uncertain Business Logic

When implementing calculations, classifications, scoring, or any logic NOT defined in the meta model:

**YOU MUST ask the user to define:**

- Classification schemes: What makes something "high risk" vs "low risk"?
- Calculation formulas: How should ROI, savings, or priority be calculated?
- Thresholds: What values qualify as "needs attention" or "critical"?
- Weighting: How should multiple factors be combined?

**NEVER invent:**

- Classification criteria (high/medium/low without definition)
- Calculation percentages (arbitrary 90%, 70%, 30%)
- Scoring formulas (made-up risk or priority calculations)
- Threshold values (assuming what "high" means)

**Common scenarios requiring questions:**

- "Show high-risk applications" → Ask: What defines high risk?
- "Calculate cost savings" → Ask: What's the savings methodology?
- "Highlight applications needing attention" → Ask: What criteria determine this?
- "Show modernization priority" → Ask: How should priority be calculated?

**After the user defines logic:** Document it clearly in code comments explaining the methodology.

---

## Dynamic Chart Values (No Hardcoding)

Extract unique values from the actual dataset being visualized since these values are dynamic and workspace-specific.

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
reportViewFactSheetType: "Initiative",
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

If `fixedFactSheetType` is not defined, all returned Fact Sheets default to the `BaseFactSheet` type. `BaseFactSheet` serves as the root interface that every Fact Sheet type implements.

`attributes` defines which fields of the fact sheet should be returned. They refer to fields on the underlying GraphQL object type. Think of them as the field selections you would place inside a GraphQL selection set. **Always use the LeanIX MCP tools to retrieve the GraphQL schema definition for the Fact Sheet type you are working with, or for `BaseFactSheet` if no specific type is set. This ensures you can verify the correct field names, field types, and the nested structure.**

**For scalar fields** (like `businessCriticality`, `functionalSuitability`), specify the field name directly.

**For object fields** (like `lifecycle`), you must specify the subfields you want:

- For the current lifecycle phase: `lifecycle { asString }`
- For full phase history: `lifecycle { asString phases { phase startDate } }`
- For relation targets: use inline fragments to access type-specific fields. Relation `factSheet` properties return `BaseFactSheet`, which only includes common fields. To access fields specific to concrete types, use inline fragment syntax:
  ```
  "relApplicationToBusinessCapability { edges { node { factSheet { ... on BusinessCapability { id displayName strategicImportance } } } } }"
  ```

A loading spinner is automatically displayed when the facets fetch data.

```typescript
class MyReport {
  createConfig(): lxr.ReportConfiguration {
    return {
      reportViewFactSheetType: "Application",
      facets: [
        {
          key: "main",
          fixedFactSheetType: "Application",
          attributes: [
            "id",
            "name",
            "description",
            "businessCriticality", // Scalar field - direct access
            "lifecycle { asString phases { phase startDate } }", // Object field - requires a selection set for its subfields
          ],
          callback: (data) => this.render(data),
        },
      ],
    };
  }

  render(data: lxr.FactSheet[]) {
    if (!data?.length) return;

    data.forEach((app) => {
      // Access scalar fields directly
      console.log(app.name, app.businessCriticality);
      // Access object fields with subfields
      console.log(app.lifecycle?.asString, app.lifecycle?.phases);
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

**Verify each nested field's structure** - Don't assume nested fields follow the same pattern as their parent. Each level may use different structures (edges/node connections vs direct arrays). Use the LeanIX MCP Server to verify the GraphQL structure at each level:

For example, while `subscriptions` uses edges/node, its nested `roles` field is a direct array:

```typescript
subscriptions {
  edges {
    node {
      roles {
        id name
      }
    }
  }
}
```

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
          businessCriticality
          lifecycle { asString phases { phase startDate } }
        }
      }
    }
  }
}`);
console.log(result.allFactSheets.edges[0].node.description);
console.log(result.allFactSheets.edges[0].node.businessCriticality);
console.log(result.allFactSheets.edges[0].node.lifecycle?.asString);
```

Example of writing data:

**Before writing mutations, ALWAYS verify the `Mutation` type to see available operations:**

```typescript
// STEP 1: Verify available mutations
// Use LeanIX MCP tools to get GraphQL Schema Definition for "Mutation" type
// This shows: createTag, upsertRelation, deleteRelation, updateFactSheet, etc.
```

**Common mutations:**

- Relations: `upsertRelation`, `deleteRelation`
- Fact Sheets: `createFactSheet`, `updateFactSheet`
- Tags: `createTag`, `updateTag`

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

### Pattern 3: REST via `executeParentOriginXHR` (Controlled Gateway)

`lx.executeParentOriginXHR()` lets a report call LeanIX first-party REST services from inside the report iframe, bypassing the iframe's same-origin restriction. It reaches services the reporting lib does not surface, such as Documents (Architecture Decisions), To-Do (Todos), or Metrics.

**Use this ONLY when the task cannot be done with the reporting lib itself.** Facets (Pattern 1) and `lx.executeGraphQL()` (Pattern 2) are always preferred. Do NOT use `executeParentOriginXHR` for anything the reporting lib already covers: for example, never use it to fetch fact sheets, relations, or tags. Fetch those with facets or GraphQL.

**Discovering available services:** The LeanIX REST APIs are documented in the OpenAPI Explorer at https://app.leanix.net/openapi-explorer. An index of every service and its OpenAPI spec URL is served at https://app.leanix.net/openapi-explorer/services.json. Fetch that index to find the right service, then read its OpenAPI spec to learn the exact paths, parameters, and payloads. Some entries carry a short `description` where the service name alone is not self-explanatory (for example, Documents provides Architecture Decisions).

**Usage notes:**

- Pass a **relative** path (e.g. `/services/documents/v2/...`); it resolves against the current workspace host. Do not pass absolute URLs.
- `GET` is permitted for any endpoint. `POST` and `PUT` are permitted only for a restricted subset of paths; unsupported paths return an error response.
- **Paginate REST calls** — services use different pagination schemes (e.g. documents uses `limit`/`cursor`, todos uses `first`/`after`). Check the service's OpenAPI spec for its specific parameters and response shape. Never assume a single response contains all data — always loop until the response indicates no further pages.
- **Avoid per-item requests** — do not call the API once per fact sheet (or per item in a list). Batch lookups or collect all IDs first and fetch in bulk. A single missing facet filter can return thousands of fact sheets and trigger thousands of individual requests, which will break the report.
- The return type is typed as `Promise<any>`. In practice the resolved value varies: the TypeScript docs describe a `string | Blob`, but at runtime the value may be an object `{ body: string, headers, status, statusText }`. Always use a defensive helper to extract the body regardless of which shape is returned:

```typescript
function parseXhrResponse(response: unknown): unknown {
  const raw =
    typeof response === 'string'
      ? response
      : typeof (response as { body?: unknown }).body === 'string'
        ? (response as { body: string }).body
        : JSON.stringify(response);
  return JSON.parse(raw);
}

// Use only when facets / GraphQL cannot provide the data.
// Example: fetch Architecture Decisions, which the reporting lib does not expose.
// Consult the service's OpenAPI spec (via the explorer index) for exact paths.
const raw = await lx.executeParentOriginXHR("GET", "/services/documents/v2/documents");
const documents = parseXhrResponse(raw);

// Example: POST with a JSON body (e.g. to upsert a todo state)
await lx.executeParentOriginXHR('POST', '/services/todo/v1/to-do/upsert', [
  { query: { todoIds: ['<uuid>'] }, todo: { state: 'IN_PROGRESS' } }
]);
```

---

## Chart Integration

**Chart.js** is the default choice - it covers 95% of visualization needs with excellent LeanIX styling compatibility.

**Data aggregation:** Charts should summarize **fact sheet-level data** by default (e.g., count applications by lifecycle phase). Only explore relations when the user explicitly requests relationship analysis (e.g., "show which applications use which IT components").

---

## Default Styling Rules

When the user does **not explicitly specify styling**, apply these defaults:

1. **Background:** White background for single chart report, for dashboards: gray background `#f0f2f5` with white cards
2. **No redundant titles:** Do NOT add a report title (rendered outside the custom report iframe) or "Total number of fact sheets" counters (unless explicitly requested)
3. **Single chart or charts with matching/similar values:** Use LeanIX default legends through `lx.showLegend()`
4. **Font Family:** Use SAP's official **'72' font family** for consistency with the SAP LeanIX. Set as the base font:
   ```css
   font-family: "72", "Helvetica Neue", Helvetica, Arial, sans-serif;
   ```
   The '72' font is automatically available in the LeanIX platform environment.

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

// Legend - derive colors and labels from view model
const fieldMeta = lx.getFactSheetFieldMetaData("Application", "lifecycle");
const legendItems = Object.keys(fieldMeta?.values || {}).map((key) => ({
  label: lx.translateFieldValue("Application", "lifecycle", key),
  bgColor: fieldMeta?.values?.[key]?.bgColor,
}));
// If your data includes null/undefined/n/a values that aren't in field metadata, add them to the legend manually with label 'n/a' and bgColor '#555555'
lx.showLegend(legendItems);
```

**Widget view legend type badge:** When a report is rendered as a widget (in LeanIX dashboards, presentation slides, or HTML iframe exports), the legend header shows a fact sheet type icon and name (e.g. "A Application"). Without `reportViewFactSheetType`, it falls back to a generic "Fact Sheet" label. Always set it in `lx.ready()` to show the correct type:

```typescript
lx.ready({
  reportViewFactSheetType: 'Application', // controls the type badge in widget legend header
  facets: [ ... ]
});
```

There are many more UI components in `lxr.LxCustomReportLib`.
To explore all available methods and properties, search for `LxCustomReportLib` in `node_modules/@leanix/reporting/index.d.ts`.

### Interactive UI Components (@ui5/webcomponents-react)

**For ALL interactive UI elements (buttons, inputs, tables, modals, cards, etc.), you MUST use @ui5/webcomponents-react.**

**Why mandatory:** Ensures visual consistency with SAP LeanIX design language, provides accessibility (WCAG 2.1), automatic theming, and follows SAP LeanIX design system standards.

**Never use plain HTML elements** (`<button>`, `<table>`, etc.) for interactive components. Always import and use the corresponding UI5 component.

**Verify component availability before importing** - Not every UI5 component is re-exported by `@ui5/webcomponents-react`. Before using a component, confirm it exists in `node_modules/@ui5/webcomponents-react/dist/index.d.ts`. If a component you need (e.g. a badge or chip) is not available, use a styled `<span>` or `<div>` for non-interactive display elements rather than failing with a bad import.

**Avoid vague asset imports**, they are unnecessary. Use specific imports only when needed (e.g., icons)

**Follow table component structure:** The UI5 Table component follows a specific hierarchy. Understanding this structure is critical for building tables correctly. Don't wrap Table in Card, it prevents proper scrolling. Place Table directly in your container div.

```typescript
import {
  Table,
  TableHeaderRow,
  TableHeaderCell,
  TableRow,
  TableCell,
  Button
} from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/action.js';

<Button
  design="Emphasized"
  icon="action"
  onClick={() => ...}
/>

<Table
  headerRow={
    <TableHeaderRow>
      <TableHeaderCell><span>Column 1</span></TableHeaderCell>
      <TableHeaderCell><span>Column 2</span></TableHeaderCell>
    </TableHeaderRow>
  }
>
  {data.map((item) => (
    <TableRow key={item.id}>
      <TableCell><span>{item.name}</span></TableCell>
      <TableCell><span>{item.value}</span></TableCell>
    </TableRow>
  ))}
</Table>
```

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

## Working with Enum Field Values

Enum fields (single select, lifecycle, status fields) have workspace-specific values that cannot be assumed. **Always retrieve values dynamically from field metadata.**

```typescript
const fieldMeta = lx.getFactSheetFieldMetaData(
  "Application",
  "businessCriticality",
);
const availableValues = Object.keys(fieldMeta?.values || {});

// Now use availableValues for processing, validation, or mapping
```

**When mapping to other formats** (numbers, colors, priorities), derive mappings from the available values and their order in metadata, not from assumptions about what values exist.

---

## Using Translations

Users can switch languages, define custom field translations, and customize labels for field values.
**Always translate fact sheet types, fields, and values from their technical/internal names to user-friendly display names.**

Field values, relation values, and fact sheet types have workspace-specific translations:

- **Field values** are stored as technical IDs (e.g., `"phaseIn"`, `"missionCritical"`) - not display labels
- **Object field values** like `asString` return technical IDs (e.g., `"active"`, `"phaseOut"`)
- **Relation values** are stored as technical IDs (e.g., relation type names like `"relApplicationToITComponent"`)
- **Fact sheet types** are stored as technical IDs (e.g., `"Application"`, `"ITComponent"`, `"BusinessCapability"`)
- Always use `displayName` property when available, or translation functions to convert technical IDs to user-friendly display names

Translation methods are available on the `lx` object. Refer to the TypeScript definitions for available translation functions and their usage.
Translation methods automatically respect the user's current language setting. When a translation is not found, methods return the original name as a fallback.

---

## Security Principles

Custom reports run inside the LeanIX platform with access to workspace data and user context. Follow these principles to keep the generated code safe for LeanIX customers.

### No External Network Requests

**NEVER call URLs outside of the LeanIX platform:**

- Do **not** fetch data from third-party APIs, CDNs, or arbitrary endpoints
- Do **not** load scripts, styles, or assets from external URLs (e.g., `<script src="https://...">`, `fetch("https://...")`)
- **All data must come from** `lx.executeGraphQL()` or the facets API; all assets must be bundled locally or come from `@leanix/reporting` / UI5

**Exception for LeanIX first-party services:** `lx.executeParentOriginXHR()` is allowed for calling LeanIX REST services on relative `/services/...` paths, because the request goes through the platform host rather than a third party. This is a controlled gateway for data the reporting lib does not expose (see "Pattern 3: REST via `executeParentOriginXHR`"). It does not relax the rule against third-party or external URLs.

### No Dynamic Code Execution & Safe DOM Rendering

**NEVER execute code constructed at runtime:**

- Do **not** use `eval()`, `new Function(...)`, or `setTimeout`/`setInterval` with string arguments
- Do **not** set `innerHTML` with unsanitised user-provided or API-returned strings — use `textContent` or UI5 components instead
- **Treat all API responses as untrusted** when rendering to the DOM
- **Validate and sanitise** any user-provided input (search boxes, text fields) before using it in queries or rendering it

### No Secrets in Code

**NEVER embed credentials or secrets in source files:**

- Do **not** hardcode API tokens, passwords, or personal access tokens

### Data Privacy

- **Never log sensitive data** — fact sheet data may contain PII (names, roles, contact details); do not log it to the browser console or send it anywhere
- **Never expose the API token**

---

## Quality Checklist

These quality criteria apply regardless of how the report is built or shipped. Your operational guide adds solution-specific checks (rendering verification, linting, upload).

- **Schema verified** - Used LeanIX MCP tools to verify all fact sheet types and field names
- **Empty states handled** - Code handles null/undefined/empty data gracefully
- **No hardcoded values** - All chart data, lifecycle phases, and field values derived dynamically
- **No assumptions** - Asked user for clarification on any uncertain business logic, classifications, or calculations
- **Business logic documented** - Code comments explain any classification schemes, formulas, or thresholds
- **UI components** - Uses @ui5/webcomponents-react for all interactive components (buttons, inputs, tables, cards, etc.) instead of plain HTML elements
- **Loading states** - Uses `lx.showSpinner()` / `lx.hideSpinner()` when doing raw GraphQL queries. Note: `lx.showSpinner()` can only be called after `lx.init()` has resolved. For the initial data load in a Pattern 3 (REST-only) report, either call `lx.showSpinner()` inside the `useEffect` after `await lx.init()`, or use a local React loading state for content that loads before `lx.ready()` fires.
- **User feedback** - Uses `lx.showToastr()` for important success/error messages
- **Navigation** - Uses `lx.openLink()` for single fact sheets or `lx.navigateToInventory()` for multiple fact sheets
- **TypeScript types** - Uses no `any` types, instead uses types from `lxr` namespace
- **View model colors** - Colors all technical fact sheet types, fields, and values through workspace colors
- **Translations** - Translates all technical keys (fact sheet types, fields, relations, values) to user-friendly display names

---

## LeanIX-Specific Requirements

### Performance

- **Facets handle pagination** - No manual implementation needed
- **Lazy load large visualizations** - Render only visible data

---

