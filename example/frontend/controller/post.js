const Controller = require('../../../lib/controller')

class Post extends Controller {
  constructor (...args) {
    super(...args)

    this.middleware('auth', this.module, { a: 'what hahaah' }).only('index')
  }

  static behaviors () {
    return {
      routes: {
      },
      rules: {
        index: {
          meta: {
            summary: '创建文章',
            description: '创建',
            tags: ['Blog']
          },
          validate: {
          }
        }
      }
    }
  }

  actionIndex () {
    this.service('post').create()
    this.ctx.body = 'hello, post!'
  }

  actionCreate () {
    this.ctx.body = 'hello, now create post.'
  }
}

module.exports = Post
