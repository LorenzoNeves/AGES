// src/auth/auth.ts
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

// ============ CONSTANTES ============

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_super_segura';
const JWT_EXPIRES_IN = '7d';

// Avisar se usando padrão
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET não configurado no .env');
}

// ============ HASH DE SENHA ============

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return await bcryptjs.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcryptjs.compare(password, hash);
}

// ============ JWT ============

export function generateToken(id_cliente: number, email: string): string {
  return jwt.sign(
    { id_cliente, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): { id_cliente: number; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id_cliente: number; email: string };
    return decoded;
  } catch (erro) {
    return null;
  }
}