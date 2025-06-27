import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { tokenExpirado } from '@/lib/tokens';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { message: 'Token de verificação é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar usuário pelo token
    const usuario = await prisma.usuario.findFirst({
      where: {
        tokenVerificacao: token,
        emailVerificado: false,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { message: 'Token de verificação inválido ou já utilizado' },
        { status: 400 }
      );
    }

    // Verificar se o token expirou
    if (usuario.tokenExpiracao && tokenExpirado(usuario.tokenExpiracao)) {
      return NextResponse.json(
        { message: 'Token de verificação expirado. Solicite um novo email de verificação.' },
        { status: 400 }
      );
    }

    // Marcar email como verificado
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        emailVerificado: true,
        tokenVerificacao: null,
        tokenExpiracao: null,
      },
    });

    return NextResponse.json(
      {
        message: 'Email verificado com sucesso! Você já pode fazer login.',
        user: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
        },
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