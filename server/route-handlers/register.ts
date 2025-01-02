import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'
import jsonServer from 'json-server'
import { z } from 'zod'

import { respondWithError, findUserByEmail } from '../helper'
import { Database, DbUser, convertDbUserToUser } from '../models'

const RegisterRequestBodySchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z
      .string()
      .min(6, 'Confirm password must be at least 6 characters long'),
    gender: z.enum(['Male', 'Female', 'Prefer Not to Say'], {
      message: 'Invalid gender',
    }),
  })
  .refine((data) => data.password == data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'], // Error will be attached to confirmPassword
  })

export const register =
  (router: jsonServer.JsonServerRouter<Database>) =>
  (req: Request, res: Response) => {
    // Validate the incoming request body against the zod schema
    const result = RegisterRequestBodySchema.safeParse(req.body)

    if (!result.success) {
      // Handle validation errors
      const errors = result.error.flatten().fieldErrors
      return respondWithError(res, 400, 'Validation failed', errors)
    }
    // Extract validated data
    const { firstName, lastName, email, password, gender } = result.data

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
  }
