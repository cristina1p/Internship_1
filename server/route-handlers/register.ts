import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'
import jsonServer from 'json-server'
import { Gender } from 'src/models'

import { respondWithError, findUserByEmail } from '../helper'
import { Database, DbUser, convertDbUserToUser } from '../models'

interface RegisterRequestBody {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  gender: Gender
}

export const register =
  (router: jsonServer.JsonServerRouter<Database>) =>
  (req: Request, res: Response) => {
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
  }
