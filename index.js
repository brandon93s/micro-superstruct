'use strict'
const {json, createError} = require('micro')
const {StructError, Struct, validate} = require('superstruct')

const isStruct = x => x instanceof Struct

module.exports = opt => handler => async (request, response, ...restArgs) => {
	if (isStruct(opt)) {
		opt = {body: opt}
	}

	if (typeof opt !== 'object') {
		throw createError(500, `micro-superstruct: Parameter must be a \`Struct\` or object, not ${typeof opt}`)
	}

	if (isStruct(opt.body)) {
		const body = await json(request)
		const [error] = validate(body, opt.body)
		if (error instanceof StructError) {
			throw createError(400, error.message, error)
		}
	}

	if (isStruct(opt.query)) {
		const {search} = new URL(request.url, `http:\\${request.headers.host}`)
		const searchParameters = Object.fromEntries(new URLSearchParams(search))
		const [error] = validate(searchParameters, opt.query)
		if (error instanceof StructError) {
			throw createError(400, error.message, error)
		}
	}

	return handler(request, response, ...restArgs)
}
