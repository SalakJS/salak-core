module.exports = (options, app) => {
  return async (ctx, next) => {
    console.log('trigger error middleware')

    await next()
  }
}
