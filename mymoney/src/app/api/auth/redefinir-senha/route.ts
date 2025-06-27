import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { tokenExpirado } from '@/lib/tokens';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, senha } = body;
    if (!token || !senha) {
      return NextResponse.json({ message: 'Token e nova senha são obrigatórios' }, { status: 400 });
    }
    const usuario = await prisma.usuario.findFirst({
      where: {
        tokenVerificacao: token,
      },
    });
    if (!usuario) {
      return NextResponse.json({ message: 'Token inválido ou expirado' }, { status: 400 });
    }
    if (usuario.tokenExpiracao && tokenExpirado(usuario.tokenExpiracao)) {
      return NextResponse.json({ message: 'Token expirado. Solicite uma nova redefinição.' }, { status: 400 });
    }
    const senhaHash = await bcrypt.hash(senha, 10);
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        senha: senhaHash,
        tokenVerificacao: null,
        tokenExpiracao: null,
        emailVerificado: true,
      },
    });
    return NextResponse.json({ message: 'Senha redefinida com sucesso!' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
} 