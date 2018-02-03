# micro-superstruct [![Build Status](https://travis-ci.org/brandon93s/micro-superstruct.svg?branch=master)](https://travis-ci.org/brandon93s/micro-superstruct)

> A [Superstruct](https://github.com/ianstormtaylor/superstruct) wrapper for [Micro](https://github.com/zeit/micro) to validate your request body and query parameters.

## Install

```shell
yarn add micro-superstruct
```

## Usage

```js
const { struct } = require('superstruct')
const { json, send } = require('micro')
const validate = require('micro-superstruct')

// define a Superstruct `struct`
const Unicorn = struct({
  name: 'string',
  age: 'number',
  color: 'string'
})

// create a validator
const validator = validate(Unicorn)

// write your Micro API
const handler = async (req, res) => {
  const body = await json(req)
  send(res, 200, body)
}

// export validated service
module.exports = validator(handler)
```

## API

### validate(config)

Returns a validator function that can be used to validate a Micro handler.

#### config

Config supports passing a `struct` or an object containing a `struct` for body and/or query validation. If a `struct` is passed directly, it will be used for body validation. If providing an object, both the body and query are optional:

```js
// body validation
validate(struct({}))

// body and/or query validation
validate({
  body: struct({}),
  query: struct({})
})
```

## License

MIT © [Brandon Smith](https://github.com/brandon93s)
