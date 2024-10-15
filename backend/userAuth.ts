import { pool } from './MySQLConnection'
import { User } from '../types'

export async function register(values: User) {
  try {
    // Check if email already exists
    let [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [values.email])

    if (rows.length > 0) {
      throw { status: 409, message: 'Email already exists' };
    }

    // If it's not, add the new user to users DB
    const [res] = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [values.firstName, values.lastName, values.email, values.password, 'user']
    )

    // Which userId was the newly created user given?
    const userId = res.insertId

    // Construct the returned user obj out of userId and the front data passed... An alterantive could be fetching the entire row for safety measures
    const user: User = {
      id: userId, 
      firstName: values.firstName, 
      lastName: values.lastName, 
      email: values.email, 
      role: 'user' // Admins cannot register via the standard routes.... Only via the workbench
    }
    
    return { 
      success: true,
      message: 'User Registered Successfully', 
      user
    }
  } catch (err) {
    console.error('err in register func is userAuth.ts')
    throw err
  }
}

export async function login(loginInfo: User) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND password = ?', 
      [loginInfo.email, loginInfo.password]
    )

    // Again, error handling is intentionally vague
    if (rows.length === 0) {
      throw { status: 500, message: 'Something Went Wrong' }; // Invalid Credentials
    }

    const user = rows[0]

    // Now return fetched data and TOKEN!
    return { 
      success: true,
      message: 'User Logged In Successfully', 
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