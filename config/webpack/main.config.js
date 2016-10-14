var path = require('path');
var webpack = require('webpack');

var config = module.exports = {
  context: path.join(__dirname, '../', '../'),
};

var config.entry = {
  // your entry points
};

var config.output = {
  // your outputs
  // we'll be overriding some of these in the production config, to support
  // writing out bundles with digests in their filename
}