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
  const categorias = await prisma.categoria.findMany({
    where: { usuarioId: Number(decoded.id) },
    orderBy: { id: "desc" }
  });
  return NextResponse.json(categorias);
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
  }
  const token = authHeader.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded || typeof decoded !== "object" || !('id' in decoded)) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
  const { nome, tipo, cor } = await request.json();
  if (!nome || !tipo || !cor) {
    return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 });
  }
  const categoria = await prisma.categoria.create({
    data: {
      nome,
      tipo,
      cor,
      usuarioId: Number(decoded.id)
    }
  });
  return NextResponse.json(categoria, { status: 201 });
} 