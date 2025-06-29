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
  const { searchParams } = new URL(req.url);
  const contaId = Number(searchParams.get("contaId"));
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");
  const mes = searchParams.get("mes");
  const ano = searchParams.get("ano");
  const where: any = { usuarioId: token.id };
  if (contaId) where.contaId = contaId;
  
  // Adicionar filtros de data se fornecidos
  if (mes && ano) {
    const mesNum = Number(mes);
    const anoNum = Number(ano);
    const dataInicio = new Date(anoNum, mesNum - 1, 1);
    const dataFim = new Date(anoNum, mesNum, 0, 23, 59, 59, 999);
    where.data = {
      gte: dataInicio,
      lte: dataFim
    };
  }

  let lancamentos, totalCount;
  if (page && limit) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;
    [totalCount, lancamentos] = await Promise.all([
      prisma.lancamento.count({ where }),
      prisma.lancamento.findMany({
        where,
        include: { parcelasLancamento: true, categoria: true, conta: true },
        orderBy: { data: "desc" },
        skip,
        take: limitNum
      })
    ]);
  } else {
    [totalCount, lancamentos] = await Promise.all([
      prisma.lancamento.count({ where }),
      prisma.lancamento.findMany({
        where,
        include: { parcelasLancamento: true, categoria: true, conta: true },
        orderBy: { data: "desc" }
      })
    ]);
  }
  console.log('API LANCAMENTOS - where:', where);
  console.log('API LANCAMENTOS - lancamentos encontrados:', lancamentos.length);
  return NextResponse.json({ lancamentos, totalCount });
}

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const body = await req.json();
  const { descricao, tipo, valor, data, parcelado, parcelas, contaId, categoriaId, metaId, recorrente, frequencia, dataTermino } = body;
  if (!descricao || !tipo || !valor || !data || !contaId || !categoriaId) {
    return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
  }

  // Se não for recorrente, lógica padrão
  if (!recorrente) {
    const lancamento = await prisma.lancamento.create({
      data: {
        descricao,
        tipo,
        valor,
        data: new Date(data),
        parcelado: !!parcelado,
        parcelas: parcelado ? parcelas : null,
        contaId: Number(contaId),
        categoriaId: Number(categoriaId),
        usuarioId: token.id,
        metaId: metaId ? Number(metaId) : undefined,
        recorrente: false,
        frequencia: null,
        dataTermino: null
      }
    });
    // Se for parcelado, criar as parcelas automaticamente
    if (parcelado && parcelas > 1) {
      const valorParcela = valor / parcelas;
      const parcelasData = Array.from({ length: parcelas }).map((_, i) => ({
        lancamentoId: lancamento.id,
        numeroParcela: i + 1,
        valorParcela,
        dataVencimento: new Date(new Date(data).setMonth(new Date(data).getMonth() + i)),
        status: i === 0 ? "Pago" : "Em aberto"
      }));
      await prisma.parcela.createMany({ data: parcelasData });
    } else {
      // Se não for parcelado, tentar dar baixa automática em parcela em aberto correspondente
      await prisma.parcela.updateMany({
        where: {
          status: "Em aberto",
          valorParcela: valor,
          dataVencimento: new Date(data),
          lancamento: {
            descricao: descricao,
            contaId: Number(contaId),
            categoriaId: Number(categoriaId),
          }
        },
        data: { status: "Pago" }
      });
    }
    return NextResponse.json(lancamento);
  }

  // Se for recorrente, criar vários lançamentos futuros
  let dataInicio = new Date(data);
  let dataFim = dataTermino ? new Date(dataTermino) : null;
  const lancamentosCriados = [];
  let maxRepeticoes = 6; // Limite de segurança (ex: 6 meses)
  let count = 0;
  let ano = dataInicio.getFullYear();
  let mes = dataInicio.getMonth(); // 0-indexado
  let dia = dataInicio.getDate();
  while (true) {
    let dataAtual;
    if (frequencia === "semanal") {
      dataAtual = new Date(dataInicio.getTime() + count * 7 * 24 * 60 * 60 * 1000);
    } else if (frequencia === "quinzenal") {
      dataAtual = new Date(dataInicio.getTime() + count * 15 * 24 * 60 * 60 * 1000);
    } else if (frequencia === "anual") {
      dataAtual = new Date(ano + count, mes, dia);
    } else {
      // padrão: mensal
      dataAtual = new Date(ano, mes + count, dia);
    }
    if (dataFim && dataAtual > dataFim) break;
    if (!dataFim && count >= maxRepeticoes) break;
    const lancamento = await prisma.lancamento.create({
      data: {
        descricao,
        tipo,
        valor,
        data: dataAtual,
        parcelado: !!parcelado,
        parcelas: parcelado ? parcelas : null,
        contaId: Number(contaId),
        categoriaId: Number(categoriaId),
        usuarioId: token.id,
        metaId: metaId ? Number(metaId) : undefined,
        recorrente: true,
        frequencia: frequencia || "mensal",
        dataTermino: dataFim
      }
    });
    lancamentosCriados.push(lancamento);
    count++;
  }
  return NextResponse.json({ recorrentes: lancamentosCriados });
}

export async function PATCH(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const body = await req.json();
  const { id, descricao, tipo, valor, data, categoriaId } = body;
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  const lancamento = await prisma.lancamento.update({
    where: { id, usuarioId: token.id },
    data: { descricao, tipo, valor, data: new Date(data), categoriaId }
  });
  return NextResponse.json(lancamento);
}

export async function DELETE(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  const lancamento = await prisma.lancamento.findFirst({ where: { id, usuarioId: token.id } });
  if (!lancamento) return NextResponse.json({ error: "Lançamento não encontrado" }, { status: 404 });
  await prisma.lancamento.delete({ where: { id } });
  return NextResponse.json({ ok: true });
} 