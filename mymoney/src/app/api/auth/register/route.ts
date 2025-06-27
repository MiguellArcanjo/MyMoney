import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { enviarEmailVerificacao } from '@/lib/email';
import { gerarTokenVerificacao, calcularExpiracao } from '@/lib/tokens';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, email, senha, salario, objetivo } = body;

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
        { message: 'Este email já está cadastrado. Tente fazer login ou use outro email.' },
        { status: 400 }
      );
    }

    // Criptografar senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Gerar token de verificação
    const tokenVerificacao = gerarTokenVerificacao();
    const expiracao = calcularExpiracao(24); // 24 horas

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        salario: salario ? Number(salario) : undefined,
        objetivoFinanceiro: objetivo || undefined,
        emailVerificado: false,
        tokenVerificacao,
        tokenExpiracao: expiracao,
      },
    });

    // Enviar email de verificação
    const emailEnviado = await enviarEmailVerificacao(email, nome, tokenVerificacao);

    if (!emailEnviado) {
      // Se não conseguir enviar o email, deletar o usuário criado
      await prisma.usuario.delete({
        where: { id: usuario.id },
      });
      
      return NextResponse.json(
        { message: 'Erro ao enviar email de verificação. Tente novamente.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Usuário cadastrado com sucesso! Verifique seu email para ativar sua conta.',
        user: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
