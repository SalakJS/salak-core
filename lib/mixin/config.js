const util = require('../../util')
const assert = require('assert')
const path = require('path')

module.exports = {
  getConfig (dir) {
    if (!dir) {
      dir = path.join(this.baseDir, this.root)
    }

    const configDir = path.join(dir, 'config')

    return Object.assign({}, util.loadFile(path.join(configDir, 'default.js')) || {}, util.loadFile(path.join(configDir, `${this.env}.js`)) || {})
  },

  // 获取所有模块配置
  getModuleConfigs (modules = {}) {
    const configs = {}

    for (let key in modules) {
      configs[key] = this.getConfig(modules[key])
    }

    return configs
  },

  getModulePaths (bootstraps = []) {
    const paths = {}

    for (let item of bootstraps) {
      if (typeof item === 'string') {
        paths[item] = path.join(this.baseDir, item)
      } else if (typeof item === 'object') {
        assert(Object.keys(item).length === 1, 'module config object must have only keys.')

        for (let key in item) {
          paths[key] = item[key]
        }
      } else {
        assert(false, 'module config must be string or object.')
      }
    }

    return paths
  }
}
