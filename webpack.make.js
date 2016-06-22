require('dotenv').load()
var assert = require('assert')
var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')

// this regex should be modified to match your setup.
// in this app, we know route components are any files
// matching screens/*.js or screens/SOMETHING/*.js
// screens/components/**/*.js will be ignored

// var routeComponentRegex = /screens\/([^\/]+\/?[^\/]+).js/
var routeComponentRegex = /screens\/([^\/]+\/?)index.js/ // preferrably index.js

module.exports = function createWebpackConfig (env) {
  assert([
    'development',
    'test',
    'production'
  ].indexOf(env) !== -1, 'Invalid environment specified: ' + env)

  return {
    devtool: ({
      development: 'cheap-module-eval-source-map',
      test: 'inline-source-map'
    })[env],

    entry: ({
      development: [
        'webpack-hot-middleware/client',
        './client/index'
      ],
      production: {
        app: './client/index.js'
      }
    })[env],

    output: ({
      development: {
          filename: 'app.js',
          path: path.join(__dirname, 'dist'),
          chunkFilename: '[id].chunk.js',
          publicPath: '/'
      },
      production: {
        filename: '[name].[hash].min.js',
        path: path.join(__dirname, 'dist'),
        chunkFilename: '[id].chunk.js',
        publicPath: '/'
      }
    })[env],

    plugins: [
        new webpack.DefinePlugin({
          'process.env': {
            'NODE_ENV': JSON.stringify(env)
          },
          '__DEVTOOLS__': env === 'production' ? 'false' : JSON.stringify(JSON.parse(process.env.DEVTOOLS || 'false')),
          '__LOGGER__': env === 'production' ? 'false' : 'true',
          'API_URL': JSON.stringify(process.env.API_URL),
          'HOST_URL': JSON.stringify(process.env.HOST_URL),
        }),
        env === 'development' && new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new ExtractTextPlugin('[name].[hash].min.css', {
            allChunks: true,
            disable: env !== 'production'
        }),
        env === 'production' && new webpack.optimize.UglifyJsPlugin({
          compressor: {
            warnings: false
          },
          sourceMap: false
        }),
        new HtmlWebpackPlugin({
            title: 'StudyKiK',
            filename: 'index.html',
            template: 'server/views/index.template.html'
        }),
        new HtmlWebpackPlugin({
            title: 'StudyKiK - Error',
            filename: '404.html',
            template: 'server/views/404.template.html'
        })
    ].filter(id),

    resolve: {
      modulesDirectories: [
        'shared',
        'node_modules'
      ],
      alias: {
        'constants$': __dirname + '/client/constants.js',
        assets: __dirname + '/client/assets',
        actions: __dirname + '/client/actions',
        utils: __dirname + '/client/utils',
      },
      root: path.resolve('./'),
    },

    module: {
      noParse: [ /moment.js/ ],
      loaders: [
        {
          test: /\.less$/,
          loader: ExtractTextPlugin.extract(
            'style',
            env === 'production' ?
              'css!less' :
              'css?sourceMap!less?sourceMap'
          )
        }, {
          // make sure to exclude route components here
          test: /\.js$/,
          exclude: routeComponentRegex,
          include: path.resolve(__dirname, 'client'),
          loader: 'babel',
          query: {
            cacheDirectory: true,
            presets: [ 'es2015', 'stage-0', 'react' ]
          },
        }, {
          // lazy load route components
          test: routeComponentRegex,
          include: path.resolve(__dirname, 'client'),
          loaders: ['bundle?lazy', 'babel?cacheDirectory=ture,presets[]=es2015,presets[]=stage-0,presets[]=react']
        }, {
          test: /\.json$/,
          loader: 'json'
        }, {
          test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'url-loader?limit=10000&mimetype=application/font-woff'
        }, {
          test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'file-loader'
        }, {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract(
            'style',
            env === 'production' ?
              'css!cssnext' :
              'css?sourceMap!cssnext?sourceMap'
          )
        }, {
          test: /\.png$/,
          loader: env === 'production' ?
            'url-loader?limit=10240' :
            'url-loader',
          query: {
            mimetype: 'image/png'
          }
        }, {
          test: /\.jpg$/,
          loader: env === 'production' ?
            'url-loader?limit=10240' :
            'url-loader',
          query: {
            mimetype: 'image/jpeg'
          }
        }

      ].filter(id)
    },

    cssnext: {
      browsers: 'last 2 versions'
    },

    watch: env === 'test'
  }
}

function id (x) { return x }
