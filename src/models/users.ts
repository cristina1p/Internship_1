export interface User {
  id: number // Unique identifier
  firstName: string // User's first name
  lastName: string // User's last name
  email: string // User's email address
  gender: Gender // Gender selection
  role: Role // User role
}

export type Gender = 'Male' | 'Female' | 'Prefer Not to Say'
export type Role = 'Admin' | 'Moderator' | 'User'
