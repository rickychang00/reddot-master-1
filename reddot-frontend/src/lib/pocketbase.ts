import PocketBase from 'pocketbase';

const url = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
export const pb = new PocketBase(url);

// Admin client for server-side operations
const internalUrl = process.env.POCKETBASE_INTERNAL_URL || 'http://127.0.0.1:8090';
export const pbAdmin = new PocketBase(internalUrl);

/**
 * Authenticates the admin client using environment variables.
 * Call this in server-side routes before using pbAdmin.
 */
export async function authenticateAdmin() {
  const email = process.env.POCKETBASE_ADMIN_EMAIL;
  const password = process.env.POCKETBASE_ADMIN_PASSWORD;

  if (!email || !password) {
    // If no credentials, we assume the collection has appropriate API rules 
    // or we're running in a trusted environment.
    return;
  }

  if (pbAdmin.authStore.isValid) return;

  try {
    await pbAdmin.admins.authWithPassword(email, password);
  } catch (err: any) {
    console.error("PocketBase Admin Auth Failed:", err.message);
  }
}
