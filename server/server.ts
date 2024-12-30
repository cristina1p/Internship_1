import bcrypt from 'bcryptjs'
import { Request, Response, NextFunction } from 'express'
import jsonServer from 'json-server'
import jwt from 'jsonwebtoken'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { DbUser, convertDbUserToUser } from './dbModels'
import { findUserByEmail, respondWithError } from './helper'
import { User, Post, Gender } from '../src/models'

// Type for the database schema
interface Database {
  users: DbUser[]
  posts: Post[]
}

// Get the directory name of the current module file (for db.json path)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Create a new jsonServer instance
const server = jsonServer.create()

// Middleware to parse JSON bodies
server.use(jsonServer.bodyParser)

// Assuming `router.db` is a Lowdb instance with a JSON backend
const router = jsonServer.router<Database>(`${__dirname}/db.json`)
// Use default middlewares (for CORS, logging, etc.)
const middlewares = jsonServer.defaults()

interface RegisterRequestBody {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  gender: Gender
}

// Register a custom POST /register endpoint
server.post('/register', (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    gender,
  }: RegisterRequestBody = req.body

  if (!firstName || !lastName || !email || !gender || !password) {
    return respondWithError(
      res,
      400,
      'Firstname, lastname, email, gender, and password are required',
    )
  }

  if (password !== confirmPassword) {
    return respondWithError(
      res,
      400,
      'Password and Confirm Password should match',
    )
  }

  // Check if user already exists
  const dbUsers = router.db.get('users').value()
  const dbUser = findUserByEmail(dbUsers, email)
  if (dbUser) {
    return respondWithError(res, 400, 'User already exists')
  }

  // Hash the password
  const hashedPassword = bcrypt.hashSync(password, 10)

  // Create a new user object
  const newDbUser: DbUser = {
    id: dbUsers.length + 1,
    firstName,
    lastName,
    email,
    gender,
    role: 'User',
    password: hashedPassword,
  }

  // Save the new user to the "users" collection in the database
  router.db.get('users').push(newDbUser).write()

  res.status(201).json({
    message: 'User registered successfully',
    userDetails: convertDbUserToUser(newDbUser),
  })
})

interface LoginRequestBody {
  email: string
  password: string
}

// Set up a custom route for /login
server.post('/login', (req, res) => {
  const { email, password }: LoginRequestBody = req.body

  if (!email || !password) {
    return respondWithError(res, 400, 'Email and password are required')
  }

  // Check if user exists
  const dbUsers = router.db.get('users').value()
  const dbUser = findUserByEmail(dbUsers, email)
  if (!dbUser) {
    return respondWithError(res, 400, 'User not found')
  }

  // Verify the password
  const passwordIsValid = bcrypt.compareSync(password, dbUser.password)
  if (!passwordIsValid) {
    return respondWithError(res, 400, 'Invalid password')
  }

  // Create a JWT token
  const token = jwt.sign(
    { userId: dbUser.id, email: dbUser.email, role: dbUser.role },
    JwtSecretKey,
    {
      expiresIn: JwtExpirationTime,
    },
  )

  res.status(200).json({ message: 'Login successful', token })
})

interface RequestWithUser extends Request {
  user: User
}

const authenticateJwtMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers['authorization']?.split(' ')[1] // Extract token from 'Authorization' header

  if (!token) {
    // Forbidden if no token is found
    return respondWithError(res, 401, 'Invalid or expired token')
  }

  jwt.verify(token, JwtSecretKey, (err, user) => {
    if (err) {
      // Forbidden if token is invalid or expired
      return respondWithError(res, 401, 'Invalid or expired token')
    }

    ;(req as RequestWithUser).user = user as User // Attach the user information (payload) to the request object
    next() // Call the next middleware or route handler
  })
}

server.get('/users', authenticateJwtMiddleware, (req, res) => {
  const user = (req as RequestWithUser).user

  if (user.role !== 'Admin') {
    return respondWithError(res, 403, 'Forbidden')
  }

  const users = router.db.get('users').value()
  res.status(200).json({ users })
})

// Set up middlewares and router
server.use(middlewares)
server.use(router)

// Start server on a specific port
const port = process.env.PORT || 3000
server.listen(port, () => {
  console.log(`JSON Server is running at http://localhost:${port}`)
})

// TODO: pass as env variable
const JwtSecretKey =
  '6586172395e8565d23846bd5a8938525e2ad7c8cecdf7dcc32ce1ca04fffb35e69373e78e27dfe5002cda3c3eb101b550d73630e461f698560ba63b40f078a91'
const JwtExpirationTime = '1h'
