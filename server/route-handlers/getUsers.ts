import { Request, Response } from 'express'
import jsonServer from 'json-server'

import { respondWithError } from '../helper'
import { RequestWithUser } from './authenticateJwt'
import { Database } from '../models'

export const getUsers =
  (router: jsonServer.JsonServerRouter<Database>) =>
  (req: Request, res: Response) => {
    const user = (req as RequestWithUser).user

    if (user.role !== 'Admin') {
      return respondWithError(res, 403, 'Forbidden')
    }

    const users = router.db.get('users').value()
    res.status(200).json({ users })
  }
