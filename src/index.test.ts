import mongoose from 'mongoose'
import * as dotenv from 'dotenv'
import test from 'ava'

import Mongos from './index'

dotenv.config()

const mongoConfig = {
  host: process.env.HOST as string,
  database: process.env.DB as string,
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
}
const { Schema } = mongoose

const userSchema = new Schema(
  {
    username: String,
    avatar: String,
  },
  {
    timestamps: true,
  }
)

/**
 * Silent log
 */
console.debug = console.info = console.warn = console.error = () => {}

test('should init models on connection', (t) => {
  const mongo = new Mongos(mongoConfig)

  const UserModel = mongo.connection.model('User', userSchema)

  t.is(Object.keys(mongo.connection.models).length, 1)
  t.is(mongo.connection.models.User, UserModel)
})

test('should connect to the MongoDB server automatically', (t) => {
  const mongo = new Mongos(mongoConfig)

  t.is(mongo.connection.readyState, 2)
})

test('should connect to the MongoDB server manually', async (t) => {
  const mongo = new Mongos(mongoConfig, {
    lazyConnect: true,
  })

  t.is(mongo.connection.readyState, 0)

  mongo.connect().catch(() => {})

  t.is(mongo.connection.readyState, 2)
})

test("should trigger one attempt to connect if calling connect() on a connection that is not in 'connected' state", async (t) => {
  const mongo = new Mongos(mongoConfig)

  t.is(mongo.connection.readyState, 2)

  const action = mongo.connect()

  t.is(typeof action.then, 'function')
  t.is(action instanceof Promise, true)

  action.catch(() => {})

  t.is(mongo.connection.readyState, 2)
})

test('should close the connection', async (t) => {
  const mongo = new Mongos(mongoConfig, {
    lazyConnect: true,
  })

  t.is(mongo.connection.readyState, 0)

  mongo.connect().catch(() => {})

  t.is(mongo.connection.readyState, 2)

  mongo.disconnect().catch(() => {})

  t.is(mongo.connection.readyState, 0)
})
