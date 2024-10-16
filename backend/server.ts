import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { register, login } from './userAuth'
import { fetchVacations, fetchSingleVacation, addVacation, deleteVacation } from './MySQLUtils'
import { genTokens, authToken } from './JWTTokensUtils'
import { getRedisState, setRedisState } from './redisUtils'

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
    console.log('data.user.role is', data.user.role)

    // Gen token
    const { accessToken, refreshToken } = await genTokens(String(data.user.id), data.user.role)

    // Return both tokens and user data without password
    res.status(200).json({ accessToken, refreshToken, data })
  } catch (err) {
    console.error('err in /register request in server.ts')
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error'})
  }
})

app.get('/login', async (req: Request, res: Response) => {
  try {
    const loginInfo = req.query
    const data = await login(loginInfo)

    const { accessToken, refreshToken } = await genTokens(String(data.user.id), data.user.role)
    console.log('tokens are', accessToken, refreshToken)

    // Return both tokens and user data without password
    res.status(200).json({ accessToken, refreshToken, data })
  } catch (err) {
    console.error('err in /login request in server.ts')
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error'})
  }  
})

app.get('/vacations/fetch', authToken, async (req: Request, res: Response) => {
  if (req.authError) { // Access token has expired
    console.log('access token is expired', req.authError.status)
    return res.status(req.authError.status).json({ error: req.authError.message, user: req.authError.user });
  }

  try {
    const role = req.user.userRole; // Get user role form authToken func

    /* Since we have only two options for fetching data - single / all
      I create two functions, had we have several ways, for instnace - many not all
      etc, I would prolly create one function to rule them all!
    */
   let vacations
    if (req.query.id && req.query.id.length > 0)  {
      // Fetch a single vacation according to id
      vacations = await fetchSingleVacation(req.query.id)
    } else {
      // Fetch all vacations
      vacations = await fetchVacations();
    }    
    
    res.status(200).json({ vacations, role });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

app.post('/vacations/add', async (req: Request, res: Response) => {
  try {
    const values = req.body
    await addVacation(values)

    res.status(200).json('Success!')
  } catch (err) {
    res.json(err.status || 500).json({ error: err.message || 'Internal Server Error'})
  }
})

app.post('/vacations/delete', async (req: Request, res: Response) => {
  try {
    const id = req.body.id
    await deleteVacation(id)

    res.status(200).json('Success!')
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error'})
  }
})

// Tokens and such listeners
app.get('/user-role', authToken, async (req: Request, res: Response) => {
  if (req.authError) {
    return res.status(req.authError.status).json({ error: req.authError.message, user: req.authError.user });
  }

  try {
    const role = req.user.userRole;
    res.status(200).json({ role });
  } catch (err) {
    res.status(err || 500).json({ error: err.message || 'Internal Server Error' });
  }
});

app.post('/refresh-tokens', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const refreshToken = authHeader && authHeader.split(' ')[1];

    // Fetch refresh token details to generate new tokens
    const data = await getRedisState(refreshToken)
    if (data === null) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Gen new Tokens
    const { userId, userRole } = data
    const newTokens = await genTokens(userId, userRole)

    // Overwrite new tokens with new ones
    await setRedisState(refreshToken, { userId, userRole }, 3)

    res.status(200).json({ accessToken: newTokens.accessToken, refreshToken: newTokens.refreshToken })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error'})
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`listening on http://localhost:3000`)
})
