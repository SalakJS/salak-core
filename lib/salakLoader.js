'use strict'

/**
 * salak loader加载器
 *
 * 创 建 者：wengeek <wenwei897684475@gmail.com>
 * 创建时间：2017-12-20
 */

const assert = require('assert')
const path = require('path')
const util = require('../util')

class SalakLoader {
  constructor ({ app, baseDir }) {
    assert(app, 'options.app is required.')
    assert(baseDir, 'options.baseDir is required.')

    this.app = app
    this.baseDir = baseDir
    this.env = app.env
    this.root = app.root
  }

  loadDir (modules, property, options = {}) {
    const filesObj = {}

    for (let key in modules) {
      filesObj[key] = util.loadDir({
        directory: path.join(modules[key], property),
        match: options.match || ['*.js'],
        call: options.call
      })
    }

    return filesObj
  }
}

const mixins = [
  require('./mixin/config'),
  require('./mixin/log'),
  require('./mixin/router'),
  require('./mixin/middleware'),
  require('./mixin/helper')
]

for (let mixin of mixins) {
  Object.assign(SalakLoader.prototype, mixin)
}

module.exports = SalakLoader
