var BrowserSyncPlugin = require('browser-sync-webpack-plugin');

module.exports = {
    entry: './src/js/app.js',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.min.js',
        publicPath: '/dist/'
    },
    module: {
        loaders: [
          {
            test: /\.scss$/,
            loaders: [
              'style-loader',
              'css-loader',
              'sass-loader'
            ]
          },
          {
            test: /\.(svg|gif|png|eot|woff|ttf)$/,
            loader: 'url-loader'
          },
          {
            test: /\.js$/,
            loader: 'babel-loader?presets[]=es2015'
          },
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