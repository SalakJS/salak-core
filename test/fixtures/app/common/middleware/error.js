module.exports = (options, app) => {
  return async (ctx, next) => {
    try {
      await next()
      if (ctx.response.status === 404 && !ctx.response.body) {
        ctx.throw(404)
      }
    } catch (err) {
      ctx.status = err.status || 500
      ctx.body = 'error.'
    }
  }
}
