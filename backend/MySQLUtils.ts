import { pool } from './MySQLConnection'
import fs from 'fs/promises'
import path from 'path'
import { Vacation } from '../types'

export async function fetchVacations() {
  try {
    // Fetch vacation data
    const [vacations] = await pool.query('SELECT * FROM vacations')
    console.log('vacations are', vacations)

    // Fetch followers data as well
    const [followers] = await pool.query('SELECT * FROM followers')
    console.log('followers are', followers)

    return { vacations, followers }
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
    console.log('hello from add vacation')

    const volumePath = '/app/pictures'
    
    // Extract the base64 data and image type
    const matches = values.image_path.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/)
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid image data')
    }

    const imageType = matches[1]
    const imageData = Buffer.from(matches[2], 'base64')

    // Generate a unique filename with the correct extension
    const timestamp = Date.now()
    const filename = `${timestamp}.${imageType}`
    const filePath = path.join(volumePath, filename)

    // Save the image to the volume
    await fs.writeFile(filePath, imageData)

    // Verify the file was written by reading it back
    try {
      const readData = await fs.readFile(filePath)
      if (readData.equals(imageData)) {
        console.log('Image verification successful: File read matches original data')
      } else {
        console.log('Image verification failed: File read does not match original data')
      }
    } catch (readErr) {
      console.error('Error reading back the saved image:', readErr)
    }

    // Update the image_path to be the path in the volume
    const updatedImagePath = `/pictures/${filename}`

    // Execute the database query using the updated `image_path`
    const query = `
      INSERT INTO vacations (destination, description, starting_date, ending_date, price, image_path)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await pool.query(query, [
      values.destination,
      values.description,
      values.starting_date,
      values.ending_date,
      values.price,
      updatedImagePath  // Use the updated image Path here
    ]);

    console.log('Vacation added successfully')
  } catch (err) {
    console.error('Error in addVacation:', err);
    throw err;
  }
}

export async function deleteVacation(id: number) {
  try {
    await pool.query('START TRANSACTION');

    // Delete associated followers first
    await pool.query('DELETE FROM followers WHERE vacation_id = ?', [id]);

    // Then delete the vacation
    await pool.query('DELETE FROM vacations WHERE vacation_id = ?', [id]);

    await pool.query('COMMIT');
    console.log('Vacation and associated followers deleted successfully');
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error in deleteVacation:', err);
    throw err;
  }
}

export async function editVacation(vacation: Vacation) {
  try {
    const volumePath = '/app/pictures'

    // Extract the base64 data and image type
    const matches = vacation.image_path.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/)
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid image data')
    }

    const imageType = matches[1]
    const imageData = Buffer.from(matches[2], 'base64')

    // Generate a unique filename with the correct extension
    const timestamp = Date.now()
    const filename = `${timestamp}.${imageType}`
    const filePath = path.join(volumePath, filename)

    // Save the image to the volume
    await fs.writeFile(filePath, imageData)

    // Verify the file was written by reading it back
    try {
      const readData = await fs.readFile(filePath)
      if (readData.equals(imageData)) {
        console.log('Image verification successful: File read matches original data')
      } else {
        console.log('Image verification failed: File read does not match original data')
      }
    } catch (readErr) {
      console.error('Error reading back the saved image:', readErr)
    }

    // Update the image_path to be the path in the volume
    const updatedImagePath = `/pictures/${filename}`

    const query = `
      UPDATE vacations 
      SET destination = ?, 
          description = ?, 
          starting_date = ?, 
          ending_date = ?, 
          price = ?, 
          image_path = ?
      WHERE vacation_id = ?
    `;
    
    await pool.query(query, [
      vacation.destination,
      vacation.description,
      vacation.starting_date,
      vacation.ending_date,
      vacation.price,
      updatedImagePath,
      vacation.vacation_id
    ]);

    console.log('Vacation updated successfully');
  } catch (err) {
    console.error('err in editVacation:', err);
    throw err;
  }
}

export async function updateFollow(vacationId: number, userId: number) {
  try {
    console.log('Updating follow for vacationId:', vacationId, 'userId:', userId);
    
    // Check if the entry exists
    const [rows]: any = await pool.query(
      'SELECT * FROM followers WHERE user_id = ? AND vacation_id = ?',
      [userId, vacationId]
    );

    if (rows.length > 0) {
      // Entry exists, delete it
      await pool.query(
        'DELETE FROM followers WHERE user_id = ? AND vacation_id = ?',
        [userId, vacationId]
      );
      console.log('Deleted follow entry');
      return { action: 'unfollowed' };
    } else {
      // Entry doesn't exist, add it
      await pool.query(
        'INSERT INTO followers (user_id, vacation_id) VALUES (?, ?)',
        [userId, vacationId]
      );
      console.log('Added follow entry');
      return { action: 'followed' };
    }
  } catch (err) {
    console.error('Error in updateFollow in mysqlutils.ts:', err);
    throw err;
  }
}