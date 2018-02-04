const test = require('ava')
const listen = require('test-listen')
const {struct} = require('superstruct')
const microSuperstruct = require('./index')
const micro = require('micro')
const request = require('request-promise')

const Article = struct({
  id: 'number',
  title: 'string',
  is_published: 'boolean?',
  tags: ['string'],
  author: {
    id: 'number'
  }
})

const Name = struct({
  first: 'string'
})

const handler = async (req, res) => {
  const body = await micro.json(req)
  micro.send(res, 200, body)
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

  const res = await request({
    method: 'POST',
    uri: url,
    headers: {
      'content-type': 'application/json'
    },
    body: data,
    json: true
  })

  t.deepEqual(res, data)
})

test('response on valid query string', async t => {
  const validate = microSuperstruct({ query: Name })
  const router = micro(validate(handler))
  const url = await listen(router)

  const res = await request({
    method: 'POST',
    uri: `${url}?first=Brandon`,
    headers: {
      'content-type': 'application/json'
    },
    body: {
      hello: 'world'
    },
    json: true
  })

  t.deepEqual(res, { hello: 'world' })
})

test('response on valid body & query string', async t => {
  const validate = microSuperstruct({ body: Article, query: Name })
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

  const res = await request({
    method: 'POST',
    uri: `${url}?first=Brandon`,
    headers: {
      'content-type': 'application/json'
    },
    body: data,
    json: true
  })

  t.deepEqual(res, data)
})

test('error on invalid body', async t => {
  const validate = microSuperstruct({ body: Article })
  const router = micro(validate(handler))
  const url = await listen(router)

  const data = {
    title: 'Unicorn Article',
    tags: ['some_tag'],
    author: {
      id: 1
    }
  }

  try {
    await request({
      method: 'POST',
      uri: url,
      headers: {
        'content-type': 'application/json'
      },
      body: data,
      json: true
    })
  } catch (err) {
    t.is(err.statusCode, 400)
    t.is(err.error, 'Expected a value of type `number` for `id` but received `undefined`.')
  }
})

test('error on invalid query string', async t => {
  const validate = microSuperstruct({ query: Name })
  const router = micro(validate(handler))
  const url = await listen(router)

  try {
    await request({
      method: 'POST',
      uri: url,
      headers: {
        'content-type': 'application/json'
      },
      body: {
        hello: 'world'
      },
      json: true
    })
  } catch (err) {
    t.is(err.statusCode, 400)
    t.is(err.error, 'Expected a value of type `string` for `first` but received `undefined`.')
  }
})

test('error on invalid input', async t => {
  const validate = microSuperstruct('unicorns')
  const router = micro(validate(handler))
  const url = await listen(router)

  try {
    await request({
      method: 'POST',
      uri: url
    })
  } catch (err) {
    t.is(err.statusCode, 500)
    t.true(err.error.startsWith('micro-superstruct'))
  }
})
