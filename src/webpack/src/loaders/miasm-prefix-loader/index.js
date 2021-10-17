/* eslint-disable */
var loaderUtils = require('loader-utils');
var SourceNode = require('source-map').SourceNode;
var SourceMapConsumer = require('source-map').SourceMapConsumer;

module.exports = function (content, sourceMap) {
  if(this.cacheable) {
    this.cacheable();
  }
  var options = loaderUtils.getOptions(this) || [];
  var MIASM_PREFIX = "\/*hello shaoxuezheng awesome project*\/\n\n";
  console.log(sourceMap, "====sourceMap======");
  if(options.sourceMap && sourceMap) {
    console.log(options, "====here======");
    var currentRequest = loaderUtils.getCurrentRequest(this);
    var node = SourceNode.fromStringWithSourceMap(content, new SourceMapConsumer(sourceMap));
    node.prepend(MIASM_PREFIX);
    var result = node.toStringWithSourceMap({file: currentRequest});
    console.log(result, '====result====');
    var callback = this.async();
    callback(null, result.code, result.map.toJSON());
  }
  console.log(MIASM_PREFIX);

  return MIASM_PREFIX + content;
};
