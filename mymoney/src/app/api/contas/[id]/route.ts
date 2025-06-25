import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

function getTokenFromRequest(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const token = auth.replace("Bearer ", "");
  const payload = verifyToken(token);
  if (!payload || typeof payload !== 'object' || !('id' in payload)) return null;
  return payload;
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const conta = await prisma.conta.findFirst({
    where: { id: Number(id), usuarioId: token.id },
    include: { lancamentos: true }
  });
  if (!conta) return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
  return NextResponse.json(conta);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const body = await req.json();
  const { nome, saldo } = body;
  const conta = await prisma.conta.update({
    where: { id: Number(id), usuarioId: token.id },
    data: { nome, saldo }
  });
  return NextResponse.json(conta);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  await prisma.conta.delete({ where: { id: Number(id), usuarioId: token.id } });
  return NextResponse.json({ ok: true });
} 