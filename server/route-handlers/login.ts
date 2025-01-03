import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'
import jsonServer from 'json-server'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

import { config } from '../config'
import { respondWithError, findUserByEmail } from '../helper'
import { Database } from '../models'

// Zod schema, validates the structure of the incoming request body
export const LoginRequestBodySchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
})
// If data does not match this format, zod will return error
export const login =
  (router: jsonServer.JsonServerRouter<Database>) =>
  (req: Request, res: Response) => {
    // Use safeParse for validation
    const result = LoginRequestBodySchema.safeParse(req.body)

    console.log('Hello')

    if (!result.success) {
      // Handle validation error
      const errors = result.error.flatten().fieldErrors
      return respondWithError(res, 400, 'Validation failed', errors)
    }
    // Extracting validating data
    const { email, password } = result.data

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
      config.jwtSecretKey,
      {
        expiresIn: config.jwtExpirationTime,
      },
    )
    res.status(200).json({ message: 'Login successful', token })
  }
