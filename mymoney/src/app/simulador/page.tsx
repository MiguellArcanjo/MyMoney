"use client";

import { useState, useEffect } from "react";
import SideBar from "@/components/SideBar/sideBar";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend
} from "chart.js";
import LoadingSpinner from "@/components/LoadingSpinner";
import styles from "./page.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

interface Projecao {
  mes: number;
  saldo: number;
}

interface DadosFinanceiros {
  saldoAtual: number;
  receitaMediaMensal: number;
  gastoMedioMensal: number;
  salario: number;
  dadosDisponiveis: {
    temContas: boolean;
    temLancamentos: boolean;
    temSalario: boolean;
  };
  detalhesSaldo?: {
    saldoInicialTotal: number;
    impactoLancamentos: number;
    totalLancamentos: number;
    baseSaldo: string;
    salarioBase: number;
  };
}

export default function Simulador() {
  const [saldoAtual, setSaldoAtual] = useState<number>(0);
  const [receitaMensal, setReceitaMensal] = useState<number>(0);
  const [gastoMensal, setGastoMensal] = useState<number>(0);
  const [periodo, setPeriodo] = useState<number>(6);
  const [projecoes, setProjecoes] = useState<Projecao[]>([]);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);
  const [dadosFinanceiros, setDadosFinanceiros] = useState<DadosFinanceiros | null>(null);
  const [dadosCarregados, setDadosCarregados] = useState(false);

  async function carregarDadosFinanceiros() {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingDados(false);
      return;
    }
    
    try {
      setLoadingDados(true);
      const res = await fetch("/api/simulador/dados", {
        headers: { Authorization: "Bearer " + token }
      });
      
      if (res.ok) {
        const dados = await res.json();
        setDadosFinanceiros(dados);
        
        // Preencher automaticamente os campos
        setSaldoAtual(dados.saldoAtual);
        
        // Usar salário se disponível, senão usar receita média
        if (dados.salario > 0) {
          setReceitaMensal(dados.salario);
        } else if (dados.receitaMediaMensal > 0) {
          setReceitaMensal(dados.receitaMediaMensal);
        }
        
        setGastoMensal(dados.gastoMedioMensal);
        setDadosCarregados(true);
      }
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    } finally {
      setLoadingDados(false);
    }
  }

  useEffect(() => {
    carregarDadosFinanceiros();
  }, []);

  const recarregarDados = () => {
    carregarDadosFinanceiros();
  };

  const gerarProjecao = () => {
    if (saldoAtual < 0 || receitaMensal < 0 || gastoMensal < 0) {
      alert("Por favor, insira valores válidos (maiores ou iguais a zero).");
      return;
    }

    setLoading(true);
    
    // Simular um pequeno delay para melhor UX
    setTimeout(() => {
      const novasProjecoes: Projecao[] = [];
      let saldoAcumulado = saldoAtual;
      
      for (let mes = 1; mes <= periodo; mes++) {
        saldoAcumulado += (receitaMensal - gastoMensal);
        novasProjecoes.push({
          mes,
          saldo: saldoAcumulado
        });
      }
      
      setProjecoes(novasProjecoes);
      setMostrarResultado(true);
      setLoading(false);
    }, 500);
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const chartData = {
    labels: projecoes.map(p => `Mês ${p.mes}`),
    datasets: [
      {
        label: 'Saldo Projetado',
        data: projecoes.map(p => p.saldo),
        borderColor: '#00D1B2',
        backgroundColor: 'rgba(0, 209, 178, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#00D1B2',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(14, 42, 76, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#00D1B2',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `Saldo: ${formatarMoeda(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(34, 59, 90, 0.2)'
        },
        ticks: {
          color: 'var(--text-secondary)'
        }
      },
      y: {
        grid: {
          color: 'rgba(34, 59, 90, 0.2)'
        },
        ticks: {
          color: 'var(--text-secondary)',
          callback: function(value: any) {
            return formatarMoeda(value);
          }
        }
      }
    }
  };

  if (loadingDados) {
    return (
      <div className={styles.container}>
        <SideBar />
        <main className={styles.main}>
          <div className={styles.content}>
            <h1 className="title">Simulador Financeiro</h1>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <LoadingSpinner size={48} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <SideBar />
      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className="title">Simulador Financeiro</h1>
          
          {dadosCarregados && dadosFinanceiros && (
            <div className={styles.summary} style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <p className={styles.summaryText} style={{ margin: 0 }}>
                  📊 <strong>Dados carregados automaticamente:</strong>
                </p>
                <button
                  onClick={recarregarDados}
                  disabled={loadingDados}
                  style={{
                    background: 'var(--primary)',
                    color: '#081B33',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: loadingDados ? 'not-allowed' : 'pointer',
                    opacity: loadingDados ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {loadingDados ? <LoadingSpinner size={12} inline /> : '🔄 Atualizar'}
                </button>
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                {dadosFinanceiros.dadosDisponiveis.temContas && (
                  <>💰 Saldo atual: {formatarMoeda(dadosFinanceiros.saldoAtual)}<br /></>
                )}
                {dadosFinanceiros.dadosDisponiveis.temSalario && (
                  <>💵 Salário: {formatarMoeda(dadosFinanceiros.salario)}<br /></>
                )}
                {dadosFinanceiros.dadosDisponiveis.temLancamentos && (
                  <>📈 Receita média (6 meses): {formatarMoeda(dadosFinanceiros.receitaMediaMensal)}<br />
                  📉 Gasto médio (6 meses): {formatarMoeda(dadosFinanceiros.gastoMedioMensal)}</>
                )}
                {!dadosFinanceiros.dadosDisponiveis.temContas && !dadosFinanceiros.dadosDisponiveis.temSalario && !dadosFinanceiros.dadosDisponiveis.temLancamentos && (
                  <>⚠️ Nenhum dado financeiro encontrado. Preencha manualmente os campos abaixo.</>
                )}
                {dadosFinanceiros.detalhesSaldo && (
                  <div style={{ marginTop: '8px', padding: '8px', backgroundColor: 'rgba(0, 209, 178, 0.05)', borderRadius: '4px', fontSize: '12px' }}>
                    <strong>Detalhes do saldo:</strong><br />
                    {dadosFinanceiros.detalhesSaldo.baseSaldo === 'salario' ? (
                      <>
                        • Salário base: {formatarMoeda(dadosFinanceiros.detalhesSaldo.salarioBase)}<br />
                        • Saldo contas: {formatarMoeda(dadosFinanceiros.detalhesSaldo.saldoInicialTotal)}<br />
                        • Impacto lançamentos: {formatarMoeda(dadosFinanceiros.detalhesSaldo.impactoLancamentos)}<br />
                        • Total lançamentos: {dadosFinanceiros.detalhesSaldo.totalLancamentos}
                      </>
                    ) : (
                      <>
                        • Saldo inicial: {formatarMoeda(dadosFinanceiros.detalhesSaldo.saldoInicialTotal)}<br />
                        • Impacto lançamentos: {formatarMoeda(dadosFinanceiros.detalhesSaldo.impactoLancamentos)}<br />
                        • Total lançamentos: {dadosFinanceiros.detalhesSaldo.totalLancamentos}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>
              Dados para Simulação
            </h2>
            
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label className={styles.label}>
                  Saldo Atual
                </label>
                <input
                  type="number"
                  value={saldoAtual}
                  onChange={(e) => setSaldoAtual(Number(e.target.value))}
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  className={styles.input}
                />
                {dadosFinanceiros?.dadosDisponiveis.temContas && (
                  <small style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                    💡 Calculado automaticamente: {dadosFinanceiros.detalhesSaldo?.baseSaldo === 'salario' 
                      ? 'salário + saldo das contas + impacto dos lançamentos até hoje'
                      : 'saldo inicial das contas + impacto dos lançamentos até hoje'
                    }
                  </small>
                )}
              </div>
              
              <div className={styles.formField}>
                <label className={styles.label}>
                  Receita Mensal
                </label>
                <input
                  type="number"
                  value={receitaMensal}
                  onChange={(e) => setReceitaMensal(Number(e.target.value))}
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  className={styles.input}
                />
                {dadosFinanceiros?.dadosDisponiveis.temSalario && (
                  <small style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                    💡 Carregado automaticamente do seu salário
                  </small>
                )}
              </div>
              
              <div className={styles.formField}>
                <label className={styles.label}>
                  Gasto Médio Mensal
                </label>
                <input
                  type="number"
                  value={gastoMensal}
                  onChange={(e) => setGastoMensal(Number(e.target.value))}
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  className={styles.input}
                />
                {dadosFinanceiros?.dadosDisponiveis.temLancamentos && (
                  <small style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                    💡 Calculado automaticamente dos últimos 6 meses
                  </small>
                )}
              </div>
              
              <div className={styles.formField}>
                <label className={styles.label}>
                  Período da Simulação
                </label>
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(Number(e.target.value))}
                  className={styles.input}
                >
                  <option value={3}>3 meses</option>
                  <option value={6}>6 meses</option>
                  <option value={12}>12 meses</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={gerarProjecao}
              disabled={loading}
              className={styles.button}
            >
              {loading ? <LoadingSpinner size={20} inline /> : 'Gerar Projeção'}
            </button>
          </div>
          
          {mostrarResultado && projecoes.length > 0 && (
            <>
              <div className={styles.resultCard}>
                <h2 className={styles.formTitle}>
                  Projeção do Saldo
                </h2>
                
                <div className={styles.chartContainer}>
                  <Line data={chartData} options={chartOptions} />
                </div>
                
                <div className={styles.summary}>
                  <p className={styles.summaryText}>
                    🔍 Se você mantiver esse padrão, seu saldo final em {periodo} {periodo === 1 ? 'mês' : 'meses'} será de{' '}
                    <strong className={styles.summaryHighlight}>
                      {formatarMoeda(projecoes[projecoes.length - 1].saldo)}
                    </strong>
                  </p>
                </div>
              </div>
              
              <div className={styles.tableCard}>
                <h2 className={styles.formTitle}>
                  Detalhamento Mensal
                </h2>
                
                <div className={styles.tableGrid}>
                  {projecoes.map((projecao) => (
                    <div
                      key={projecao.mes}
                      className={`${styles.tableItem} ${
                        projecao.saldo >= 0 ? styles.tableItemPositive : styles.tableItemNegative
                      }`}
                    >
                      <div className={styles.monthLabel}>
                        Mês {projecao.mes}
                      </div>
                      <div className={`${styles.monthValue} ${
                        projecao.saldo >= 0 ? styles.monthValuePositive : styles.monthValueNegative
                      }`}>
                        {formatarMoeda(projecao.saldo)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
} 