'use strict'

const assert = require('assert')

const { Hook } = require('../../')

const hooked = []

// Hook all modules as @opentelemetry/instrumentation does.
const hook = new Hook('*', function (exports, name, basedir) {
  if (name === 'semver') {
    hooked.push(name)
    exports.patched = true
  }
  return exports
})

const semver = require('semver')
assert.strictEqual(semver.patched, true)
assert.deepStrictEqual(hooked, ['semver'])

hook.unhook()
