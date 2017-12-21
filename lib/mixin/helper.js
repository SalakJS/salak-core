'use strict'

/**
 * 加载公共模块helper
 *
 * 创 建 者：wengeek <wenwei897684475@gmail.com>
 * 创建时间：2017-12-21
 */

const util = require('../../util')
const path = require('path')

module.exports = {
  loadHelper () {
    const helperPath = path.join(this.baseDir, this.root, 'helper', 'index.js')

    return util.loadFile(helperPath) || {}
  }
}
