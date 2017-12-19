const assert = require('assert')
const path = require('path')
const fs = require('fs')
const globby = require('globby')
const debug = require('debug')('salak-core:util')

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
      ignore: null
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

      filesObj[properties] = this.loadFile(path.join(directory, item), true)
    }

    return filesObj
  }
}
