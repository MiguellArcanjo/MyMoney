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
  const metas = await prisma.meta.findMany({
    where: { usuarioId: Number(decoded.id) },
    orderBy: { id: "desc" }
  });
  return NextResponse.json(metas);
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
  const { descricao, valorObjetivo, dataInicio, dataFim } = await request.json();
  if (!descricao || !valorObjetivo || !dataInicio || !dataFim) {
    return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 });
  }
  const meta = await prisma.meta.create({
    data: {
      descricao,
      valorObjetivo: Number(valorObjetivo),
      dataInicio: new Date(dataInicio),
      dataFim: new Date(dataFim),
      usuarioId: Number(decoded.id)
    }
  });
  return NextResponse.json(meta, { status: 201 });
} 