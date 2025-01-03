import { Response } from 'express'

export const respondWithError = (
  res: Response,
  status: number,
  message: string,
  errors?: Record<string, string[]>,
): void => {
  res.status(status).json({ message, errors })
}
