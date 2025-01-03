import { Post } from 'src/models'

import { DbUser } from './dbUser'

export interface Database {
  users: DbUser[]
  posts: Post[]
}
