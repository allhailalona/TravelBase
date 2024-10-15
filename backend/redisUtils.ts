import { createClient } from 'redis';
import { TokenPayload } from '../types'

// Create a Redis client and connect
const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379' // Adjust the URL as needed
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

(async () => {
  // Connect the Redis client
  await client.connect();
})();

// Types are designed to handle tokens
export async function getRedisState(key: string): Promise<string | null> {
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null; // Return null if no key found
  } catch (error) {
    console.error(`Error getting Redis key ${key}:`, error);
    return null; // Return null on error
  }
}

export async function setRedisState(key: string, value: TokenPayload, days: number): Promise<void> {
  try {
    const expirationInSeconds = days * 24 * 60 * 60
    await client.set(key, JSON.stringify(value), { EX: expirationInSeconds });
    console.log(`Successfully set value in Redis with ${days}-day expiration`);
    console.log('value is', await getRedisState(key));
  } catch (error) {
    console.error(`Error setting Redis key ${key}:`, error);
  }
}

export async function delRedisState(key: string): Promise<void> {
  try {
    await client.del(key);
    console.log(`Deleted Redis key ${key}`);
  } catch (error) {
    console.error(`Error deleting Redis key ${key}:`, error);
  }
}

// Remember to close the Redis client when your application shuts down
process.on('SIGINT', async () => {
  await client.quit();
  console.log('Redis client disconnected');
  process.exit(0);
});
