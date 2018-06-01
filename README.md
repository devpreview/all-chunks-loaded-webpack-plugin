[![license](https://img.shields.io/github/license/devpreview/all-chunks-loaded-webpack-plugin.svg)](https://github.com/devpreview/all-chunks-loaded-webpack-plugin/blob/master/LICENSE)
[![Build Status](https://travis-ci.org/devpreview/all-chunks-loaded-webpack-plugin.svg?branch=master)](https://travis-ci.org/devpreview/all-chunks-loaded-webpack-plugin)
[![npm version](https://badge.fury.io/js/all-chunks-loaded-webpack-plugin.svg)](https://www.npmjs.com/package/all-chunks-loaded-webpack-plugin)
[![dependencies Status](https://david-dm.org/devpreview/all-chunks-loaded-webpack-plugin/status.svg)](https://david-dm.org/devpreview/all-chunks-loaded-webpack-plugin)
[![devDependencies Status](https://david-dm.org/devpreview/all-chunks-loaded-webpack-plugin/dev-status.svg)](https://david-dm.org/devpreview/all-chunks-loaded-webpack-plugin?type=dev)
[![peerDependencies Status](https://david-dm.org/devpreview/all-chunks-loaded-webpack-plugin/peer-status.svg)](https://david-dm.org/devpreview/all-chunks-loaded-webpack-plugin?type=peer)
[![npm](https://img.shields.io/npm/dt/all-chunks-loaded-webpack-plugin.svg)](https://github.com/devpreview/all-chunks-loaded-webpack-plugin/releases)

# all-chunks-loaded-webpack-plugin for [HTML Webpack Plugin](https://webpack.js.org/plugins/html-webpack-plugin/)
Provide callback executed after all chunks loaded.

## Install via npm
```
npm install --save-dev all-chunks-loaded-webpack-plugin
```

* Latest release: https://github.com/devpreview/all-chunks-loaded-webpack-plugin/releases
* NPM: https://www.npmjs.com/package/all-chunks-loaded-webpack-plugin

## Usage

The plugin will update all your `webpack` chunks with attribute `onload` contains onload callback. Just add the plugin to your webpack config as follows:

**webpack.config.js**
```js
const HtmlWebpackPlugin = require('html-webpack-plugin')
const AllChunksLoadedWebpackPlugin = require('all-chunks-loaded-webpack-plugin');

module.exports = {
  ...
  
  plugins: [
    new HtmlWebpackPlugin(),
    new AllChunksLoadedWebpackPlugin({
      callback: "alert('All chunks loaded!');"
    }),
    ...
  ]
}
```

This will generate a file `dist/index.html` containing the following:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Webpack App</title>
    <script type="text/javascript">
      var allChunksLoadedWebpackPluginLoadedFiles = [];
      function allChunksLoadedWebpackPlugin(chunk, file) {
        var allFiles = ['app.css', 'app.js'];
        if(allChunksLoadedWebpackPluginLoadedFiles.indexOf(file) === -1) {
          allChunksLoadedWebpackPluginLoadedFiles.push(file);
          if(allChunksLoadedWebpackPluginLoadedFiles.length === allFiles.length) {
            setTimeout(function() {
              alert('All chunks loaded!');
            }, 0);
          }
        }
      }
    </script>
    <link href="app.css" rel="stylesheet" onload="this.onload=null;allChunksLoadedWebpackPlugin('app', 'app.css');">
  </head>
  <body>
    <script src="app.js" onload="this.onload=null;allChunksLoadedWebpackPlugin('app', 'app.js');"></script>
  </body>
</html>
```

## Options
You can pass a hash of configuration options to `all-chunks-loaded-webpack-plugin`. Allowed values are as follows:

|Name|Type|Default|Description|
|:--:|:--:|:-----:|:----------|
|**`callback`**|`{String}`|`undefined`|Your callback called after all chunks loaded|
|`chunks`|`{String[]}`|`null`|Allows you to callback called only some chunks loaded|
|`excludeChunks`|`{String[]}`|`null`|Allows you to skip callback called some chunks|

Here's an example `webpack` config illustrating how to use these options:

**webpack.config.js**
```js
module.exports = {
  ...
  
  plugins: [
    new HtmlWebpackPlugin(),
    new AllChunksLoadedWebpackPlugin({
      callback: '/* Put your callback here */'
    }),
    ...
  ]
}
```

## Credit
* [HTML Webpack Plugin](https://github.com/jantimon/html-webpack-plugin) - Simplifies creation of HTML files to serve your webpack bundles.

## See also
* [async-stylesheet-webpack-plugin](https://github.com/devpreview/async-stylesheet-webpack-plugin) - Loading stylesheets asynchronously;
* [Script Extension for HTML Webpack Plugin](https://github.com/numical/script-ext-html-webpack-plugin) - Enhances html-webpack-plugin functionality with different deployment options for your scripts including 'async', 'preload', 'prefetch', 'defer', 'module', custom attributes, and inlining;
* [preload-webpack-plugin](https://github.com/GoogleChromeLabs/preload-webpack-plugin) - A webpack plugin for injecting <link rel='preload|prefecth'> into HtmlWebpackPlugin pages, with async chunk support.

## Need a feature?
Welcome to [issues](https://github.com/devpreview/all-chunks-loaded-webpack-plugin/issues)!
