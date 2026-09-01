// src/routes/auth.ts
import { Router, Response } from 'express';
import { prisma } from '../database/prisma';
import { hashPassword, comparePassword, generateToken } from '../auth/auth';
import { AuthRequest, authMiddleware } from '../middlewares/auth';

const router = Router();

// ============ REGISTRO (SIGNUP) ============

router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { nome, email, senha } = req.body;
    
    // Validar campos obrigatórios
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
    }
    
    // Verificar se email já existe
    const clienteExistente = await prisma.dimCliente.findFirst({
      where: { email },
    });
    
    if (clienteExistente) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }
    
    // Hash da senha
    const senhaHash = await hashPassword(senha);
    
    // Criar cliente
    const cliente = await prisma.dimCliente.create({
      data: {
        nome,
        email,
        senha: senhaHash,
      },
    });
    
    // Gerar token
    const token = generateToken(cliente.id_cliente, cliente.email || '');
    
    res.status(201).json({
      mensagem: 'Cliente registrado com sucesso',
      token,
      cliente: {
        id_cliente: cliente.id_cliente,
        nome: cliente.nome,
        email: cliente.email,
      },
    });
  } catch (erro) {
    res.status(500).json({ erro: erro });
  }
});

// ============ LOGIN ============

router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, senha } = req.body;
    
    // Validar campos
    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }
    
    // Procurar cliente
    const cliente = await prisma.dimCliente.findFirst({
      where: { email },
    });
    
    if (!cliente) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }
    
    // Verificar senha
    const senhaCorreta = await comparePassword(senha, cliente.senha || '');
    
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }
    
    // Gerar token
    const token = generateToken(cliente.id_cliente, cliente.email || '');
    
    res.json({
      mensagem: 'Login realizado com sucesso',
      token,
      cliente: {
        id_cliente: cliente.id_cliente,
        nome: cliente.nome,
        email: cliente.email,
      },
    });
  } catch (erro) {
    res.status(500).json({ erro: erro });
  }
});

// ============ PERFIL (ROTA PROTEGIDA) ============

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const cliente = await prisma.dimCliente.findUnique({
      where: { id_cliente: req.user?.id_cliente },
      select: {
        id_cliente: true,
        nome: true,
        email: true,
        telefone: true,
        cidade: true,
        ativo: true,
      },
    });
    
    res.json(cliente);
  } catch (erro) {
    res.status(500).json({ erro: erro });
  }
});

export default router;