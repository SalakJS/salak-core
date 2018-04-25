const Salak = require('..')

const app = new Salak({
  baseDir: __dirname
})

app.beforeStart(async () => {
  // delay 3 seconds
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true)
    }, 3000)
  })
})

app.on('ready', function () {
  this.listen(3000)
})
