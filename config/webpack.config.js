var path = require('path');
var webpack = require('webpack');

var production = process.env.NODE_ENV === 'production';

var config = module.exports = {
  // the base path which will be used to resolve entry points
  context: __dirname,
  // the main entry point for our application's frontend JS
  entry: {
    'application': path.join(__dirname, '..', 'webpack', 'application.js'),
    'characterCrud': path.join(__dirname, '..', 'webpack', 'characterCrud.js')
  },

  output: {
    // this is our app/assets/javascripts directory, which is part of the Sprockets pipeline
    path: path.join(__dirname, 'app', 'assets', 'javascripts'),
    publicPath: '/assets/',

    filename: production ? '[name]-[chunkhash].js' : '[name]-bundle.js',

    //for proper sourcemaps nesting
    devtoolModuleFilenameTemplate: '[resourcePath]',
    devtoolFallbackModuleFilenameTemplate: '[resourcePath]?[hash]'
  },

  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel', // 'babel-loader' is also a valid name to reference
      query: {
        presets: ['es2015']
      }
    }]
  },

  devtool: 'source-map',

  resolve: {
    // tell webpack which extensions to auto search when it resolves modules. With this,
    // you'll be able to do `require('./utils')` instead of `require('./utils.js')`
    extensions: ['', '.js'],
    // by default, webpack will search in `web_modules` and `node_modules`. Because we're using
    // Bower, we want it to look in there too
    modulesDirectories: [ 'node_modules', 'bower_components', 'frontend'],
    modules: [path.resolve(__dirname, '/app/frontend/javscripts'), 'node_modules']
  },

  plugins: [
    // we need this plugin to teach webpack how to find module entry points for bower files,
    // as these may not have a package.json file
    new webpack.ResolverPlugin([
      new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('.bower.json', ['main'])
    ]),
    new webpack.ProvidePlugin({
      ko: 'knockout'
    })
  ]
};