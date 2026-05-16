import { handle } from 'hono/vercel'
// This points to your main Hono entry point in the src folder
import app from '../src/index'

export const config = {
  runtime: 'edge' // Optional: use 'edge' for faster global performance
}

export default handle(app)
