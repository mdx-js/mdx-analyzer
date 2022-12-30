import HtmlWebPackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

/**
 * @type {import('webpack').Configuration}
 */
const config = {
  devtool: 'source-map',
  mode: 'development',
  entry: './src/index.js',
  resolve: {
    conditionNames: ['worker']
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
    new HtmlWebPackPlugin(),
    new MiniCssExtractPlugin({filename: '[contenthash].css'})
  ]
}

export default config
