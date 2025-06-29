"use client";

import { useEffect, useState } from "react";
import SideBar from "@/components/SideBar/sideBar";
import styles from "./page.module.css";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Lancamentos() {
  const [contas, setContas] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [contaFiltro, setContaFiltro] = useState(0);
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1);
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear());
  const [loadingContas, setLoadingContas] = useState(true);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loadingLancamentos, setLoadingLancamentos] = useState(true);
  // Estados de paginação
  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 10;
  const [lancamentosTotais, setLancamentosTotais] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Buscar todos os lançamentos (sem paginação)
  useEffect(() => {
    async function fetchLancamentos() {
      const token = localStorage.getItem("token");
      if (!token) return setLoadingLancamentos(false);
      let url = `/api/lancamentos`;
      if (contaFiltro) url += `?contaId=${contaFiltro}`;
      const res = await fetch(url, {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        setLancamentos(data.lancamentos || []);
      }
      setLoadingLancamentos(false);
    }
    fetchLancamentos();
  }, [contaFiltro]);

  // Buscar todos os lançamentos (sem paginação) para o total
  useEffect(() => {
    async function fetchLancamentosTotais() {
      const token = localStorage.getItem("token");
      if (!token) return;
      let url = `/api/lancamentos`;
      if (contaFiltro) url += `?contaId=${contaFiltro}`;
      const res = await fetch(url, {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        setLancamentosTotais(data.lancamentos || []);
      }
    }
    fetchLancamentosTotais();
  }, [contaFiltro]);

  // Paginação e filtros no frontend
  const todosFiltrados = (Array.isArray(lancamentos) ? lancamentos : [])
    .flatMap(l => {
      if (l.parcelado && l.parcelasLancamento?.length) {
        return l.parcelasLancamento
          .filter((p: any) => {
            const data = new Date(p.dataVencimento);
            return data.getMonth() + 1 === filtroMes && data.getFullYear() === filtroAno;
          })
          .map((p: any) => ({
            ...l,
            valor: p.valorParcela,
            data: p.dataVencimento,
            parcelaInfo: `${p.numeroParcela}/${l.parcelas}`,
            statusParcela: p.status,
            idParcela: p.id
          }));
      } else {
        const data = new Date(l.data);
        if (data.getMonth() + 1 === filtroMes && data.getFullYear() === filtroAno) {
          return [{ ...l }];
        }
        return [];
      }
    })
    .filter(l =>
      (filtroCategoria === 'Todas' || l.categoria?.nome === filtroCategoria) &&
      (filtroTipo === 'Todos' || l.tipo === filtroTipo)
    );

  const startIdx = (pagina - 1) * itensPorPagina;
  const endIdx = startIdx + itensPorPagina;
  const lancamentosFiltrados = todosFiltrados.slice(startIdx, endIdx);
  const totalPaginas = Math.ceil(todosFiltrados.length / itensPorPagina);

  // Calcular total gasto no mês (apenas despesas filtradas, usando todos os lançamentos)
  const totalGastoMes = (Array.isArray(lancamentosTotais) ? lancamentosTotais : [])
    .flatMap(l => {
      if (l.parcelado && l.parcelasLancamento?.length) {
        return l.parcelasLancamento
          .filter((p: any) => {
            const data = new Date(p.dataVencimento);
            return data.getMonth() + 1 === filtroMes && data.getFullYear() === filtroAno;
          })
          .map((p: any) => ({
            ...l,
            valor: p.valorParcela,
            data: p.dataVencimento,
            parcelaInfo: `${p.numeroParcela}/${l.parcelas}`,
            statusParcela: p.status,
            idParcela: p.id
          }));
      } else {
        const data = new Date(l.data);
        if (data.getMonth() + 1 === filtroMes && data.getFullYear() === filtroAno) {
          return [{ ...l }];
        }
        return [];
      }
    })
    .filter(l =>
      (contaFiltro === 0 || l.contaId === contaFiltro) &&
      (filtroCategoria === 'Todas' || l.categoria?.nome === filtroCategoria) &&
      (filtroTipo === 'Todos' || l.tipo === filtroTipo) &&
      l.tipo === "Despesa"
    )
    .reduce((acc, l) => acc + Number(l.valor), 0);

  // Animação do saldo subindo
  const [valorAnimado, setValorAnimado] = useState(0);
  useEffect(() => {
    let start = valorAnimado;
    let end = Math.abs(totalGastoMes);
    if (start === end) return;
    const duration = 800;
    const startTime = performance.now();
    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = start + (end - start) * progress;
      setValorAnimado(Number(value.toFixed(2)));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalGastoMes]);

  // Buscar contas
  useEffect(() => {
    async function fetchContas() {
      const token = localStorage.getItem("token");
      if (!token) return setLoadingContas(false);
      const res = await fetch("/api/contas", {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) setContas(await res.json());
      setLoadingContas(false);
    }
    fetchContas();
  }, []);

  // Buscar categorias
  useEffect(() => {
    async function fetchCategorias() {
      const token = localStorage.getItem("token");
      if (!token) return setLoadingCategorias(false);
      const res = await fetch("/api/categorias", {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) setCategorias(await res.json());
      setLoadingCategorias(false);
    }
    fetchCategorias();
  }, []);

  const carregando = loadingContas || loadingCategorias || loadingLancamentos;

  // Adicionando console.log para depuração antes do return
  console.log('Contas:', contas);

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
            <span className={styles.mobileTitle}>Lançamentos</span>
          </div>
        ) : (
          <h1 className={styles.title}>Lançamentos</h1>
        )}
        <div className={isMobile ? styles.mobileMainWrapper : undefined}>
          <div className={styles.totalGasto}>
            <div className={styles.totalGastoLabel}>Total Gasto no Mês:</div>
            <div className={styles.totalGastoValor}>
              R$ {valorAnimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          {/* Filtros alinhados à direita no mobile */}
          {isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%' }}>
              <div className={styles.filtrosBar}>
                <div style={{ display: 'flex', gap: 6, background: 'var(--bg-card)', borderRadius: 10, padding: '12px 16px', alignItems: 'center', width: 'fit-content', flexWrap: 'wrap', border: '1px solid var(--border)' }}>
                  <span className={styles.filtrosLabel}>Conta:</span>
                  <select value={contaFiltro} onChange={e => { setContaFiltro(Number(e.target.value)); setPagina(1); }} className={styles.filtrosSelect}>
                    <option value={0}>Todas</option>
                    {(Array.isArray(contas) ? contas : []).map(conta => (
                      <option key={conta.id} value={conta.id}>{conta.nome}</option>
                    ))}
                  </select>
                  <span className={styles.filtrosLabel}>Categoria:</span>
                  <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className={styles.filtrosSelect}>
                    <option value="Todas">Todas</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 6, background: 'var(--bg-card)', borderRadius: 10, padding: '12px 16px', alignItems: 'center', width: 'fit-content', flexWrap: 'wrap', border: '1px solid var(--border)' }}>
                  <span className={styles.filtrosLabel}>Tipo:</span>
                  <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className={styles.filtrosSelect}>
                    <option value="Todos">Todos</option>
                    <option value="Despesa">Despesa</option>
                    <option value="Receita">Receita</option>
                  </select>
                  <span className={styles.filtrosLabel}>Mês:</span>
                  <select value={filtroMes} onChange={e => setFiltroMes(Number(e.target.value))} className={styles.filtrosSelect}>
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>{(i+1).toString().padStart(2, '0')}</option>
                    ))}
                  </select>
                  <span className={styles.filtrosLabel}>Ano:</span>
                  <select value={filtroAno} onChange={e => setFiltroAno(Number(e.target.value))} className={styles.filtrosSelect}>
                    {[...Array(5)].map((_, i) => {
                      const ano = new Date().getFullYear() - 2 + i;
                      return <option key={ano} value={ano}>{ano}</option>
                    })}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.filtrosBar}>
              <div style={{ display: 'flex', gap: 6, background: 'var(--bg-card)', borderRadius: 10, padding: '12px 16px', alignItems: 'center', width: 'fit-content', flexWrap: 'wrap', border: '1px solid var(--border)' }}>
                <span className={styles.filtrosLabel}>Conta:</span>
                <select value={contaFiltro} onChange={e => { setContaFiltro(Number(e.target.value)); setPagina(1); }} className={styles.filtrosSelect}>
                  <option value={0}>Todas</option>
                  {(Array.isArray(contas) ? contas : []).map(conta => (
                    <option key={conta.id} value={conta.id}>{conta.nome}</option>
                  ))}
                </select>
                <span className={styles.filtrosLabel}>Categoria:</span>
                <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className={styles.filtrosSelect}>
                  <option value="Todas">Todas</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                  ))}
                </select>
                <span className={styles.filtrosLabel}>Tipo:</span>
                <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className={styles.filtrosSelect}>
                  <option value="Todos">Todos</option>
                  <option value="Despesa">Despesa</option>
                  <option value="Receita">Receita</option>
                </select>
                <span className={styles.filtrosLabel}>Mês:</span>
                <select value={filtroMes} onChange={e => setFiltroMes(Number(e.target.value))} className={styles.filtrosSelect}>
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={i+1}>{(i+1).toString().padStart(2, '0')}</option>
                  ))}
                </select>
                <span className={styles.filtrosLabel}>Ano:</span>
                <select value={filtroAno} onChange={e => setFiltroAno(Number(e.target.value))} className={styles.filtrosSelect}>
                  {[...Array(5)].map((_, i) => {
                    const ano = new Date().getFullYear() - 2 + i;
                    return <option key={ano} value={ano}>{ano}</option>
                  })}
                </select>
              </div>
            </div>
          )}
          {carregando ? (
            <div className={styles.card} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180, height: '180px' }}>
              <LoadingSpinner size={48} inline />
            </div>
          ) : (
            <div className={styles.card}>
              <h2 className={styles.tableTitle}>Lançamentos</h2>
              {lancamentosFiltrados.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 24 }}>Nenhum lançamento encontrado.</div>
              ) : (
                <>
                  {!isMobile && (
                    <table className={styles.tableMetas}>
                      <thead>
                        <tr>
                          <th>Descrição</th>
                          <th>Conta</th>
                          <th>Categoria</th>
                          <th>Tipo</th>
                          <th>Valor</th>
                          <th>Parcelado</th>
                          <th>Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lancamentosFiltrados.map((l: any) => (
                          <tr key={l.id + (l.idParcela ? `-p${l.idParcela}` : '')}>
                            <td>{l.descricao}</td>
                            <td>{l.conta?.nome || '-'}</td>
                            <td>{l.categoria?.nome || '-'}</td>
                            <td style={{ color: l.tipo === 'Despesa' ? '#FF5C5C' : 'var(--primary)' }}>{l.tipo}</td>
                            <td style={{ color: l.tipo === 'Despesa' ? '#FF5C5C' : 'var(--primary)' }}>
                              R$ {l.tipo === 'Despesa' ? '-' : '+'}{Math.abs(Number(l.valor)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td>{l.parcelado ? (l.parcelaInfo || 'Sim') : 'Não'}</td>
                            <td>{l.data ? new Date(l.data).toLocaleDateString('pt-BR') : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {isMobile && (
                    <div className={styles.cardsMobileWrapper}>
                      {lancamentosFiltrados.map((l: any) => (
                        <div className={styles.contaCardMobile} key={l.id + (l.idParcela ? `-p${l.idParcela}` : '')}>
                          <div className={styles.contaNome} style={{ color: 'var(--primary)', fontWeight: 700 }}>{l.descricao}</div>
                          <div className={styles.contaTipo}>{l.conta?.nome || '-'}</div>
                          <div className={styles.contaTipo}>{l.categoria?.nome || '-'}</div>
                          <div className={styles.contaSaldo} style={{ color: l.tipo === 'Despesa' ? '#FF5C5C' : 'var(--primary)', fontWeight: 700 }}>{l.tipo}</div>
                          <div className={styles.contaSaldo} style={{ color: l.tipo === 'Despesa' ? '#FF5C5C' : 'var(--primary)' }}>
                            R$ {l.tipo === 'Despesa' ? '-' : '+'}{Math.abs(Number(l.valor)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <div className={styles.contaTipo}>{l.parcelado ? (l.parcelaInfo || 'Sim') : 'Não'}</div>
                          <div className={styles.contaTipo}>{l.data ? new Date(l.data).toLocaleDateString('pt-BR') : '-'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Paginação */}
                  {totalPaginas > 1 && lancamentosFiltrados.length > 0 && (
                    <div className={styles.pagination}>
                      <button
                        onClick={() => setPagina(p => Math.max(1, p - 1))}
                        disabled={pagina === 1}
                        className={`${styles.paginationButton} ${pagina === 1 ? '' : styles.active}`}
                      >Anterior</button>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 16, minWidth: 32, textAlign: 'center' }}>{pagina} / {totalPaginas}</span>
                      <button
                        onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                        disabled={pagina === totalPaginas}
                        className={`${styles.paginationButton} ${pagina === totalPaginas ? '' : styles.active}`}
                      >Próxima</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 
