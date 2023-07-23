import HtmlWebPackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import webpack from 'webpack'

/**
 * @type {import('webpack').Configuration}
 */
const config = {
  devtool: 'source-map',
  entry: './src/index.js',
  resolve: {
    conditionNames: ['worker'],
    alias: {
      path: 'path-browserify'
    }
  },
  module: {
    exprContextRegExp: /$^/,
    exprContextCritical: false,
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(svg|ttf)$/,
        type: 'asset/resource'
      },
      {
        test: /\/fixtures\/demo\//,
        type: 'asset/source'
      },
      {
        test: /\.d\.ts$/,
        type: 'asset/source'
      }
    ]
  },
  plugins: [
    new webpack.IgnorePlugin({resourceRegExp: /perf_hooks/}),
    new HtmlWebPackPlugin(),
    new MiniCssExtractPlugin({filename: '[contenthash].css'})
  ]
}

export default config
