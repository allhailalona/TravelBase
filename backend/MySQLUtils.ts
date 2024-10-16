import { pool } from './MySQLConnection'
import { Vacation } from '../types'

export async function fetchVacations() {
  try {
    const [rows] = await pool.query('SELECT * FROM vacations')
    return rows
  } catch (err) {
    console.error('err in fetchVacations in MySQLUtils.ts')
    throw err
  }
}

export async function fetchSingleVacation(id: number) {
  try {
    const [rows] = await pool.query('SELECT * FROM vacations WHERE vacation_id = ?', [id])
    return rows
  } catch (err) {
    console.error('err in fetchSingleVacations in MySQLUtils.ts')
    throw err
  }
}

export async function addVacation(values: Omit<Vacation, 'vacation_id'>) {
  try {
    const query = `
      INSERT INTO vacations 
      (destination, description, starting_date, ending_date, price, image_url) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await pool.query(query, [
      values.destination,
      values.description,
      values.starting_date,
      values.ending_date,
      values.price,
      values.image_url
    ]);

    console.log('Vacation added successfully');
  } catch (err) {
    console.error('Error in addVacation:', err);
    throw err;
  }
}

export async function deleteVacation(id: number) {
  try {
    const query = 'DELETE FROM vacations WHERE vacation_id = ?';
    await pool.query(query, [id]);
    console.log('Vacation deleted successfully');
  } catch (err) {
    console.error('Error in deleteVacation:', err);
    throw err;
  }
}