const defaults = {
  level: 'auto',
  category: 'http'
}

// 1. 获取category
// 2. 拦截http请求
module.exports = (options, app) => {
  let { level, category } = Object.assign({}, defaults, options)

  return async (ctx, next) => {
    const meta = {
      start: Date.now()
    }

    let error

    // 解析request
    meta.req = parseRequest(ctx.request)

    try {
      await next()
    } catch (err) {
      error = err
    } finally {
      // 记录日志
      meta.duration = Date.now() - meta.start
      meta.res = parseResponse(ctx.response)

      const logLevel = getLogLevel(meta.res.status, level)
      const msg = getParsedMsg(meta)
      app.logger[category][logLevel](msg, meta)
    }

    if (error) {
      throw error
    }
  }
}

function getParsedMsg (meta) {
  const { req, res } = meta

  return `${req.ip} - - "${req.method} ${req.url} HTTP/${req.httpVersion}" ${res.status} ${res.headers.contentLength || 0} "${req.headers.referer || ''}" "${req.headers['user-agent'] || 'unknow'}" - ${meta.duration} ms`
}

function parseRequest (request) {
  const headers = {}
  const ignoreHeaderKeys = ['cookie']
  for (let key in request.header) {
    if (ignoreHeaderKeys.indexOf(key) === -1) {
      headers[key] = request.headers[key]
    }
  }

  const data = {
    headers,
    protocol: request.protocol,
    url: request.url,
    method: request.method,
    query: request.query,
    httpVersion: request.req.httpVersionMajor + '.' + request.req.httpVersionMinor,
    ip: request.header['x-forwarded-for'] || request.ip || request.ips,
    href: request.href
  }

  return data
}

function parseResponse (response) {
  const data = {
    status: response.status,
    headers: {
      contentType: response.header['content-type'],
      contentLength: response.header['content-length'] || response.length || 0
    }
  }

  return data
}

function getLogLevel (statusCode = 200, defaultLevel = 'info') {
  if (defaultLevel === 'auto') {
    if (statusCode >= 400) {
      return 'error'
    }

    if (statusCode >= 300) {
      return 'warn'
    }

    return 'info'
  }

  return defaultLevel
}
