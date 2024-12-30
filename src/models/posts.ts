export interface Post {
  id: number // Unique identifier
  title: string // Title of the post
  description: string // Post content (can be text or editor content)
  image: string // URL of the post's image
  date: string // Post creation date (YYYY-MM-DD format)
  userId: number // ID of the user who created the post
  viewCounter?: number // Optional: number of views
  comments?: string[] // Optional: Array of comment strings or IDs
}
