import express, {Request, Response} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { register, login } from './userAuth'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = express()

app.use(cors())
app.use(express.json())

app.post('/register', async (req: Request, res: Response) => {
  try {
    const values = req.body
    await register(values)

    res.status(200).json('Registeration was successful')
  } catch (err) {
    if (err.status) {
      res.status(err.status).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
})

app.get('/login', async (req: Request, res: Response) => {
  try {
    const loginInfo = req.query
    const user = await login(loginInfo)
    
    // Create JWT Token here!
    res.status(200).json(user)
  } catch (err) {
    if (err.status) {
      res.status(err.status).json({ error: err.message })
    } else {
      res.status(500).json({ error: 'Internal Server Error'})
    }
  }  
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`listening on http://localhost:3000`)
})
