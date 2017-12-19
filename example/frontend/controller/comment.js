const Controller = require('../../../lib/controller')

class Post extends Controller {
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
          },
          validate: {
            params: {
              id: '^[0-9a-fA-F]{24}$'
            }
          }
        }
      }
    }
  }

  actionIndex () {
    this.ctx.body = 'hello, comment'
  }

  actionCreate () {

  }
}

module.exports = Post
