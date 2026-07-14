'use strict'

const vm = require('vm')
const Module = require('module')
const path = require('path')
const fs = require('fs')
const test = require('tape')

// When require-in-the-middle is bundled by a tool like esbuild for an
// ESM/browser-like target, the top-level `require` binding used inside
// index.js is not the real Node.js `require` but a bundler-provided shim
// (e.g. esbuild's `__require` helper). That shim can still resolve real
// modules, but it has no `.cache` property, since only the real Node.js
// `require` has one.
//
// This test loads index.js's own source with such a shim substituted in for
// `require`, to reproduce that environment without needing an actual
// bundler in devDependencies.
// https://github.com/nodejs/require-in-the-middle/issues/113
test('does not throw when require.cache is missing (e.g. bundler shim)', function (t) {
  const indexPath = path.resolve(__dirname, '..', 'index.js')
  const src = fs.readFileSync(indexPath, 'utf8')
  const script = new vm.Script(Module.wrap(src), { filename: indexPath })
  const fn = script.runInThisContext()

  const fakeModule = { exports: {} }
  // A require shim with no `.cache` property, same shape as esbuild's.
  const fakeRequire = Object.assign(
    (id) => require(id),
    { resolve: require.resolve }
  )

  fn.call(fakeModule.exports, fakeModule.exports, fakeRequire, fakeModule, indexPath, path.dirname(indexPath))

  const { Hook } = fakeModule.exports

  let numOnRequireCalls = 0
  const hook = new Hook(['semver'], function (exports) {
    numOnRequireCalls++
    return exports
  })

  try {
    t.doesNotThrow(function () {
      require('semver')
    })
  } finally {
    hook.unhook()
  }

  t.equal(numOnRequireCalls, 1)
  t.end()
})
