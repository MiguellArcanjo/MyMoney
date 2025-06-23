import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
        return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
        return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
        where: {
            id: Number((decoded as any).id),
        },
        select: {
            id: true,
            nome: true,
            email: true,
        },
    });

    if (!usuario) {
        return NextResponse.json(
            { message: 'Usuário não encontrado' },
            { status: 404 }
        );
    }

    return NextResponse.json(usuario);
}