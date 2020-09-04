const test = require('ava')
const listen = require('test-listen')
const {array, object, number, string} = require('superstruct')
const microSuperstruct = require('.')
const micro = require('micro')
const got = require('got')

const Article = object({
	id: number(),
	title: string(),
	tags: array(string()),
	author: object({
		id: number()
	})
})

const Name = object({
	first: string()
})

const handler = async (request_, response) => {
	const body = await micro.json(request_)
	micro.send(response, 200, body)
}

test('response on valid body', async t => {
	const validate = microSuperstruct(Article)
	const router = micro(validate(handler))
	const url = await listen(router)

	const data = {
		id: 4,
		title: 'Unicorn Article',
		tags: ['some_tag'],
		author: {
			id: 1
		}
	}

	const response = await got.post(url, {json: data}).json()
	t.deepEqual(response, data)
})

test('response on valid query string', async t => {
	const validate = microSuperstruct({query: Name})
	const router = micro(validate(handler))
	const url = await listen(router)

	const data = {hello: 'world'}

	const response = await got.post(`${url}?first=Brandon`, {json: data}).json()
	t.deepEqual(response, data)
})

test('response on valid body & query string', async t => {
	const validate = microSuperstruct({body: Article, query: Name})
	const router = micro(validate(handler))
	const url = await listen(router)

	const data = {
		id: 4,
		title: 'Unicorn Article',
		tags: ['some_tag'],
		author: {
			id: 1
		}
	}

	const response = await got.post(`${url}?first=Brandon`, {json: data}).json()
	t.deepEqual(response, data)
})

test('error on invalid body', async t => {
	const validate = microSuperstruct({body: Article})
	const router = micro(validate(handler))
	const url = await listen(router)

	const data = {
		title: 'Unicorn Article',
		tags: ['some_tag'],
		author: {
			id: 1
		}
	}

	const {response} = await t.throwsAsync(got.post(url, {json: data}).json())
	t.is(response.statusCode, 400)
	t.is(response.body, 'Expected a value of type `number` for `id` but received `undefined`.')
})

test('error on invalid query string', async t => {
	const validate = microSuperstruct({query: Name})
	const router = micro(validate(handler))
	const url = await listen(router)

	const {response} = await t.throwsAsync(got.post(url, {json: {hello: 'world'}}).json())
	t.is(response.statusCode, 400)
	t.is(response.body, 'Expected a value of type `string` for `first` but received `undefined`.')
})

test('error on invalid input', async t => {
	const validate = microSuperstruct('unicorns')
	const router = micro(validate(handler))
	const url = await listen(router)

	const {response} = await t.throwsAsync(got.post(url).json())
	t.is(response.statusCode, 500)
	t.true(response.body.startsWith('micro-superstruct'))
})
