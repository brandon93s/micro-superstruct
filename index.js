'use strict'

const { json, send } = require('micro')
const { StructError } = require('superstruct')
const url = require('url')

const isStruct = fn => typeof fn === 'function' && typeof fn.validate === 'function'

module.exports = opt => handler => async (req, res, ...restArgs) => {
  if (isStruct(opt)) {
    opt = { body: opt }
  }

  if (typeof opt !== 'object') {
    return send(res, 500, `micro-struct: Parameter must be a \`Struct\` or object, not ${typeof opt}`)
  }

  if (isStruct(opt.body)) {
    const body = await json(req)
    const [error] = opt.body.validate(body)
    if (error instanceof StructError) {
      return send(res, 400, error.message)
    }
  }

  if (isStruct(opt.query)) {
    const { query } = url.parse(req.url, true)
    const [error] = opt.query.validate(query)
    if (error instanceof StructError) {
      return send(res, 400, error.message)
    }
  }

  return handler(req, res, ...restArgs)
}
