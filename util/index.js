'use strict'

/**
 * 工具类
 *
 * 创 建 者：wengeek <wenwei897684475@gmail.com>
 * 创建时间：2017-12-20
 */

const assert = require('assert')
const path = require('path')
const fs = require('fs')
const globby = require('globby')
const debug = require('debug')('salak-core:util')
const toString = Object.prototype.toString

module.exports = {
  /**
   * 加载文件
   */
  loadFile (filepath, throwError = false) {
    debug(`load file: ${filepath}`)

    // 文件不存在
    if (!fs.existsSync(filepath)) {
      if (throwError) {
        throw new Error(`${filepath} is not existed.`)
      }

      return
    }

    const obj = require(filepath)
    return obj
  },

  /**
   * 加载目录中的文件
   * 'a.b.c' => fn
   */
  loadDir (options) {
    assert(options.directory, 'options.directory is required.')
    const defaults = {
      match: ['**/*.js'],
      ignore: null,
      call: null
    }

    options = Object.assign({}, defaults, options)

    const { match, ignore, directory } = options

    debug(`load directory: ${directory}`)

    const filesObj = {}

    let files = match
    if (!Array.isArray(files)) {
      files = [files]
    }

    if (ignore) {
      if (Array.isArray(ignore)) {
        files = files.concat(ignore)
      } else {
        files.push(ignore)
      }
    }

    const filepaths = globby.sync(files, { cwd: directory })
    for (let item of filepaths) {
      const properties = item.substring(0, item.lastIndexOf('.')).split(/\/|\\/).filter((str) => str !== '').join('.')

      const fileObj = this.loadFile(path.join(directory, item), true)

      if (options.call) {
        filesObj[properties] = options.call(fileObj)
        continue
      }

      filesObj[properties] = fileObj
    }

    return filesObj
  },

  // 组合配置
  combineConfig (...args) {
    let config
    let configType

    for (let i = args.length - 1; i > -1; i--) {
      const arg = args[i]
      if (arg !== undefined) {
        configType = toString.call(arg)
        config = arg
        break
      }
    }

    if (configType === '[object Object]') {
      return Object.assign.apply({}, args.filter((item) => item))
    }

    return config
  }
}
