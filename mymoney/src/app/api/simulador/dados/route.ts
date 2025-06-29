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

  try {
    // Buscar dados do usuário (salário) primeiro
    const usuario = await prisma.usuario.findUnique({
      where: { id: token.id },
      select: { salario: true }
    });

    // Buscar contas e seus saldos iniciais
    const contas = await prisma.conta.findMany({
      where: { usuarioId: token.id },
      select: { id: true, saldo: true }
    });
    
    // Calcular saldo inicial total das contas
    const saldoInicialTotal = contas.reduce((total, conta) => total + Number(conta.saldo), 0);

    // Buscar todos os lançamentos até hoje para calcular o saldo real
    const lancamentos = await prisma.lancamento.findMany({
      where: {
        usuarioId: token.id,
        data: {
          lte: new Date() // Apenas lançamentos até hoje
        }
      },
      include: {
        parcelasLancamento: true
      }
    });

    // Calcular impacto dos lançamentos no saldo
    let impactoLancamentos = 0;
    
    lancamentos.forEach(lancamento => {
      if (lancamento.parcelado && lancamento.parcelasLancamento?.length) {
        // Para lançamentos parcelados, considerar apenas parcelas vencidas até hoje
        lancamento.parcelasLancamento.forEach(parcela => {
          const dataVencimento = new Date(parcela.dataVencimento);
          if (dataVencimento <= new Date()) {
            if (lancamento.tipo === "Receita" && !lancamento.metaId) {
              impactoLancamentos += Number(parcela.valorParcela);
            } else if (lancamento.tipo === "Despesa") {
              impactoLancamentos -= Number(parcela.valorParcela);
            }
          }
        });
      } else {
        // Para lançamentos à vista, considerar se já aconteceram
        const dataLancamento = new Date(lancamento.data);
        if (dataLancamento <= new Date()) {
          if (lancamento.tipo === "Receita" && !lancamento.metaId) {
            impactoLancamentos += Number(lancamento.valor);
          } else if (lancamento.tipo === "Despesa") {
            impactoLancamentos -= Number(lancamento.valor);
          }
        }
      }
    });

    // Calcular saldo baseado no salário (se disponível)
    let saldoAtual = 0;
    let baseSaldo = "contas";

    if (usuario?.salario && usuario.salario > 0) {
      // Se tem salário, usar como base + saldo das contas + lançamentos
      saldoAtual = Number(usuario.salario) + saldoInicialTotal + impactoLancamentos;
      baseSaldo = "salario";
    } else {
      // Se não tem salário, usar apenas saldo das contas + lançamentos
      saldoAtual = saldoInicialTotal + impactoLancamentos;
      baseSaldo = "contas";
    }

    // Calcular gasto médio mensal dos últimos 6 meses
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
    
    const lancamentosDespesas = await prisma.lancamento.findMany({
      where: {
        usuarioId: token.id,
        tipo: "Despesa",
        data: {
          gte: seisMesesAtras
        }
      },
      include: {
        parcelasLancamento: true
      }
    });

    let totalGastos = 0;
    let mesesComGastos = new Set();

    lancamentosDespesas.forEach(lancamento => {
      if (lancamento.parcelado && lancamento.parcelasLancamento?.length) {
        // Se for parcelado, distribuir as parcelas pelos meses
        lancamento.parcelasLancamento.forEach(parcela => {
          const dataParcela = new Date(parcela.dataVencimento);
          const mesAno = `${dataParcela.getFullYear()}-${dataParcela.getMonth() + 1}`;
          mesesComGastos.add(mesAno);
          totalGastos += Number(parcela.valorParcela);
        });
      } else {
        // Se não for parcelado, contar apenas no mês do lançamento
        const dataLancamento = new Date(lancamento.data);
        const mesAno = `${dataLancamento.getFullYear()}-${dataLancamento.getMonth() + 1}`;
        mesesComGastos.add(mesAno);
        totalGastos += Number(lancamento.valor);
      }
    });

    // Calcular média mensal
    const numeroMeses = Math.max(mesesComGastos.size, 1); // Mínimo 1 mês para evitar divisão por zero
    const gastoMedioMensal = totalGastos / numeroMeses;

    // Buscar receita média mensal dos últimos 6 meses (excluindo metas)
    const lancamentosReceitas = await prisma.lancamento.findMany({
      where: {
        usuarioId: token.id,
        tipo: "Receita",
        metaId: null, // Excluir receitas de metas
        data: {
          gte: seisMesesAtras
        }
      },
      include: {
        parcelasLancamento: true
      }
    });

    let totalReceitas = 0;
    let mesesComReceitas = new Set();

    lancamentosReceitas.forEach(lancamento => {
      if (lancamento.parcelado && lancamento.parcelasLancamento?.length) {
        lancamento.parcelasLancamento.forEach(parcela => {
          const dataParcela = new Date(parcela.dataVencimento);
          const mesAno = `${dataParcela.getFullYear()}-${dataParcela.getMonth() + 1}`;
          mesesComReceitas.add(mesAno);
          totalReceitas += Number(parcela.valorParcela);
        });
      } else {
        const dataLancamento = new Date(lancamento.data);
        const mesAno = `${dataLancamento.getFullYear()}-${dataLancamento.getMonth() + 1}`;
        mesesComReceitas.add(mesAno);
        totalReceitas += Number(lancamento.valor);
      }
    });

    const numeroMesesReceitas = Math.max(mesesComReceitas.size, 1);
    const receitaMediaMensal = totalReceitas / numeroMesesReceitas;

    return NextResponse.json({
      saldoAtual,
      receitaMediaMensal,
      gastoMedioMensal,
      salario: usuario?.salario || 0,
      dadosDisponiveis: {
        temContas: contas.length > 0,
        temLancamentos: lancamentosDespesas.length > 0 || lancamentosReceitas.length > 0,
        temSalario: !!usuario?.salario
      },
      detalhesSaldo: {
        saldoInicialTotal,
        impactoLancamentos,
        totalLancamentos: lancamentos.length,
        baseSaldo,
        salarioBase: usuario?.salario || 0
      }
    });

  } catch (error) {
    console.error("Erro ao buscar dados do simulador:", error);
    return NextResponse.json({ 
      error: "Erro interno do servidor" 
    }, { status: 500 });
  }
} 