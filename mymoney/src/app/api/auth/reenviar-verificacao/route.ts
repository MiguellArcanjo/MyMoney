import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { enviarEmailVerificacao } from '@/lib/email';
import { gerarTokenVerificacao, calcularExpiracao } from '@/lib/tokens';

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

    // Buscar usuário pelo email
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    if (usuario.emailVerificado) {
      return NextResponse.json(
        { message: 'Email já foi verificado' },
        { status: 400 }
      );
    }

    // Gerar novo token de verificação
    const novoToken = gerarTokenVerificacao();
    const novaExpiracao = calcularExpiracao(24); // 24 horas

    // Atualizar token no banco
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        tokenVerificacao: novoToken,
        tokenExpiracao: novaExpiracao,
      },
    });

    // Enviar novo email de verificação
    const emailEnviado = await enviarEmailVerificacao(email, usuario.nome, novoToken);

    if (!emailEnviado) {
      return NextResponse.json(
        { message: 'Erro ao enviar email de verificação. Tente novamente.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Email de verificação reenviado com sucesso!',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao reenviar verificação:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 