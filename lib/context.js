'use strict'

/**
 * 基础上下文，基类
 *
 * 创 建 者：wengeek <wenwei897684475@gmail.com>
 * 创建时间：2017-12-19
 */

const INIT = Symbol('salakCore#ContextInit')
const util = require('../util')

class Context {
  /**
   * @constructor
   * @param {Object} context ref => koa context
   * @param {Function} next 指针
   * @param {string} module 模块名称
   */
  constructor (context, next, module) {
    this.ctx = context
    this.next = next
    this.app = context.app
    this.logger = this.app.logger
    this.module = module

    this[INIT]()
  }

  [INIT] () {
    ['query', 'body'].forEach((item) => {
      Object.defineProperty(this, item, {
        get () {
          return this.ctx.request[item]
        }
      })
    })

    Object.defineProperty(this, 'helper', {
      get () {
        return this.app.helper
      }
    })
  }

  config (key, module) {
    if (!module) {
      module = this.module
    }

    if (module === this.app.root) {
      return this.app.rootConfig[key]
    }

    const config = this.app.rootConfig
    const configs = this.app.configs
    return util.combineConfig(config && config[key], configs[module] && configs[module][key])
  }

  service (name, module) {
    if (!module) {
      module = this.module
    }

    const services = this.app.services[module]
    if (!services || !services[name]) {
      this.logger.app.error(`cannot find service: ${name}`)
      return
    }

    const Service = services[name]

    return new Service(this.ctx, this.next, this.module)
  }
}

module.exports = Context
