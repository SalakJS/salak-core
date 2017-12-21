'use strict'

/**
 * 基础上下文，基类
 *
 * 创 建 者：wengeek <wenwei897684475@gmail.com>
 * 创建时间：2017-12-19
 */

const INIT = Symbol('salakCore#ContextInit')

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
    // module无传参往上追溯
    if (!module) {
      const moduleConfig = this.app.configs[this.module]
      let value = moduleConfig[key]

      if (value) {
        return value
      }

      if (this.module !== this.root) {
        return this.app.rootConfig[key]
      }
      return
    }

    return this.app.configs[module][key]
  }
}

['model', 'service'].forEach((item) => {
  Context.prototype[item] = function (name, module) {
    if (!module) {
      module = this.module
    }

    const items = this.app[`${item}s`][module]
    if (!items || !items[name]) {
      this.logger.app.error(`cannot find ${item}: ${name}`)
      return
    }

    const Item = items[name]

    return new Item(this.ctx, this.next, this.module)
  }
})

module.exports = Context
