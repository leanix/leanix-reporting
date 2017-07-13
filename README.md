# leanix-reporting
This library allows you to develop your own custom reports for LeanIX EAM Tool (https://www.leanix.net).

## Installation
Simply install the library via npm:
```
npm install @leanix/reporting --save
```

## Usage

### As a simple script tag inside your HTML
```html
<script src="node_modules/@leanix/reporting/index.js"></script>
<script>
  // Now we have a global lx object.
  console.log(lx);
</script>
```

### With a bundler such as Webpack
```js
import '@leanix/reporting';

// Now we have a global `lx` object.
console.log(lx);
lx.init()
.then(function (setupInfo) {
  // Process setupInfo and create config object
  var config = {};
  lx.ready(config);
});
```

## Basic concept of the LeanIX reporting framework
A report for LeanIX consists of HTML, JavaScript and CSS files, which are loaded into an iframe inside of the application. The report which is running within the iframe and the host application that contains the iframe communicate via a predefined set of messages (see: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage).

As a report developer you do not have to know about the messages. This library takes care of the communication with the host application and provides a simple API that you can use to request data, send commands to the host application or be informed about events happening outside of your report.

### Init sequence
* `lx.init()`: Notifies the host application that the report wants to initialise. It returns a promise that is fullfilled with setup information that is provided by the host app.
* `lx.ready(config)`: Notify the host application that the report is ready to start processing data. You have to provide a configuration object that specifies the requirements of your report to the host (see TODO - Describe config object).

### Config object
The config object which has to be passed to `lx.ready()` acts as an interface between your report code and the reporting library. It allows you to define the requirements for your report, such as which data you want to fetch from LeanIX backend. In addition to that you have to register callback functions in the config object, which are called by the reporting library once certain events occur (for example when data has been fetched from the backend).
