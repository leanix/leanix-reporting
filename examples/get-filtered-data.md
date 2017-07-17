# Get filtered data
In this example we simply specify that we want to have the attributes `displayName`, `type` and `description` of Fact Sheets.
The report framework will display GUI elements that allow the user to filter the set of Fact Sheets.
Whenever the filter is changed by the user the callback function is invoked with the new set of data.
Inside the callback we create HTML based on the new data and display the generated html inside the body element.

```js
import '@leanix/reporting';

lx.init()
.then(function (setupInfo) {
  var config = {
    facets: [{
      key: 'main',
      attributes: ['displayName', 'type', 'description'],
      callback: function (data) {
        console.log(data);
        var html = '';
        for (var index = 0; index < data.length; index++) {
          var fs = data[index];
          html += '<div>' + fs.displayName + '</div>';
        }
        document.body.innerHTML = html;
      }
    }]
  };
  lx.ready(config);
});
```