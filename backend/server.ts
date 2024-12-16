import express, { Request, Response } from "express";
import { Server } from 'socket.io';
import { createServer } from 'http';
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { register, login } from "./loginOrRegister";
import {
  fetchVacations,
  fetchSingleVacation,
  addVacation,
  deleteVacation,
  editVacation,
  updateFollow,
} from "./MySQLUtils";
import { handleFetchImageData, fetchAllImages } from "./dockerUtils";
import { genTokens, authToken } from "./JWTTokensUtils";
import { registerSchema, loginSchema, addVacationSchema, editVacationSchema } from './zod.ts'
import { Vacation, Follower } from '../types'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173" // Your React app URL
  }
});
app.use(cors());
app.use(express.json());

app.post("/register", async (req: Request, res: Response) => {
  try {
    console.log('hello from register listener req.body is', req.body)
    const registerInfo = await registerSchema.parseAsync(req.body)
    const data = await register(registerInfo);

    const username = `${data.user.firstName} ${data.user.lastName}`

    const { accessToken, refreshToken } = await genTokens(
      String(data.user.id),
      data.user.role,
    );

    res.status(200).json({ accessToken, refreshToken, data });
  } catch (err) {
    console.error(`error in register listener`, err)
    res.status(500).json('Internal server error') // Intentionally vague, the real error is shown above
  }
});

app.get("/login", async (req: Request, res: Response) => {
  try {
    console.log('hello from login listener')
    const loginInfo = await loginSchema.parseAsync(req.query)
    const data = await login(loginInfo);
    console.log('login info is', data)

    const { accessToken, refreshToken } = await genTokens(
      String(data.user.id), // Convert number from DB to string
      data.user.role, // This is already a string
    ); // Gen token

    // Return both tokens and user data without password
    res.status(200).json({ accessToken, refreshToken, data });
  } catch (err) {
    console.error("err in /login request in server.ts", err); // The real error is here
    res.status(500).json('Unkonwn internal error') // The error sent to front is vague
  }
});

app.get('/fetch-all-images', async (req: Request, res: Response) => {
  try {
    const pictures = await fetchAllImages()
    res.status(200).json(pictures)
  } catch (err) {
    console.error('err in /fetch-all-images listener', err)
    res.status(500).json('Internal server error')
  }
})

app.post("/vacations/fetch", authToken, async (req: Request, res: Response) => {
  if (req.authError) {
    console.log("error in vacawtions/fetch authToken", req.authError); // descriptive log for dev
    return res.status(500).json('internal server error'); // vague error for front
  }
  try { 
    console.log("auth successful userId is", req.userId);
    console.log('userRole is', req.userRole);

    const userId = req.userId;

    let vacations: Vacation[] = [];
    let followers: Follower[] | undefined;

    if (req.body.id) { 
      console.log('fething a single vacation')
      vacations = await fetchSingleVacation(req.body.id);
    } else { 
      console.log('fetch all vacations');
      const data = await fetchVacations();
      vacations = data.vacations;
      followers = data.followers;
    }

    const updatedVacations = await handleFetchImageData(vacations);

    // Dynamically build the response object
    const toReturn = {
      updatedVacations,
      userId,
      ...(followers && { followers }), // Include followers only if defined
    };
    console.log('toReturn userId is', toReturn.userId)

    res.status(200).json(toReturn);
  } catch (err) {
    console.error('err in vacations/fetch listener', err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

app.post("/vacations/add", authToken, async (req: Request, res: Response) => {
  if (req.authError) {
    console.log("error in vacations/add authToken", req.authError);
    return res.status(500).json('internal server error');
  }
  try {
    const vacationToAddInfo = await addVacationSchema.parseAsync(req.body.vacation)
    await addVacation(vacationToAddInfo);

    res.sendStatus(200)
  } catch (err) {
    console.error('error in vacations/add error is', err)
    res.status(500).json('Internal server error')
  }
});

app.post("/vacations/delete", authToken, async (req: Request, res: Response) => {
  if (req.authError) {
    console.log("error in vacations/delete authToken", req.authError);
    return res.status(500).json('internal server error');
  }
  try {
    const id = req.body.id;
    console.log("about to delete id", id);
    await deleteVacation(id);

    res.sendStatus(200)
  } catch (err) {
    console.error('err in vacations/delete', err)
    res.status(500).json('Internal server error')
  }
});

app.put("/vacations/edit", authToken, async (req: Request, res: Response) => {
  if (req.authError) {
    console.log("error in vacations/edit authToken", req.authError);
    return res.status(500).json('internal server error');
  }
  try {
    const vacationToEditInfo = await editVacationSchema.parseAsync(req.body.vacation)
    await editVacation(vacationToEditInfo);

    res.sendStatus(200)
  } catch (err) {
    console.error('err in vacations/edit', err)
    res.status(500).json('Internal server error')
  }
});

app.put("/vacations/updateFollow", authToken, async (req: Request, res: Response) => {
  if (req.authError) {
    console.log('error in updateFollow authToken', req.authError)
    return res
      .status(req.authError.status)
      .json({ error: req.authError.message, user: req.authError.user });
  }
  try {
    const { vacationId, userId } = req.body;
    console.log('hello from vacations/updateFollwo vacationId is', vacationId, 'userId is', userId)
    await updateFollow(vacationId, userId);

    res.sendStatus(200); 
  } catch (err) {
    console.error('err in vacations/updateFollow', err)
    res.status(500).json('Internal server error')
  }
});

// Extract userRole from access token - this is for route protection
app.post("/user-role", authToken, async (req: Request, res: Response) => {
  if (req.authError) {
    console.log('error in user-role authToken', req.authError)
    return res
      .status(req.authError.status)
      .json({ error: req.authError.message, user: req.authError.user });
  }
  try {
    console.log('hello from user-role listener')
    const userRole = req.userRole;
    console.log('express listener userRole is', userRole)
    res.status(200).json({ userRole });
  } catch (err) {
    console.error('err in /user-role listener', err)
    res.status(500).json('Internal server error')
  }
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };