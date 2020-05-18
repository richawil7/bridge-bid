const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

  module.exports = {
    watch: false,
    mode: 'development',
    entry: './src/index.js',
    output: {
      publicPath: '/',
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist')
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-react',
                      '@babel/preset-env',
                      {
                        'plugins':
                          [
                            '@babel/plugin-proposal-class-properties'
                          ]
                      }
            ]
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.script\.js$/,
          use: [
              {
                  loader: 'script-loader',
                  options: {
                      sourceMap: true,
                  },
              },
          ]
        },
        {
          test: /\.(scss)$/,
          use: [
            {
              // Adds CSS to the DOM by injecting a `<style>` tag
              loader: 'style-loader'
            },
            {
              // Interprets `@import` and `url()` like `import/require()` and will resolve them
              loader: 'css-loader'
            },
            {
              // Loader for webpack to process CSS with PostCSS
              loader: 'postcss-loader',
              options: {
                plugins: function () {
                  return [
                    require('autoprefixer')
                  ];
                }
              }
            },
            {
              // Loads a SASS/SCSS file and compiles it to CSS
              loader: 'sass-loader'
            }
          ]
        },       
        {
            test: /\.(jpg|jpeg|gif|png|svg|webp)$/,
            use: [
                {
                    loader: "file-loader",
                    options: {
                        outputPath: './images',
                        name: "[name].[ext]",
                    },
                },
            ]
        },
        {
            test: /\.html$/,
            use: {
                loader: 'html-loader',
            }
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/index.html'
      })
    ]
  };
