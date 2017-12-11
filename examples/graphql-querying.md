# Fetching custom report data via GraphQL API
This example shows how fetch data from the LeanIX GraphQL API via the custom reporting framework. The shown example can be easily extrapolated for mutations.

```js
import '@leanix/reporting';

lx.init()
  .then(function (setupInfo) {
    var config = {};

    const query = `
      query factsheets($first: Int) {
        allFactSheets(factSheetType: ITComponent, first: $first) {
          edges {
            node {
              id
              displayName
            }
          }
        }
      }
    `

    const variables = {
      first: 10
    }

    lx.executeGraphQL(query, variables)
      .then(function (result) {
        console.log('query results', result);
      })
      .catch(function (error) {
        console.error('error while fetching data', error)
      })

    lx.ready(config);
  });
```