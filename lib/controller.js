'use strict'

/**
 * Controller基类
 *
 * 创 建 者：wengeek <wenwei897684475@gmail.com>
 * 创建时间：2017-12-20
 */

const Context = require('./context')
const Middleware = require('./middleware')

const MIDDLEWARES = Symbol('controller#middlewares')
const BUILD_IN_ROUTES = Symbol('controller#buildInRoutes')

class Controller extends Context {
  constructor (...args) {
    super(...args)
    this[MIDDLEWARES] = []
  }

  middleware (name, module, options) {
    if (!module) {
      module = this.module
    }

    const middleware = new Middleware(name, module, options, this)

    this[MIDDLEWARES].push(middleware)
    return middleware
  }
}

// 内建的路由设置
Controller[BUILD_IN_ROUTES] = {}

module.exports = Controller
module.exports.middlewares = MIDDLEWARES
module.exports.buildInRoutes = BUILD_IN_ROUTES
