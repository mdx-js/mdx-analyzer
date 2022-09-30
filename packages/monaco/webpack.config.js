import { fileURLToPath } from 'node:url'

import HtmlWebPackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

const monacoUnified = new URL('../../', import.meta.url)
const nodeModules = new URL('node_modules/', monacoUnified)

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
  resolve: {
    alias: {
      'decode-named-character-reference': fileURLToPath(
        new URL('decode-named-character-reference/index.js', nodeModules),
      ),
    },
  },
  module: {
    exprContextRegExp: /$^/,
    exprContextCritical: false,
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
