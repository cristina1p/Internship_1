import { DbUser } from '../models'

export const findUserByEmail = (
  dbUsers: DbUser[],
  email: string,
): DbUser | undefined => {
  return dbUsers.find((user) => user.email === email)
}
