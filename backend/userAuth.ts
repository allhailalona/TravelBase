import { pool } from './MySQLConnection'
import { UserAuthForms } from '../types'

export async function register(values: UserAuthForms) {
  console.log('email to see is', values.email)
  // Is there already such an email?
  // If there isn't, create a new user and reurn succes
  try {
    // Check if email already exists
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [values.email])

    if (rows.length > 0) {
      throw { status: 409, message: 'Email already exists' };
    }

    // If it's not, add the new user to users DB
    await pool.query(
      'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [values.firstName, values.lastName, values.email, values.password, 'user']
    )

    return { success: true, message: 'User Registered Successfully'}
  } catch (err) {
    console.error('err in register func is userAuth.ts')
    throw err
  }
}

export async function login(loginInfo: UserAuthForms) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND password = ?', 
      [loginInfo.email, loginInfo.password]
    )

    // Again, error handling is intentionally vague
    if (rows.length === 0) {
      throw { status: 500, message: 'Something Went Wrong, Try Again!' };
    }

    const user = rows[0]

    // Now return fetched data and TOKEN!
    return { 
      success: true,
      message: 'User Registered Successfully', 
      user: {
        id: user.user_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role
      }
    }
  } catch (err) {
    console.error('err in login func is userAuth.ts')
    throw err
  }
}