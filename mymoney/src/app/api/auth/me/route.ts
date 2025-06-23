import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded || typeof decoded !== "object" || !('id' in decoded)) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: Number(decoded.id) },
    select: { nome: true, email: true, salario: true }
  });

  if (!usuario) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  return NextResponse.json(usuario);
}

export async function PATCH(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded || typeof decoded !== "object" || !('id' in decoded)) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const { nome, email, salario } = await request.json();
  if (!nome || !email) {
    return NextResponse.json({ error: "Nome e email são obrigatórios" }, { status: 400 });
  }

  try {
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: Number(decoded.id) },
      data: { nome, email, salario: salario !== undefined ? Number(salario) : undefined },
      select: { nome: true, email: true, salario: true }
    });
    return NextResponse.json(usuarioAtualizado);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 });
  }
} 