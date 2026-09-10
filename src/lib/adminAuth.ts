import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'jhs_foundation_of_hope_super_secret_key_2026';
const TOKEN_NAME = 'foh_admin_token';

export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;

    if (!token) return false;

    const decoded = jwt.verify(token, JWT_SECRET) as { username: string; role: string };
    if (!decoded || decoded.role !== 'admin') return false;

    // Check database
    const admin = await db.getAdminByUsername(decoded.username);
    return !!admin;
  } catch (err) {
    return false;
  }
}

export function signAdminToken(username: string): string {
  return jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
}

export { TOKEN_NAME };
