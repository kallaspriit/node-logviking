var path = require('path'),
	webpack = require('webpack');

module.exports = {
    entry: {
        logviking: './lib/index.js',
        dummy: './lib/dummy.js'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
        library: '[name]',
        libraryTarget: 'umd'
    },
	module: {
		loaders: [
			{
				test: /\.js$/,
				loaders: ['babel?stage=0']
			}
		]
	},

	plugins: [
		new webpack.NoErrorsPlugin()
	],

	stats: {
		colors: true
	},
}