const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './src/app.js',
    mode: 'development',
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        clean: true,
        //to clean the /dist folder before each build.
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 9000,
        historyApiFallback: true,
        //перенос всех запросов на главную страницу
    },
    module: {
        rules: [
            {
                test: /\.scss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    "style-loader",
                    // Translates CSS into CommonJS
                    "css-loader",
                    // Compiles Sass to CSS
                    "sass-loader",
                ],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./index.html"
        }),
        new CopyPlugin({
            patterns: [
                //что и куда копируем
                {from: "./src/templates", to: "templates"},
                {from: "./node_modules/bootstrap/dist/css/bootstrap.css", to: "css"},
                {from: "./node_modules/bootstrap/dist/js/bootstrap.bundle.js", to: "js"},
                {from: "./node_modules/jquery/dist/jquery.js", to: "js"},
                {from: "./node_modules/datatables.net/js/dataTables.js", to: "js"},
                {from: "./node_modules/moment/min/moment.min.js", to: "js"},
                {from: "./node_modules/moment/locale/ru.js", to: "js/moment-ru-locale.js"},
                {from: "./node_modules/chart.js/dist/chart.js", to: "js"}
            ],
        }),
    ],

};