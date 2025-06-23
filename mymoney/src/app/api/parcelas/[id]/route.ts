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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const parcela = await prisma.parcela.update({
    where: { id: Number(params.id) },
    data: { status: "Pago" }
  });
  return NextResponse.json(parcela);
} 