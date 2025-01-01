import jsonServer from 'json-server'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { config } from './config'
import { Database } from './models'
import { register } from './route-handlers'
import { login } from './route-handlers'
import { getUsers } from './route-handlers'
import { authenticateJwt } from './route-handlers'

// Get the directory name of the current module file (for db.json path)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Create a new jsonServer instance
const server = jsonServer.create()

// Middleware to parse JSON bodies
server.use(jsonServer.bodyParser)

// Assuming `router.db` is a Lowdb instance with a JSON backend
const router = jsonServer.router<Database>(`${__dirname}${config.dbPath}`)
// Use default middlewares (for CORS, logging, etc.)
const middlewares = jsonServer.defaults()

// Register a custom POST /register endpoint
server.post('/register', register(router))

// Set up a custom route for /login
server.post('/login', login(router))

// Protected route
server.get('/users', authenticateJwt, getUsers(router))

// Set up middlewares and router
server.use(middlewares)
server.use(router)

// Start server on a specific port
server.listen(config.port, () => {
  console.log(`JSON Server is running at http://localhost:${config.port}`)
})
