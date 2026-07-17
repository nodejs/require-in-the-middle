'use strict'

const fs = require('fs')
const Module = require('module')
const path = require('path')
const vm = require('vm')
const test = require('tape')

test('loads and hooks modules when require.resolve is unavailable', function (t) {
  const filename = path.join(__dirname, '..', 'index.js')
  const source = fs.readFileSync(filename, 'utf8')
  const indexModule = {
    exports: {},
    filename,
    paths: Module._nodeModulePaths(path.dirname(filename))
  }
  const requireFromIndex = require('module').createRequire
    ? require('module').createRequire(filename)
    : require
  const seaRequire = function (id) {
    return requireFromIndex(id)
  }

  // Node SEA does not expose require.resolve. Keep the other properties used
  // by the module loader so this only models that SEA-specific difference.
  seaRequire.cache = require.cache

  const wrapper = vm.runInThisContext(Module.wrap(source), { filename })
  t.doesNotThrow(function () {
    wrapper.call(
      indexModule.exports,
      indexModule.exports,
      seaRequire,
      indexModule,
      filename,
      path.dirname(filename)
    )
  })

  t.equal(typeof indexModule.exports.Hook, 'function')

  const hook = new indexModule.exports.Hook(['path'], function (exports) {
    return exports
  })
  t.doesNotThrow(function () {
    requireFromIndex('path')
  })
  hook.unhook()

  t.end()
})
