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
    const allModules = Object.assign({}, modules, {
      [this.root]: path.join(this.baseDir, this.root)
    })

    for (let key in allModules) {
      filesObj[key] = util.loadDir({
        directory: path.join(allModules[key], property),
        match: options.match || ['*.js']
      })
    }

    return filesObj
  }
}

const mixins = [
  require('./mixin/config'),
  require('./mixin/log'),
  require('./mixin/router'),
  require('./mixin/middleware')
]

for (let mixin of mixins) {
  Object.assign(SalakLoader.prototype, mixin)
}

module.exports = SalakLoader
