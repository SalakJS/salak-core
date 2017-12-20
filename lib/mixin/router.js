'use strict'

/**
 * 路由处理
 *
 * 创 建 者：wengeek <wenwei897684475@gmail.com>
 * 创建时间：2017-12-20
 */

const Router = require('salak-router')
const assert = require('assert')
const path = require('path')
const compose = require('koa-compose')
const util = require('../../util')
const debug = require('debug')('salak-core:router')

const DEFAULT_METHODS = ['GET']

module.exports = {
  loaderController (modules) {
    const { rootConfig, moduleConfigs } = this.app
    const { prefix, defaultRoute } = parseRootRoutes(rootConfig.routes)
    let setRootDefaultRoute = false

    const router = new Router({
      prefix
    })

    const routesDefinitions = { prefix, modules: [] }
    for (let key in modules) {
      const dir = modules[key]
      const moduleName = key
      const moduleRouteConfig = moduleConfigs[key]
      const { alias, modulePrefix = '', defaultModuleRoute } = parseModuleRoutes(moduleRouteConfig.routes)
      const routesFactory = []
      let setModuleDefaultRoute = false

      const filesObj = util.loadDir({
        directory: path.join(dir, 'controller')
      })

      // 检查是否为 /, 只能允许一个模块
      if (alias === '/') {
        assert(Object.keys(modules).length === 1, `module ${key} alias be / was not allowed. The alias / can be in the app which has one module`)
      }

      const moduleRouter = new Router({
        prefix: modulePrefix
      })

      if (moduleRouteConfig.middleware && moduleRouteConfig.middleware.length) {
        const moduleMiddlewares = this.loadMiddlewares(moduleRouteConfig.middleware, moduleName)
        if (moduleMiddlewares) {
          moduleRouter.use(moduleMiddlewares)
        }
      }

      debug(`add routes for module: ${key}`)
      for (let key in filesObj) {
        const Controller = filesObj[key]
        const behaviors = typeof Controller['behaviors'] === 'function' ? Controller['behaviors']() : {}
        const controllerName = key

        const { routes = {}, rules = {} } = behaviors || {}
        const actions = parseController(Controller)

        const moduleRoutes = combineRoutes(actions, Object.assign({}, Controller[Controller.buildInRoutes], routes), rules)

        for (let key in moduleRoutes) {
          const item = moduleRoutes[key]
          const actionMeta = actions[key]

          for (let pathKey in item) {
            let routePath = '/' + controllerName.replace(/\./g, '/') + pathKey

            if (routePath.endsWith('/')) {
              routePath = routePath.slice(0, -1)
            }

            const handler = async (ctx, next) => {
              const client = new Controller(ctx, next, moduleName)
              const params = actions[key].params
              const all = []
              // 执行内部middlewares
              for (let middleware of client[Controller.middlewares]) {
                const inlineMiddleware = middleware.execute(key)
                if (inlineMiddleware) {
                  all.push(inlineMiddleware)
                }
              }

              const parameters = params.map((item) => {
                return ctx.params[item]
              })

              all.push(client[actionMeta.key].bind(client, ...parameters))

              await compose(all)(ctx, next)
            }

            moduleRouter.addRoute({
              path: routePath,
              method: item[pathKey]['method'],
              validate: item[pathKey]['validate']
            }, handler)

            // 设置模块默认路由
            if (!setModuleDefaultRoute && defaultModuleRoute && defaultModuleRoute.controller === controllerName && defaultModuleRoute.action === key) {
              // 含params参数的默认路由取消设置
              if (actionMeta['params'].length > 0) {
                this.app.logger.app.warn('salak-core: The default route cannot contain the params.')
              } else {
                setModuleDefaultRoute = true
                moduleRouter.addRoute({
                  path: '/',
                  method: 'GET',
                  validate: item[pathKey]['validate']
                }, handler)
              }
            }

            // 设置根默认路由
            if (!setRootDefaultRoute && defaultRoute && defaultRoute.module === moduleName && defaultRoute.controller === controllerName && defaultRoute.action === key && actionMeta['params'].length === 0) {
              // 含params参数的默认路由取消设置
              if (actionMeta['params'].length > 0) {
                this.app.logger.app.warn('salak-core: The default route cannot contain the params.')
              } else {
                setRootDefaultRoute = true
                router.addRoute({
                  path: '/',
                  method: 'GET',
                  validate: item[pathKey]['validate']
                }, async (ctx, next) => {
                  // 需要执行原模块中间件
                  const all = []
                  if (moduleRouteConfig.middleware && moduleRouteConfig.middleware.length) {
                    const moduleMiddlewares = this.loadMiddlewares(moduleRouteConfig.middleware, moduleName)
                    if (moduleMiddlewares) {
                      all.push(moduleMiddlewares)
                    }
                  }

                  all.push(handler)
                  await compose(all)(ctx, next)
                })
              }
            }

            routesFactory.push({
              path: routePath,
              method: item[pathKey]['method'],
              meta: item[pathKey]['meta'],
              validate: item[pathKey]['validate'] || {}
            })
          }
        }
      }

      if (routesFactory.length > 0) {
        const moduleName = alias || key
        routesDefinitions.modules.push({
          name: moduleName,
          routes: routesFactory
        })

        if (moduleName === '/') {
          router.use('', moduleRouter.routes())
        } else {
          router.use(`/${moduleName}`, moduleRouter.routes())
        }
      }
    }

    return {
      router,
      routesDefinitions
    }
  }
}

function combineRoutes (actions, routes, rules) {
  const ret = {}
  for (let key in actions) {
    const item = actions[key]
    const { method, meta, validate } = rules[key] || {}
    ret[key] = {}

    let hasSpecified = false
    for (let item in routes) {
      if (routes[item] !== key) {
        continue
      }

      const httpAction = item.split(' ')
      if (httpAction.length < 2) {
        continue
      }

      const routeMethod = httpAction[0].toUpperCase()
      const routePath = httpAction[1].startsWith('/') ? httpAction[1] : '/' + httpAction[1]

      if (ret[key][routePath]) {
        ret[key][routePath]['method'] = combineMethods(ret[key][routePath]['method'], routeMethod)
        continue
      }

      ret[key][routePath] = {
        method: routeMethod,
        meta,
        validate
      }
      hasSpecified = true
    }

    // 有特定规则就不加入框架定义的规则
    if (hasSpecified) {
      continue
    }

    const isIndex = key === 'index'
    const defaultPath = `${isIndex ? '/' : '/' + key}` + (item.params.length > 0 ? (isIndex ? '' : '/') + item.params.map((item) => `:${item}`).join('/') : '')

    if (!ret[key][defaultPath]) {
      ret[key][defaultPath] = {
        method: method || DEFAULT_METHODS,
        meta,
        validate
      }
    }
  }

  return ret
}

function combineMethods (methods, method) {
  if (typeof methods === 'string') {
    methods = [methods]
  }

  if (methods.indexOf(method) === -1) {
    methods.push(method)
  }

  return methods
}

const COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg
const DEFAULT_PARAMS = /=[^,]+/mg
const FAT_ARROWS = /=>.*$/mg
function getParameterNames (fn) {
  const code = fn.toString()
    .replace(COMMENTS, '')
    .replace(FAT_ARROWS, '')
    .replace(DEFAULT_PARAMS, '')

  const result = code.slice(code.indexOf('(') + 1, code.indexOf(')'))
    .match(/([^\s,]+)/g)

  return result === null ? [] : result
}

function parseController (Controller) {
  const proto = Controller.prototype
  const keys = Object.getOwnPropertyNames(proto)

  const actions = {}
  for (let key of keys) {
    if (key.startsWith('action')) { // action
      let action = key.substring(6)

      if (action) {
        action = action[0].toLowerCase() + action.slice(1)

        actions[action] = {
          key,
          params: getParameterNames(proto[key])
        }
      }
    }
  }

  return actions
}

function parseRootRoutes (routes = {}) {
  const { prefix, defaultRoute } = routes
  let defaultAction

  if (defaultRoute && typeof defaultRoute === 'string') {
    const arr = defaultRoute.split('/').filter((item) => item !== '')
    if (arr.length > 1) {
      defaultAction = {
        module: arr[0],
        controller: arr[1],
        action: arr[2] || 'index'
      }
    }
  }

  return {
    prefix,
    defaultRoute: defaultAction
  }
}

function parseModuleRoutes (routes = {}) {
  const { alias, defaultRoute, prefix } = routes

  let defaultAction
  if (defaultRoute && typeof defaultRoute === 'string') {
    const arr = defaultRoute.split('/').filter((item) => item !== '')
    if (arr.length > 0) {
      defaultAction = {
        controller: arr[0],
        action: arr[1] || 'index'
      }
    }
  }

  return {
    defaultModuleRoute: defaultAction,
    alias,
    modulePrefix: prefix || ''
  }
}
