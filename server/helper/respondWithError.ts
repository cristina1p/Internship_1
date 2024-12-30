import { Response } from 'express'

export const respondWithError = (
  res: Response,
  status: number,
  message: string,
): void => {
  res.status(status).json({ message })
}
