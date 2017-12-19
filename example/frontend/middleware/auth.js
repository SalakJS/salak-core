module.exports = (options, app) => {
  return async (ctx, next) => {
    console.log('run auth')
    await next()
  }
}
