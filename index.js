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
const Ready = require('./util/ready')

const INIT_READY = Symbol('salakCore#initReady')
const LOAD_MIDDLEWARES = Symbol('salakCore#loadMiddlewares')
const DEFAULTS = Symbol('salakCore#defaults')

class SalakCore extends Koa {
  constructor ({ baseDir = process.cwd(), opts = {
    root: 'common',
    readyTimeout: 120000
  }}) {
    assert(fs.existsSync(baseDir), `Directory ${baseDir} not exists`)
    assert(fs.statSync(baseDir).isDirectory(), `Directory ${baseDir} is not a directory`)

    super()
    this.baseDir = baseDir
    this.BaseContext = BaseContext
    this.root = (opts && opts.root) || 'common' // common目录名字，通过opts.root 可修改目录名
    this.loader = new SalakCoreLoader({
      app: this,
      baseDir: baseDir,
      env: this.env
    })

    this.readyTimeout = (opts && opts.readyTimeout) || 120000
    this.readyInstance = Ready.getInstance({
      timeout: this.readyTimeout
    })

    this[INIT_READY]()
  }

  beforeStart (scope) {
    if (typeof scope === 'function') {
      this.readyInstance.ready(scope)
    }
  }

  [INIT_READY] () {
    this.rootConfig = this.loader.getConfig()
    this.mode = this.rootConfig.bootstraps && this.rootConfig.bootstraps.length ? 'multiple' : 'single' // 两种模式，单模块应用single 或者 多模块 multiple，根据bootstraps识别

    this.helper = this.loader.loadHelper()

    const { modules, configs } = this.loader.getModuleConfigs(this.rootConfig)
    this.modules = modules
    this.configs = configs

    this.logger = this.loader.loaderLogger(this.rootConfig.logger)
    this.services = this.loader.loadDir(this.modules, 'service')

    this.buildInMiddlewares = SalakCore[DEFAULTS].buildInMiddlewares || {} // 框架自带的中间件
    this.buildInMiddlewaresOrder = SalakCore[DEFAULTS].buildInMiddlewaresOrder || []// 框架自带中间件默认执行顺序

    this.readyInstance.on('timeout', () => {
      this.emit('ready_timeout')
      this.logger.app.error(`[salak-core:ready_timeout] ${this.readyTimeout / 1000 || 10000} seconds later was still unable to start. `)
    }).on('ready', () => {
      this.emit('ready')
      this.logger.app.info(`[salak-core:ready] salak was ready.`)
    })

    // for beforeStart
    process.nextTick(() => {
      this.readyInstance.ready(() => {
        this.middlewares = this.loader.loadDir(this.modules, 'middleware')
        // 加载路由器
        const { router, routesDefinitions } = this.loader.loaderController(this.modules) || {}
        this.router = router
        // 可用于swagger
        this.routesDefinitions = routesDefinitions

        // 加载中间件
        this[LOAD_MIDDLEWARES]()
      })

      this.readyInstance.ready(true)
    })
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
