import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { enviarEmailRedefinicaoSenha } from '@/lib/email';
import { gerarTokenRedefinicaoSenha, calcularExpiracao } from '@/lib/tokens';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;
    if (!email) {
      return NextResponse.json({ message: 'Email é obrigatório' }, { status: 400 });
    }
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      // Sempre retorna sucesso para não expor emails existentes
      return NextResponse.json({ message: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.' }, { status: 200 });
    }
    const token = gerarTokenRedefinicaoSenha();
    const expiracao = calcularExpiracao(1); // 1 hora
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        tokenVerificacao: token,
        tokenExpiracao: expiracao,
      },
    });
    await enviarEmailRedefinicaoSenha(email, usuario.nome, token);
    return NextResponse.json({ message: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
} 