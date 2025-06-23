import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const body = await request.json();
  const { nome, email, senha, salario } = body;

  if (!nome || !email || !senha) {
    return NextResponse.json(
      { message: 'Todos os campos são obrigatórios' },
      { status: 400 }
    );
  }

  // Verificar se o usuário já existe
  const usuarioExistente = await prisma.usuario.findUnique({
    where: { email },
  });

  if (usuarioExistente) {
    return NextResponse.json(
      { message: 'Email já cadastrado' },
      { status: 400 }
    );
  }

  // Criptografar senha
  const senhaHash = await bcrypt.hash(senha, 10);

  // Criar usuário
  const usuario = await prisma.usuario.create({
    data: {
      nome,
      email,
      senha: senhaHash,
      salario: salario ? Number(salario) : undefined,
    },
  });

  return NextResponse.json(
    {
      message: 'Usuário cadastrado com sucesso',
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    },
    { status: 201 }
  );
}
