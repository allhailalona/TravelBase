import { message } from "antd";
import { Vacation, Follower, UserRole } from "../../../types";

/**
 * Authenticates user and fetches data based on the specified mode.
 * This function has three options:
 * 1. Fetch all vacations (mode: 'all')
 * 2. Fetch a single vacation (mode: 'single', requires id)
 * 3. Return user role after successful token authentication (mode: 'none')
 *
 * @param {('none'|'single'|'all')} mode - The operation mode
 * @param {number} [id] - The vacation ID (required for 'single' mode)
 * @returns {Promise<{vacations: any, role: string, userId: string}>} The user's role and fetched vacations
 */
export const authAndData = async (
  mode: "none" | "single" | "all",
  id?: number,
) => {
  console.log("mode is", mode, "id is", id);
  let vacations: Vacation[] = [];
  let followers: Follower[] = [];
  let role: UserRole;
  let userId: number;

  // Get the access token from local storage
  const accessToken = localStorage.getItem("accessToken");
  let endpoint: string;

  // Determine the appropriate endpoint based on the mode
  if (mode === "none") {
    endpoint = "http://localhost:3000/user-role";
  } else if (mode === "single") {
    endpoint = `http://localhost:3000/vacations/fetch?id=${id}`;
  } else if (mode === "all") {
    endpoint = "http://localhost:3000/vacations/fetch";
  }

  // Make the API request
  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Handle response errors
  if (!res.ok) {
    const errorData = await res.json();
    if (res.status === 401) {
      // Handle expired access token
      message.loading(
        "Your access token has expired. Please wait while the system generates a new one...",
      );
      console.log("access token expired generating a refresh token");
      await refreshTokens();
      return authAndData(mode, id); // Retry after refreshing tokens
    } else {
      // Handle other errors
      message.error("Something Went Wrong, Please Login Again!");
      console.log(
        "token was invalid or unknown error, redirecting to login page",
      );
      // window.location.href = '/login';
      throw new Error(
        `Error in fetching data: ${errorData || "unknown error"}`,
      );
    }
  }

  // Process successful response
  const data = await res.json();

  // Update vacations based on the mode
  if (mode === "all") vacations = data.updatedVacations;
  if (mode === "single") vacations = data.updatedVacations[0]; // Enables me to use vacations directly in the editing form

  followers = data.followers; // Set followers
  role = data.role; // Set role
  userId = data.userId; // Set userId
  console.log("role is", role);

  return { vacations, followers, role, userId };
};

/**
 * Refreshes authentication tokens
 * Handles various error scenarios during token refresh
 */
const refreshTokens = async () => {
  const res = await fetch("http://localhost:3000/refresh-tokens", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("refreshToken")}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    localStorage.clear();
    message.destroy();
    if (res.status === 401) {
      console.log("the refresh token is expired as well");
      message.error("The Session Has Expired! Please login.");
    } else {
      console.log(
        "an unknown error has occured while trying to use refresh token",
      );
      message.error("An Unknown Error Has Occurred While Refreshing Tokens!");
    }
    console.log(
      "hello from refresh token error res block redirecting to login",
    );
    // window.location.href = '/login';
    throw new Error(`Error in refresh-token request: ${errorData}`);
  }

  // Update tokens in local storage
  const data = await res.json();
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);

  // Notify user of successful token refresh
  message.destroy();
  message.success(
    "New Tokens Were Created Successfully! Repeating Original Request...",
  );
};
