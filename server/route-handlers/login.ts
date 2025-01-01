import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'
import jsonServer from 'json-server'
import jwt from 'jsonwebtoken'

import { config } from '../config'
import { respondWithError, findUserByEmail } from '../helper'
import { Database } from '../models'

interface LoginRequestBody {
  email: string
  password: string
}

export const login =
  (router: jsonServer.JsonServerRouter<Database>) =>
  (req: Request, res: Response) => {
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
      config.jwtSecretKey,
      {
        expiresIn: config.jwtExpirationTime,
      },
    )
    res.status(200).json({ message: 'Login successful', token })
  }
