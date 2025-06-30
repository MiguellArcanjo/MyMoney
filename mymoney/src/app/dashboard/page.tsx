"use client";

import { useEffect, useState, useMemo } from "react";
import SideBar from "@/components/SideBar/sideBar";
import styles from "./page.module.css";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle
} from "chart.js";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSidebar } from "@/components/SideBar/SidebarContext";
import { colors } from "react-select/dist/declarations/src/theme";
import { useTheme } from "@/components/ThemeProvider";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, ChartTitle);

function useCurrentTheme() {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const t = localStorage.getItem("theme") || "dark";
    setTheme(t);
    function syncTheme() {
      setTheme(localStorage.getItem("theme") || "dark");
    }
    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);
  return theme;
}

export default function Dashboard() {
  const [contas, setContas] = useState<any[]>([]);
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loadingContas, setLoadingContas] = useState(true);
  const [loadingLanc, setLoadingLanc] = useState(true);
  const [loadingCat, setLoadingCat] = useState(true);
  const [usuario, setUsuario] = useState<{ nome: string; email: string; salario?: number } | null>(null);
  const [loadingUsuario, setLoadingUsuario] = useState(true);
  const [saldosMes, setSaldosMes] = useState<{ [key: number]: number }>({});
  const [loadingSaldosMes, setLoadingSaldosMes] = useState(true);
  const filtroMes = new Date().getMonth() + 1;
  const filtroAno = new Date().getFullYear();
  const [lancamentosTotais, setLancamentosTotais] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const { setIsOpen } = useSidebar();
  const { theme } = useTheme();
  const [chartKey, setChartKey] = useState(0);
  const [showCharts, setShowCharts] = useState(true);

  const chartColors = theme === 'dark'
    ? {
        text: '#fff',
        bg: '#081B33',
        card: '#0E2A4C',
        secondary: '#A5B3C7',
        border: '#223B5A',
        pie: ["#00D1B2", "#FF5C5C", "#3A4B6A", "#F7B801", "#A259F7", "#2EC4B6", "#FF9F1C", "#E71D36"],
        line: "#00D1B2",
        lineBg: "rgba(0,209,178,0.2)"
      }
    : {
        text: '#081B33',
        bg: '#fff',
        card: '#fff',
        secondary: '#5C6A7C',
        border: '#e0e6ed',
        pie: ["#00D1B2", "#FF5C5C", "#3A4B6A", "#F7B801", "#A259F7", "#2EC4B6", "#FF9F1C", "#E71D36"],
        line: "#00D1B2",
        lineBg: "rgba(0,209,178,0.2)"
      };

  useEffect(() => {
    setShowCharts(false);
    const raf = requestAnimationFrame(() => {
      setTimeout(() => {
        setShowCharts(true);
        setChartKey((k) => k + 1);
      }, 50);
    });
    return () => cancelAnimationFrame(raf);
  }, [theme]);

  const pieOptions = {
    plugins: {
      legend: {
        display: true,
        labels: {
          color: chartColors.text,
          font: { size: 18 }
        }
      },
      title: {
        display: false,
        color: chartColors.text
      }
    }
  };

  const lineOptions = {
    plugins: {
      legend: {
        display: true,
        labels: {
          color: chartColors.text,
          font: { size: 18 }
        }
      },
      title: {
        display: false,
        color: chartColors.text
      }
    },
    scales: {
      x: {
        ticks: { color: chartColors.text },
        title: { color: chartColors.text }
      },
      y: {
        ticks: { color: chartColors.text },
        title: { color: chartColors.text }
      }
    }
  };

  useEffect(() => {
    async function fetchContas() {
      const token = localStorage.getItem("token");
      if (!token) return setLoadingContas(false);
      const res = await fetch("/api/contas", {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        setContas(data.contas || []);
      }
      setLoadingContas(false);
    }
    fetchContas();
  }, []);

  useEffect(() => {
    async function fetchLancamentos() {
      const token = localStorage.getItem("token");
      if (!token) return setLoadingLanc(false);
      const res = await fetch("/api/lancamentos", {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        setLancamentos(data.lancamentos || []);
      }
      setLoadingLanc(false);
    }
    fetchLancamentos();
  }, []);

  useEffect(() => {
    async function fetchCategorias() {
      const token = localStorage.getItem("token");
      if (!token) return setLoadingCat(false);
      const res = await fetch("/api/categorias", {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) setCategorias(await res.json());
      setLoadingCat(false);
    }
    fetchCategorias();
  }, []);

  useEffect(() => {
    async function fetchUsuario() {
      const token = localStorage.getItem("token");
      if (!token) return setLoadingUsuario(false);
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) setUsuario(await res.json());
      setLoadingUsuario(false);
    }
    fetchUsuario();
  }, []);

  useEffect(() => {
    async function calcularSaldoMes(conta: any) {
      const token = localStorage.getItem("token");
      if (!token) return 0;
      const res = await fetch(`/api/lancamentos?contaId=${conta.id}`, {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) {
        const lancamentos = await res.json();
        let saldo = 0;
        (Array.isArray(lancamentos) ? lancamentos : []).forEach((l: any) => {
          if (l.tipo === "Despesa") {
            if (l.parcelado && l.parcelasLancamento?.length) {
              l.parcelasLancamento.forEach((p: any) => {
                const data = new Date(p.dataVencimento);
                if (data.getMonth() + 1 === filtroMes && data.getFullYear() === filtroAno) {
                  saldo -= Number(p.valorParcela);
                }
              });
            } else {
              const data = new Date(l.data);
              if (data.getMonth() + 1 === filtroMes && data.getFullYear() === filtroAno) {
                saldo -= Number(l.valor);
              }
            }
          } else if (l.tipo === "Receita" && !l.metaId) {
            if (l.parcelado && l.parcelasLancamento?.length) {
              l.parcelasLancamento.forEach((p: any) => {
                const data = new Date(p.dataVencimento);
                if (data.getMonth() + 1 === filtroMes && data.getFullYear() === filtroAno) {
                  saldo += Number(p.valorParcela);
                }
              });
            } else {
              const data = new Date(l.data);
              if (data.getMonth() + 1 === filtroMes && data.getFullYear() === filtroAno) {
                saldo += Number(l.valor);
              }
            }
          }
        });
        return saldo;
      }
      return 0;
    }
    async function atualizarSaldosMes() {
      setLoadingSaldosMes(true);
      const novosSaldos: { [key: number]: number } = {};
      for (const conta of contas) {
        novosSaldos[conta.id] = await calcularSaldoMes(conta);
      }
      setSaldosMes(novosSaldos);
      setLoadingSaldosMes(false);
    }
    if (contas.length > 0) atualizarSaldosMes();
    else setLoadingSaldosMes(false);
  }, [contas, filtroMes, filtroAno]);

  useEffect(() => {
    async function fetchLancamentosTotais() {
      const token = localStorage.getItem("token");
      if (!token) return;
      const url = "/api/lancamentos";
      const res = await fetch(url, {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        setLancamentosTotais(data.lancamentos || []);
      }
    }
    fetchLancamentosTotais();
  }, []);

  const now = new Date();
  const saldosPorConta: { [id: number]: number } = {};
  contas.forEach((conta: any) => {
    saldosPorConta[conta.id] = 0;
  });
  (Array.isArray(lancamentosTotais) ? lancamentosTotais : []).forEach((l: any) => {
    if (l.contaId && saldosPorConta.hasOwnProperty(l.contaId)) {
      if (l.parcelado && l.parcelasLancamento?.length) {
        l.parcelasLancamento.forEach((p: any) => {
          const data = new Date(p.dataVencimento);
          if (data.getMonth() + 1 === filtroMes && data.getFullYear() === filtroAno) {
            if (l.tipo === "Receita") saldosPorConta[l.contaId] += Number(p.valorParcela);
            if (l.tipo === "Despesa") saldosPorConta[l.contaId] -= Number(p.valorParcela);
          }
        });
      } else {
        const data = new Date(l.data);
        if (data.getMonth() + 1 === filtroMes && data.getFullYear() === filtroAno) {
          if (l.tipo === "Receita") saldosPorConta[l.contaId] += Number(l.valor);
          if (l.tipo === "Despesa") saldosPorConta[l.contaId] -= Number(l.valor);
        }
      }
    }
  });
  const saldoGeral = Object.values(saldosPorConta).reduce((acc, v) => acc + v, 0);

  const despesasPorCategoria: { [cat: string]: number } = {};
  (Array.isArray(lancamentosTotais) ? lancamentosTotais : []).forEach((l: any) => {
    if (l.tipo === "Despesa" && l.categoria?.nome) {
      despesasPorCategoria[l.categoria.nome] = (despesasPorCategoria[l.categoria.nome] || 0) + Number(l.valor);
    }
  });
  const pieData = {
    labels: Object.keys(despesasPorCategoria),
    datasets: [
      {
        data: Object.values(despesasPorCategoria),
        backgroundColor: chartColors.pie,
        borderWidth: 1
      }
    ]
  };

  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const anoAtual = new Date().getFullYear();
  const saldoPorMes: number[] = Array(12).fill(0);
  (Array.isArray(lancamentosTotais) ? lancamentosTotais : []).forEach((l: any) => {
    const data = new Date(l.data);
    if (data.getFullYear() === anoAtual) {
      if (l.tipo === "Receita") saldoPorMes[data.getMonth()] += Number(l.valor);
      if (l.tipo === "Despesa") saldoPorMes[data.getMonth()] -= Number(l.valor);
    }
  });
  for (let i = 1; i < 12; i++) saldoPorMes[i] += saldoPorMes[i - 1];
  const lineData = {
    labels: meses,
    datasets: [
      {
        label: "Saldo Geral",
        data: saldoPorMes,
        borderColor: chartColors.line,
        backgroundColor: chartColors.lineBg,
        tension: 0.3,
        fill: true,
      }
    ]
  };

  // Função para garantir que createdAt seja convertido corretamente para Date
  const parseDate = (d: any) => {
    if (d instanceof Date) return d;
    if (typeof d === 'string' && d.length === 19 && d.indexOf('T') === -1) {
      return new Date(d.replace(' ', 'T') + 'Z');
    }
    return new Date(d);
  };

  // Mostrar apenas os 4 lançamentos do mês atual mais recentes, usando createdAt
  const lancRecentes = [...(Array.isArray(lancamentosTotais) ? lancamentosTotais : [])]
    .filter(l => {
      const data = new Date(l.data);
      return data.getMonth() + 1 === filtroMes && data.getFullYear() === filtroAno;
    })
    .sort((a, b) => parseDate(b.createdAt).getTime() - parseDate(a.createdAt).getTime())
    .slice(0, 4);

  const despesasMes = (Array.isArray(lancamentosTotais) ? lancamentosTotais : []).filter(l => {
    if (l.tipo !== "Despesa") return false;
    const data = new Date(l.data);
    return data.getMonth() === now.getMonth() && data.getFullYear() === now.getFullYear();
  });
  const totalDespesasMes = despesasMes.reduce((acc, l) => acc + Number(l.valor), 0);
  const salario = usuario?.salario || 0;
  const saldoRestanteSalario = salario - totalDespesasMes;

  const carregando = loadingContas || loadingLanc || loadingCat || loadingUsuario || loadingSaldosMes;

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      <SideBar />
      <main className={styles.mainContent}>
        {/* Barra de título e menu no mobile */}
        {isMobile ? (
          <div className={styles.mobileHeaderBar}>
            <button
              className="sidebar-hamburger"
              style={{ position: 'static', top: 'unset', left: 'unset', marginRight: 12, zIndex: 10000 }}
              onClick={() => setIsOpen(true)}
            >
              <span className="sidebar-hamburger-bar" />
              <span className="sidebar-hamburger-bar" />
              <span className="sidebar-hamburger-bar" />
            </button>
            <span className={styles.mobileTitle}>Dashboard</span>
          </div>
        ) : (
          <h1 className={styles.title}>Dashboard</h1>
        )}
        <div className={styles.totalGasto}>
          <div className={styles.totalGastoLabel}>Saldo Geral do Mês:</div>
          <div className={styles.totalGastoValor}>
            R$ {saldoGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        {carregando ? (
          <LoadingSpinner size={60} />
        ) : (
          <>
            {/* Cards principais */}
            <div className={styles.dashboardGrid}>
              <div className={styles.dashboardCard}>
                <div className={styles.dashboardCardTitle}>Saldo Restante do Salário (Mês)</div>
                <div className={styles.dashboardCardValue} style={{ color: saldoRestanteSalario < 0 ? '#FF5C5C' : 'var(--primary)' }}>
                  R$ {saldoRestanteSalario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              {contas.length === 0 ? (
                <div className={styles.dashboardCard} style={{ justifyContent: 'center', alignItems: 'center' }}>Nenhuma conta cadastrada.</div>
              ) : (
                contas.map((conta: any) => (
                  <div key={conta.id} className={styles.dashboardCard}>
                    <div className={styles.dashboardCardTitle}>{conta.nome}</div>
                    <div className={styles.dashboardCardValue}>R$ {saldosPorConta[conta.id] !== undefined ? Math.abs(Number(saldosPorConta[conta.id])).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</div>
                  </div>
                ))
              )}
            </div>
            {/* Gráficos */}
            <div className={styles.dashboardChartRow}>
              <div className={styles.dashboardChartCard}>
                <div className={styles.dashboardChartTitle}>Despesas por Categoria</div>
                {Object.keys(despesasPorCategoria).length === 0 ? (
                  <div style={{ color: 'var(--text-secondary)', fontSize: 18, marginTop: 20 }}>Nenhuma despesa cadastrada.</div>
                ) : (
                  showCharts && (
                    <Pie
                      key={theme + '-' + chartKey}
                      data={pieData}
                      options={pieOptions}
                      redraw={true}
                      style={{ width: '100%', maxWidth: 400, height: 'auto' }}
                    />
                  )
                )}
              </div>
              <div className={styles.dashboardChartCard}>
                <div className={styles.dashboardChartTitle}>Evolução do Saldo (Ano)</div>
                {lancamentos.length === 0 ? (
                  <div style={{ color: 'var(--text-secondary)', fontSize: 18, marginTop: 20 }}>Sem dados para exibir o gráfico.</div>
                ) : (
                  showCharts && (
                    <Line
                      key={theme + '-' + chartKey}
                      data={lineData}
                      options={lineOptions}
                      redraw={true}
                      style={{ width: '100%', maxWidth: 400, height: 'auto' }}
                    />
                  )
                )}
              </div>
            </div>
            {/* Lançamentos Recentes */}
            {isMobile ? (
              <>
                <div className={styles.mobileSectionTitle}>Lançamentos Recentes</div>
                <div className={styles.cardsMobileWrapper}>
                  {lancRecentes.length === 0 && (
                    <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 18 }}>Nenhum lançamento recente.</div>
                  )}
                  {lancRecentes.map((l: any) => (
                    <div className={styles.contaCardMobile} key={l.id}>
                      <div className={styles.contaNome} style={{ color: 'var(--primary)', fontWeight: 700 }}>{l.descricao}</div>
                      <div className={styles.contaTipo}>{contas.find(c => c.id === l.contaId)?.nome || '-'}</div>
                      <div className={styles.contaTipo}>{l.categoria?.nome || '-'}</div>
                      <div className={styles.contaSaldo} style={{ color: l.tipo === 'Despesa' ? '#FF5C5C' : 'var(--primary)', fontWeight: 700 }}>
                        R$ {l.tipo === 'Despesa' ? '-' : '+'}{Math.abs(Number(l.valor)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className={styles.contaTipo}>{l.data ? new Date(l.data).toLocaleDateString('pt-BR') : '-'}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className={styles.mobileSectionTitle}>Lançamentos Recentes</div>
                <table className={styles.recentTable}>
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th>Conta</th>
                      <th>Categoria</th>
                      <th>Valor</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lancRecentes.length === 0 && (
                      <tr><td colSpan={5} style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 18 }}>Nenhum lançamento recente.</td></tr>
                    )}
                    {lancRecentes.map((l: any) => (
                      <tr key={l.id}>
                        <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{l.descricao}</td>
                        <td>{contas.find(c => c.id === l.contaId)?.nome || '-'}</td>
                        <td>{l.categoria?.nome || '-'}</td>
                        <td style={{ color: l.tipo === 'Despesa' ? '#FF5C5C' : 'var(--primary)', fontWeight: 600 }}>
                          R$ {l.tipo === 'Despesa' ? '-' : '+'}{Math.abs(Number(l.valor)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td>{l.data ? new Date(l.data).toLocaleDateString('pt-BR') : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
} 
