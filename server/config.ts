import dotenv from 'dotenv'

dotenv.config()

interface Config {
  port: string
  jwtSecretKey: string
  jwtExpirationTime: string
  dbPath: string
}

export const config: Config = {
  port: process.env.PORT || '3000',
  jwtSecretKey: process.env.JWT_SECRET_KEY || 'default-secret-key',
  jwtExpirationTime: process.env.JWT_EXPIRATION_TIME || '1h',
  dbPath: '/db.json',
}
