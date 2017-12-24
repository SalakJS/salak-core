'use strict'

/**
 * 控制器中中间件处理逻辑
 *
 * 创 建 者：wengeek <wenwei897684475@gmail.com>
 * 创建时间：2017-12-19
 */

const toString = Object.prototype.toString
const util = require('../util')

class Middleware {
  constructor (name, module, options) {
    this.ignores = []
    this.onlies = []
    this.name = name
    this.module = module
    this.options = options
  }

  only (routes = '') {
    if (typeof routes === 'string') {
      routes = [routes]
    }

    if (Array.isArray(routes)) {
      routes.forEach((item = '') => {
        item = item.trim()
        if (item !== '' && this.onlies.indexOf(item) === -1) {
          this.onlies.push(item)
        }
      })
    }

    return this
  }

  except (routes) {
    if (typeof routes === 'string') {
      routes = [routes]
    }

    if (Array.isArray(routes)) {
      routes.forEach((item = '') => {
        item = item.trim()
        if (item !== '' && this.ignores.indexOf(item) === -1) {
          this.ignores.push(item)
        }
      })
    }

    return this
  }

  execute (action = '') {
    if (this.ignores.indexOf(action) !== -1 || (this.onlies.length > 0 && this.onlies.indexOf(action) === -1)) {
      return
    }

    return async (ctx, next) => {
      // 查找对应的middleware
      const middlewares = ctx.app.middlewares

      // 查询不到相应的模块，就查找系统内建的中间件
      const moduleMiddlewares = middlewares[this.module] || ctx.app.buildInMiddlewares
      const middleware = moduleMiddlewares[this.name]

      if (!middleware) {
        ctx.app.logger.app.warn(`cannot load middleware [${this.name}] in module [${this.module}]`)

        await next()
        return
      }

      const defaultConfig = ctx.app.configs[this.module][this.name]
      const rootConfig = ctx.app.root === this.module ? undefined : ctx.app.rootConfig[this.name]

      const config = util.combineConfig(rootConfig, defaultConfig, this.options)

      if (config && config.enable === false) {
        await next()
        return
      }

      const fn = middleware(config, ctx.app)
      if (toString.call(fn) !== '[object AsyncFunction]') {
        await next()
        return
      }

      await fn(ctx, next)
    }
  }
}

module.exports = Middleware
