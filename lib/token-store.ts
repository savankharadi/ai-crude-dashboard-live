import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), '.data');
const TOKEN_FILE = path.join(DATA_DIR, 'groww-token.json');

const getEncryptionKey = () => {
  const secret = process.env.TOKEN_SECRET || 'dev-crude-dashboard-secret';
  return crypto.createHash('sha256').update(secret).digest();
};

export async function saveGrowwToken(token: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    TOKEN_FILE,
    JSON.stringify({ value: `${iv.toString('hex')}:${encrypted.toString('hex')}` }, null, 2),
    'utf8'
  );
}

export async function getGrowwTokenStatus() {
  try {
    const raw = await fs.readFile(TOKEN_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    const [ivHex, valueHex] = String(parsed.value || '').split(':');

    if (!ivHex || !valueHex) {
      return { configured: false, masked: null };
    }

    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(valueHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', getEncryptionKey(), iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    return {
      configured: true,
      masked: `********${decrypted.toString('utf8').slice(-4)}`,
    };
  } catch (error) {
    return { configured: false, masked: null };
  }
}
