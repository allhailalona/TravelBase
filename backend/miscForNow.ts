// Variety of fetch requests, once I have them all I can better organize the files
import { pool } from './MySQLConnection'

// Perhaps merge it with the express file in the future
export async function fetchVacations() {
  try {
    const [rows] = await pool.query('SELECT * FROM vacations')
    return rows
  } catch (err) {
    console.error('err in fetchVacations in misc')
    throw err
  }
}