import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
  const categoria = await prisma.categoria.updateMany({
    where: {
      id: Number(id),
      usuarioId: Number(decoded.id)
    },
    data: {
      nome,
      tipo,
      cor
    }
  });
  if (categoria.count === 0) {
    return NextResponse.json({ error: "Categoria não encontrada ou não pertence ao usuário" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
  }
  const token = authHeader.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded || typeof decoded !== "object" || !('id' in decoded)) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
  const categoria = await prisma.categoria.deleteMany({
    where: {
      id: Number(id),
      usuarioId: Number(decoded.id)
    }
  });
  if (categoria.count === 0) {
    return NextResponse.json({ error: "Categoria não encontrada ou não pertence ao usuário" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
} 