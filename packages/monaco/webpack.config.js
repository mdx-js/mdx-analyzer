import HtmlWebPackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

/**
 * @type {import('webpack').Configuration}
 */
export default {
  devtool: 'source-map',
  mode: 'development',
  entry: {
    main: './src/index.js',
    'custom.worker': './src/custom.worker.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(svg|ttf)$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin(),
    new MiniCssExtractPlugin({ filename: '[contenthash].css' }),
  ],
}
