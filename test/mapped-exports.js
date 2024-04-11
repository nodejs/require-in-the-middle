'use strict'

const semver = require('semver')
const test = require('tape')
const { Hook } = require('../')

// Mapped export tests require Node.js >=12.17.0 for "exports" support in package.json.
const nodeSupportsExports = semver.lt(process.version, '12.17.0')

test('handles mapped exports: mapped-exports/foo', { skip: nodeSupportsExports }, function (t) {
  t.plan(2)

  const hook = new Hook(['mapped-exports/foo'], function (exports, name) {
    t.equal(name, 'mapped-exports/foo')
    const answer = exports.answer
    exports.answer = function wrappedAnswer () {
      return 'wrapped-' + answer()
    }
    return exports
  })

  const foo = require('mapped-exports/foo')
  t.equal(foo.answer(), 'wrapped-42')

  hook.unhook()
})

test('handles mapped exports: mapped-exports/bar', { skip: nodeSupportsExports }, function (t) {
  t.plan(2)

  const hook = new Hook(['mapped-exports/bar'], function (exports, name) {
    t.equal(name, 'mapped-exports/bar')
    const answer = exports.answer
    exports.answer = function wrappedAnswer () {
      return 'wrapped-' + answer()
    }
    return exports
  })

  const bar = require('mapped-exports/bar')
  t.equal(bar.answer(), 'wrapped-42')

  hook.unhook()
})

test('handles mapped exports: picks up allow listed resolved module', { skip: nodeSupportsExports }, function (t) {
  t.plan(2)

  let hookHit = false
  const hook = new Hook(['@langchain/core/dist/callbacks/manager'], function (exports, name) {
    t.equal(name, '@langchain/core/dist/callbacks/manager.cjs')
    exports.BaseCallbackManager.prototype.setHandler = function () {
      hookHit = true
    }
    return exports
  })

  const { CallbackManager } = require('@langchain/core/callbacks/manager')
  const manager = new CallbackManager()
  manager.setHandler(() => {})
  t.equal(hookHit, true)

  hook.unhook()
})
