import { pool } from './MySQLConnection'
import fs from 'fs/promises'
import path from 'path'
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
    // Decode base64 image
    const base64Data = values.image_url.split(',')[1]; // Get base64 part
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Define the path to store the image in the named volume
    const imagePath = path.join('/app/pictures', `${Date.now()}.png`);
    
    // Write the image file to the specified path inside the container
    await fs.writeFile(imagePath, imageBuffer);

    // Update values to store the path instead of the base64 string
    values.image_url = imagePath;

    // 5. Execute the database query using the updated `image_url`
    const query = `
      INSERT INTO vacations (destination, description, starting_date, ending_date, price, image_url)
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

export async function editVacation(vacation: Vacation) {
  try {
    console.log('hello from update func vacation is', vacation)
    const query = `
      UPDATE vacations 
      SET destination = ?, 
          description = ?, 
          starting_date = ?, 
          ending_date = ?, 
          price = ?, 
          image_url = ?
      WHERE vacation_id = ?
    `;
    
    await pool.query(query, [
      vacation.destination,
      vacation.description,
      vacation.starting_date,
      vacation.ending_date,
      vacation.price,
      vacation.image_url,
      vacation.vacation_id
    ]);

    console.log('Vacation updated successfully');
  } catch (err) {
    console.error('err in editVacation:', err);
    throw err;
  }
}