# Get view information
In this example we register a `reportViewCallback` with the config object. This tells the framework that we are interested in receiving view information. The framework will then show a dropdown to the user that allows him/her to select a view. The available views are determined by the `reportViewFactSheetType`.

The example code will log the background color for each Fact Sheet that is contained in the view information. In a real world scenario you would use these colours in the visualization of the report.

```js
import '@leanix/reporting';

lx.init()
.then(function (setupInfo) {
  var config = {
    reportViewFactSheetType: 'Application',
    reportViewCallback: function (data) {
      // Build map from ledgendItem id to the item itself
      var ledgendItemMap = {};
      data.legendItems.forEach(item => { ledgendItemMap[item.id] = item; });

      // Print mappings
      data.mapping.map(fsMapping => {
        var ledgendItem = ledgendItemMap[fsMapping.legendId];
        console.log(`${fsMapping.fsId}: ledgendId=${fsMapping.legendId};bgColor=${ledgendItem.bgColor}`);
      });
    }
  };
  lx.ready(config);
});
```

