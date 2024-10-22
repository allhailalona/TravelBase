import express, { Request, Response } from "express";
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
import { handleFetchImageData } from "./dockerUtils";
import { genTokens, authToken } from "./JWTTokensUtils";
import { getRedisState, setRedisState } from "./redisUtils";
import { Vacation } from "../types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

app.use(cors());
app.use(express.json());

app.post("/register", async (req: Request, res: Response) => {
  try {
    const registerInfo = req.body;
    const data = await register(registerInfo);

    const { accessToken, refreshToken } = await genTokens(
      String(data.user.id),
      data.user.role,
    ); // Gen token

    // Return both tokens and user data without password
    res.status(200).json({ accessToken, refreshToken, data });
  } catch (err) {
    console.error("err in /register request in server.ts");
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal Server Error" });
  }
});

app.get("/login", async (req: Request, res: Response) => {
  try {
    const loginInfo = req.query;
    const data = await login(loginInfo);

    const { accessToken, refreshToken } = await genTokens(
      String(data.user.id),
      data.user.role,
    ); // Gen token

    // Return both tokens and user data without password
    res.status(200).json({ accessToken, refreshToken, data });
  } catch (err) {
    console.error("err in /login request in server.ts");
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal Server Error" });
  }
});

app.get("/vacations/fetch", authToken, async (req: Request, res: Response) => {
  if (req.authError) {
    // Access token has expired
    console.log("access token is expired", req.authError.status);
    return res
      .status(req.authError.status)
      .json({ error: req.authError.message, user: req.authError.user });
  }

  try {
    console.log("u were authenticated");
    const role = req.user.userRole; // Get user role form authToken func
    const userId = req.user.userId;
    console.log("vacations fetch userId is", userId);

    /* Since we have only two options for fetching data - single / all
      I create two functions, had we have several ways, for instnace - many not all
      etc, I would prolly create one function to rule them all!
    */
    let vacations;
    let followers;
    if (req.query.id && req.query.id.length > 0) {
      // Fetch a single vacation according to id
      console.log("fetching single vacation id is", req.query.id);
      vacations = await fetchSingleVacation(req.query.id);
    } else {
      // Fetch all vacations and followers
      const data = await fetchVacations();
      vacations = data.vacations;
      followers = data.followers;
    }

    /* Replace image_path with buffer - Not all images are included in the named volume, which is
      why I use PromiseAllSettled, */
    const updatedVacations = await handleFetchImageData(vacations);
    console.log("userId is", userId);
    console.log("role is", role);

    res.status(200).json({ updatedVacations, followers, role, userId });
  } catch (err) {
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

app.post("/vacations/add", async (req: Request, res: Response) => {
  try {
    const values = req.body;
    console.log("trying to add", values.image_path);
    await addVacation(values);

    res.status(200).json("Success!");
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal Server Error" });
  }
});

app.post("/vacations/delete", async (req: Request, res: Response) => {
  try {
    const id = req.body.id;
    console.log("about to delete id", id);
    await deleteVacation(id);

    res.status(200).json("Success!");
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal Server Error" });
  }
});

app.put("/vacations/edit", async (req: Request, res: Response) => {
  try {
    console.log("about to edit", req.body.vacation_id);
    const vacation = req.body;
    console.log("vacation is", vacation);
    await editVacation(vacation);

    res.status(200).json("Edit Successful!");
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal Server Error" });
  }
});

app.put("/vacations/updateFollow", async (req: Request, res: Response) => {
  try {
    const { vacationId, userId } = req.body;
    await updateFollow(vacationId, userId);

    res.sendStatus(200); // I'll handle sucess message in the front directly
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal Server Error" });
  }
});

// Tokens and such listeners
app.get("/user-role", authToken, async (req: Request, res: Response) => {
  if (req.authError) {
    return res
      .status(req.authError.status)
      .json({ error: req.authError.message, user: req.authError.user });
  }

  try {
    const role = req.user.userRole;
    res.status(200).json({ role });
  } catch (err) {
    res
      .status(err || 500)
      .json({ error: err.message || "Internal Server Error" });
  }
});

app.post("/refresh-tokens", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers["authorization"];
    const refreshToken = authHeader && authHeader.split(" ")[1];

    // Fetch refresh token details to generate new tokens
    const data = await getRedisState(refreshToken);
    if (data === null) {
      return res
        .status(401)
        .json({ error: "Invalid or expired refresh token" });
    }

    // Gen new Tokens
    const { userId, userRole } = data;
    const newTokens = await genTokens(userId, userRole);

    // Overwrite new tokens with new ones
    await setRedisState(refreshToken, { userId, userRole }, 3);

    res.status(200).json({
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`listening on http://localhost:3000`);
});
