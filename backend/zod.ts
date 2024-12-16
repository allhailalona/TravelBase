import { z } from 'zod'
import sharp from 'sharp'

// The original instructions were to ALLOW past dates in editing mode - but it seemed very odd to me so I skipped it.
export const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'), 
    email: z.string().email('Must be a valid email'),
    password: z.string().min(4, 'Password must be at least 4 characters')
 })

export const loginSchema = z
  .object({
    email: z.string().email('Must be a valid email'),
    password: z.string().min(4, 'Password must be at least 4 characters')
})

export const addVacationSchema = z
  .object({
    destination: z.string().min(1, 'Destination is required'),
    description: z.string().min(1, 'Description is required'), 
    price: z
      .string()
      .regex(/^\d+(\.\d+)?$/, 'Price must be a valid number') // Only numbers and a single dot
      .refine((val) => parseFloat(val) > 0, 'Price must be greater than 0') // Ensure price > 0
      .refine((val) => parseFloat(val) <= 10000, 'Price cannot exceed $10,000'), // Ensure price <= 10000
    starting_date: z.coerce.date(),
    ending_date: z.coerce.date(),
    image_path: z
      .string()
      .refine(
        async (val) => {
          try {
            const buffer = Buffer.from(val.split(',')[1], 'base64');
            await sharp(buffer).metadata();
            return true;
          } catch (err) {
            return false;
          }
        },
        'Invalid image format'
      )
  })
  .refine(
    (data) => data.ending_date > data.starting_date,
    { message: 'End date must be after start date' }
  );


  export const editVacationSchema = z
  .object({
    destination: z.string().min(1, 'Destination is required'),
    description: z.string().min(1, 'Description is required'),
    price: z
      .string()
      .regex(/^\d+(\.\d+)?$/, 'Price must be a valid number') // Only numbers and a single dot
      .refine((val) => parseFloat(val) > 0, 'Price must be greater than 0') // Ensure price > 0
      .refine((val) => parseFloat(val) <= 10000, 'Price cannot exceed $10,000'), // Ensure price <= 10000
    starting_date: z.coerce.date(),
    ending_date: z.coerce.date(),
    image_path: z
      .string()
      .refine(
        async (val) => {
          try {
            const buffer = Buffer.from(val.split(',')[1], 'base64');
            await sharp(buffer).metadata();
            return true;
          } catch {
            return false;
          }
        },
        'Invalid image format'
      )
      .optional(), // Optional for editing vacations
  })
  .refine(
    (data) => data.ending_date > data.starting_date,
    { message: 'End date must be after start date' }
  );


export type LoginType = z.infer<typeof loginSchema>
export type RegisterType = z.infer<typeof registerSchema>
export type addVacationType = z.infer<typeof addVacationSchema>
export type editVacationType = z.infer<typeof editVacationSchema>