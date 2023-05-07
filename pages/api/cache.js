
import { createClient } from "redis"

async function connectToRedis() {
  const redisClient = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_URL,
      post: process.env.REDIS_PORT,
    }
  })
  await redisClient.connect()
  return redisClient
}

const redisClient = await connectToRedis()

async function getValue(key) {
  return new Promise((res, rej) => {
    redisClient.get(key, (err, val) => {
      if (err) return rej(err)
      return res(val)
    })
  })
}

async function setValue(key, val, expiresIn) {
  return new Promise((res, rej) => {
    redisClient.setEx(key, expiresIn, val, (err, setValue) => {
      if (err) return rej(err)
      return res(setValue)
    })
  })
}

function generateCacheKey(key) {
  console.log(`passed key: ${key}`)
  return key.toUpperCase().replace(" ", "_")
}

export async function cache(key, fn, expiresIn = 60) {
  const transformedKey = generateCacheKey(key)
  console.log(`Transformed key: ${transformedKey}`)
  const cached = await getValue(transformedKey)
  console.log(`cached value: ${cached}`)
  if (cached !== null) {
    try {
      const parsedJSON = JSON.parse(cached)
      return parsedJSON
    } catch (e) {
      console.log(e)
    }
  }
  const val = await fn(key)
  console.log(`get value from callback: ${val} as not cached`)
  await setValue(transformedKey, JSON.stringify(val), expiresIn)
  return val
}
