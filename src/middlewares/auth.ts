// src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../auth/auth';

export interface AuthRequest extends Request {
  user?: {
    id_cliente: number;
    email: string;
  };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }
  
  const user = verifyToken(token);
  
  if (!user) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
  
  req.user = user;
  next();
}