var BrowserSyncPlugin = require('browser-sync-webpack-plugin');

module.exports = {
    entry: './src/js/app.js',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.min.js',
        publicPath: '/dist/'
    },
    module: {
        rules: [
          {
            test: /\.scss$/,
            use: [{
              loader: 'style-loader', // inject CSS to page
            }, {
              loader: 'css-loader', // translates CSS into CommonJS modules
            }, {
              loader: 'postcss-loader', // Run post css actions
              options: {
                plugins: function () { // post css plugins, can be exported to postcss.config.js
                  return [
                    require('precss'),
                    require('autoprefixer')
                  ];
                }
              }
            }, {
              loader: 'sass-loader' // compiles Sass to CSS
            }]
          },
          {
            test: /\.(svg|gif|png|eot|woff|ttf)$/,
            loader: 'url-loader'
          },
          {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader'
            }
          }
        ]
    },

    devServer: {
        contentBase: __dirname + '/src',
        port: 3333
    },
    plugins: [
      new BrowserSyncPlugin({
          host: 'localhost',
          proxy: 'http://localhost:3333'
      })
  ]
};