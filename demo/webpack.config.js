// Import {fileURLToPath} from 'node:url'

import HtmlWebPackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

// Const projectRoot = new URL('../', import.meta.url)
// const nodeModules = new URL('node_modules/', projectRoot)

/**
 * @type {import('webpack').Configuration}
 */
const config = {
  devtool: 'source-map',
  mode: 'development',
  entry: {
    main: './src/index.js'
    // 'mdx.override': fileURLToPath(
    //   new URL('@mdx-js/monaco/mdx.override.js', nodeModules)
    // )
  },
  resolve: {
    conditionNames: ['worker']
    // Alias: {
    //   'decode-named-character-reference': fileURLToPath(
    //     new URL('decode-named-character-reference/index.js', nodeModules)
    //   )
    // }
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
