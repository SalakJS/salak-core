const Controller = require('../../../lib/controller')

class Comment extends Controller {
  static behaviors () {
    return {
      routes: {
      },
      rules: {
        index: {
          method: 'POST',
          meta: {
            summary: '创建文章',
            description: '创建',
            tags: ['Blog']
          }
        }
      }
    }
  }

  actionIndex () {
    this.ctx.body = 'hello, comment'
  }

  actionCreate () {
    this.ctx.body = 'hello create'
  }
}

module.exports = Comment
