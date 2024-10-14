import express, {Request, Response} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import jwt from 'jsonwebtoken'
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
    const data = await register(values)

    // Generate JWT Token
    const JWTSecret = process.env.JWT_SECRET
    console.log('jwt secret is', JWTSecret)
    const token = jwt.sign(
      { userId: data.user.id, userRole: data.user.role }, 
      JWTSecret, 
      { expiresIn: '1h'}
    )
    
    // Store the token in cookies
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
    })

    res.status(200).json(data)
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
    const data = await login(loginInfo)
    console.log('user is', data)

    // Generate JWT Token
    const JWTSecret = process.env.JWT_SECRET
    console.log('jwt secret is', JWTSecret)
    const token = jwt.sign(
      { userId: data.user.id, userRole: data.user.role }, 
      JWTSecret, 
      { expiresIn: '1h'}
    )
    
    // Store the token in cookies
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
    })

    // Return user data fetched from the DB without the password
    res.status(200).json(data)
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
