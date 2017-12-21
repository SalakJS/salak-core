'use strict'

/**
 * 配置获取
 *
 * 创 建 者：wengeek <wenwei897684475@gmail.com>
 * 创建时间：2017-12-20
 */

const util = require('../../util')
const assert = require('assert')
const path = require('path')

const GET_MODULE_PATHS = Symbol('salakCore#getModulePaths')

module.exports = {
  getConfig (dir) {
    if (!dir) {
      dir = path.join(this.baseDir, this.root)
    }

    const configDir = path.join(dir, 'config')

    return Object.assign({}, util.loadFile(path.join(configDir, 'default.js')) || {}, util.loadFile(path.join(configDir, `${this.env}.js`)) || {})
  },

  // 获取所有模块配置
  getModuleConfigs (config) {
    const bootstrapsPath = this[GET_MODULE_PATHS](config.bootstraps)
    const configs = {}

    for (let key in bootstrapsPath) {
      configs[key] = this.getConfig(bootstrapsPath[key])
    }

    return {
      modules: Object.assign({}, bootstrapsPath, {
        [this.root]: path.join(this.baseDir, this.root)
      }),
      configs: Object.assign({}, configs, {
        [this.root]: config
      })
    }
  },

  [GET_MODULE_PATHS] (bootstraps = []) {
    const paths = {}

    for (let item of bootstraps) {
      if (typeof item === 'string') {
        paths[item] = path.join(this.baseDir, item)
      } else if (typeof item === 'object') {
        assert(Object.keys(item).length === 1, 'module config object must have only one key.')

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
