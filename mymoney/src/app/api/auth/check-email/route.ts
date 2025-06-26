import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o usuário já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
      select: { id: true } // Só precisamos saber se existe, não os dados completos
    });

    return NextResponse.json(
      {
        exists: !!usuarioExistente,
        message: usuarioExistente ? 'Email já cadastrado' : 'Email disponível'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 