'use strict'

const path = require('path')

module.exports = {
  target: 'node',
  mode: 'production',
  entry: path.join(__dirname, 'test.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  externals: {
    semver: 'commonjs semver'
  }
}
