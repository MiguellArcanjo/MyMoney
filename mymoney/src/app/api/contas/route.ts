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

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const contas = await prisma.conta.findMany({
    where: { usuarioId: token.id },
    include: { lancamentos: true },
    orderBy: { id: "desc" }
  });
  return NextResponse.json(contas);
}

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const body = await req.json();
  const { nome, saldo, tipo } = body;
  if (!nome || !tipo) return NextResponse.json({ error: "Nome e tipo obrigatórios" }, { status: 400 });
  const conta = await prisma.conta.create({
    data: {
      nome,
      tipo,
      saldo: saldo ?? 0,
      usuarioId: token.id
    }
  });
  return NextResponse.json(conta);
}

export async function PATCH(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const body = await req.json();
  const { id, nome, saldo, tipo } = body;
  if (!id || !tipo) return NextResponse.json({ error: "ID e tipo obrigatórios" }, { status: 400 });
  const conta = await prisma.conta.update({
    where: { id, usuarioId: token.id },
    data: { nome, tipo, saldo }
  });
  return NextResponse.json(conta);
}

export async function DELETE(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  await prisma.conta.delete({ where: { id, usuarioId: token.id } });
  return NextResponse.json({ ok: true });
}
