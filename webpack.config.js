const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

const additionalPlugins = [];
if (isProduction) {
	additionalPlugins.push(
		new UglifyJSPlugin({
			uglifyOptions: {
				output: { comments: false },
			},
		})
	);
}

module.exports = {
	entry: {
		content: path.resolve(__dirname, 'src/content/index.js'),
	},

	devtool: isProduction ? 'source-map' : 'inline-source-map',

	output: {
		filename: '[name].js',
		chunkFilename: '[name].chunk.js',
		path: path.resolve(__dirname, 'dist'),
	},

	resolve: {
		extensions: ['.js'],
		modules: ['node_modules'],
	},

	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
			},
		],
	},

	plugins: [
		new webpack.optimize.ModuleConcatenationPlugin(),
		new CopyWebpackPlugin([{ from: './static' }]),
	].concat(additionalPlugins),
};
