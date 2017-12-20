'use strict'

/**
 * salak
 *
 * 创 建 者：wengeek <wenwei897684475@gmail.com>
 * 创建时间：2017-12-20
 */

const Koa = require('koa')
const assert = require('assert')
const fs = require('fs')
const SalakCoreLoader = require('./lib/salakLoader')
const BaseContext = require('./lib/context')

const INIT_READY = Symbol('salakCore#initReady')
const LOAD_MIDDLEWARES = Symbol('salakCore#loadMiddlewares')
const DEFAULTS = Symbol('salakCore#defaults')

class SalakCore extends Koa {
  constructor ({ baseDir = process.cwd(), opts = {
    root: 'common'
  }}) {
    assert(fs.existsSync(baseDir), `Directory ${baseDir} not exists`)
    assert(fs.statSync(baseDir).isDirectory(), `Directory ${baseDir} is not a directory`)

    super()
    this.baseDir = baseDir
    this.root = (opts && opts.root) || 'common' // common目录名字，通过opts.root 可修改目录名
    this.loader = new SalakCoreLoader({
      app: this,
      baseDir: baseDir,
      env: this.env
    })

    this[INIT_READY]()
  }

  [INIT_READY] () {
    this.rootConfig = this.loader.getConfig()

    assert(this.rootConfig.bootstraps, 'config key: bootstraps missing.')
    assert(this.rootConfig.bootstraps.length, 'config key: bootstraps must not be empty.')

    this.modules = this.loader.getModulePaths(this.rootConfig.bootstraps)
    this.moduleConfigs = this.loader.getModuleConfigs(this.modules)

    this.configs = Object.assign({}, {
      [this.root]: this.rootConfig
    }, this.moduleConfigs)

    this.logger = this.loader.loaderLogger(this.rootConfig.logger)

    this.middlewares = this.loader.loadDir(this.modules, 'middleware')

    this.models = this.loader.loadDir(this.modules, 'model')
    this.services = this.loader.loadDir(this.modules, 'service')

    this.buildInMiddlewares = SalakCore[DEFAULTS].buildInMiddlewares || {} // 框架自带的中间件
    this.buildInMiddlewaresOrder = SalakCore[DEFAULTS].buildInMiddlewaresOrder || []// 框架自带中间件默认执行顺序

    // 加载路由器
    const { router, routesDefinitions } = this.loader.loaderController(this.modules) || {}
    this.router = router
    // 可用于swagger
    this.routesDefinitions = routesDefinitions

    // 加载中间件
    this[LOAD_MIDDLEWARES]()
  }

  [LOAD_MIDDLEWARES] () {
    const middlewares = this.loader.loadMiddlewares(this.rootConfig.middleware || this.buildInMiddlewaresOrder, this.root)
    if (middlewares) {
      this.use(middlewares)
    }

    this.use(this.router.routes())
  }
}

SalakCore[DEFAULTS] = {
  buildInMiddlewares: {},
  buildInMiddlewaresOrder: []
}

SalakCore.Controller = require('./lib/controller')
SalakCore.Service = BaseContext
SalakCore.BaseContext = BaseContext

SalakCore.defaults = DEFAULTS
SalakCore.Joi = require('salak-router').Joi

module.exports = SalakCore
