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
  const { descricao, valorObjetivo, dataInicio, dataFim } = await request.json();
  const meta = await prisma.meta.updateMany({
    where: {
      id: Number(id),
      usuarioId: Number(decoded.id)
    },
    data: {
      descricao,
      valorObjetivo: Number(valorObjetivo),
      dataInicio: new Date(dataInicio),
      dataFim: new Date(dataFim)
    }
  });
  if (meta.count === 0) {
    return NextResponse.json({ error: "Meta não encontrada ou não pertence ao usuário" }, { status: 404 });
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
  const meta = await prisma.meta.deleteMany({
    where: {
      id: Number(id),
      usuarioId: Number(decoded.id)
    }
  });
  if (meta.count === 0) {
    return NextResponse.json({ error: "Meta não encontrada ou não pertence ao usuário" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
} 