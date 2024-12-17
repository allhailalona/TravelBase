import { pool } from "../config/MySQLConfig.js";
import { User } from "../types.js";

export async function register(values: User) {
  try {
    // Check if email already exists
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      values.email,
    ]);

    if (rows.length > 0) {
      throw { status: 409, message: "Email already exists" };
    }

    // If it's not, add the new user to users DB
    const [res] = await pool.query(
      "INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [
        values.firstName,
        values.lastName,
        values.email,
        values.password,
        "user",
      ],
    );

    // Instead of refetching the data we just inserted we could use the already existing data
    // We cannot know though which userId was chosen so we have to check
    const userId = res.insertId;

    // userId and role will be used to create a JWT, the user role is always 'user' since admins ae registered directly using DB
    return {
      firstName: values.firstName,
      lastName: values.lastName,
      userId,
      userRole: "user",
    };
  } catch (err) {
    console.error("err in register func is loginOrRegister.ts", err);
    throw err;
  }
}

export async function login(loginInfo: User) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [loginInfo.email, loginInfo.password],
    );

    if (rows.length === 0) {
      throw new Error("No user found that matches the credentials provided");
    }

    const user = rows[0];
    const username = `${user.first_name} ${user.last_name}`;

    return {
      userId: user.user_id,
      userRole: user.role,
      username,
    };
  } catch (err) {
    console.error("err in login func in loginOrRegister.ts", err);
    throw err;
  }
}
