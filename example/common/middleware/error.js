module.exports = (options, app) => {
  console.log('trigger once time')
  return async (ctx, next) => {
    console.log('trigger error middleware')

    await next()
  }
}
