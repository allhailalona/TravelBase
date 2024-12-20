import fs from "fs/promises";
import path from "path";
import { Vacation } from "../types.js";

export async function handleFetchImageData(vacations: Vacation[]) {
  const settledResults = await Promise.allSettled(
    vacations.map(async (vacation: Vacation) => {
      try {
        const imageData = await fetchImageData(vacation.image_path);
        return { ...vacation, image_path: imageData };
      } catch (err: unknown) {
        console.error(
          `Failed to fetch image for vacation ${vacation.vacation_id}: ${err.message}`,
        );
        return { ...vacation, image_path: "---" };
      }
    }),
  );

  // Filter fulfilled results and extract the value
  const updatedVacations = settledResults
    .filter(
      (result): result is PromiseFulfilledResult<Vacation> =>
        result.status === "fulfilled",
    )
    .map((result) => result.value);

  return updatedVacations;
}

export async function fetchImageData(
  imagePath: string,
): Promise<string | Buffer> {
  const fullPath = path.join("/app", imagePath);
  try {
    return await fs.readFile(fullPath);
  } catch (err) {
    console.error(
      "err in fetchImage data from docker func in dockerUtils file",
    );
    throw err;
  }
}

export async function fetchAllImages() {
  try {
    const picturesDir = await fs.readdir("/app/pictures");

    const picturesBuffers = await Promise.allSettled(
      picturesDir.map(async (picture) => {
        const filePath = path.join("/app/pictures", picture);
        const buffer = await fs.readFile(filePath);
        return buffer;
      }),
    );

    const buffers = picturesBuffers
      .filter((result) => result.status === "fulfilled")
      .map((result) => (result as PromiseFulfilledResult<Buffer>).value); // Add .value here

    return buffers;
  } catch (err) {
    console.error("Error in fetchAllImages:", err);
    throw err;
  }
}
