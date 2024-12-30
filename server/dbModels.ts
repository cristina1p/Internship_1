import { User } from '../src/models'

export interface DbUser extends User {
  password: string
}

export function convertDbUserToUser(dbUser: DbUser): User {
  const { id, email, firstName, lastName, gender, role } = dbUser

  return {
    id,
    email,
    firstName,
    lastName,
    gender,
    role,
  }
}
