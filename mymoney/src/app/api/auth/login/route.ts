import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'secretofortetrocaaqui';

export async function POST(request: Request) {
    const body = await request.json();
    const { email, senha } = body;

    if (!email || !senha) {
        return NextResponse.json(
            { message: 'Email e senha são obrigatórios' },
            { status: 400 }
        );
    }

    const usuario = await prisma.usuario.findUnique({
        where: { email },
    });

    if (!usuario) {
        return NextResponse.json(
            { message: 'Usuário não encontrado' },
            { status: 404 }
        );
    }

    if (!usuario.emailVerificado) {
        return NextResponse.json(
            { 
                message: 'Email não verificado. Verifique sua caixa de entrada e clique no link de verificação.',
                emailNaoVerificado: true
            },
            { status: 401 }
        );
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
        return NextResponse.json(
            { message: 'Senha incorreta' },
            { status: 401 }
        );
    }

    const token = jwt.sign(
        {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
        },
        JWT_SECRET,
        { expiresIn: '1d' }
    );

    return NextResponse.json(
        {
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
            },
        },
        { status: 200 }
    );
}