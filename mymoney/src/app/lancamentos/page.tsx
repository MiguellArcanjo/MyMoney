"use client";

import { useEffect, useState } from "react";
import SideBar from "@/components/SideBar/sideBar";
import Modal from "@/components/Modal/Modal";
import styles from "../contas/page.module.css";
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
  const [modalOpen, setModalOpen] = useState(false);
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
          <div style={{ width: '100%', display: 'flex', justifyContent: isMobile ? 'flex-end' : 'flex-start', marginBottom: 24 }}>
            <div style={{ background: '#0E2A4C', borderRadius: 12, padding: 24, minWidth: 220, maxWidth: 420, width: '50%', border: '2px dashed #3A4B6A', marginBottom: 8 }}>
              <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Total Gasto no Mês:</h2>
              <div style={{ color: '#00D1B2', fontSize: 24, fontWeight: 700 }}>
                R$ {valorAnimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          {/* Botão e filtros alinhados à direita no mobile */}
          {isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%' }}>
              <button className={styles.addButton} onClick={() => setModalOpen(true)}>
                + Adicionar Lançamento
              </button>
              <div style={{ marginBottom: 18, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, background: 'none', borderRadius: 0, padding: 0, width: '100%', marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 6, background: '#10294A', borderRadius: 10, padding: '12px 16px', alignItems: 'center', width: 'fit-content', flexWrap: 'wrap' }}>
                  <span style={{ color: '#A5B3C7', fontSize: 14, marginRight: 4 }}>Conta:</span>
                  <select value={contaFiltro} onChange={e => { setContaFiltro(Number(e.target.value)); setPagina(1); }} style={{ background: '#142B4D', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', marginRight: 12 }}>
                    <option value={0}>Todas</option>
                    {(Array.isArray(contas) ? contas : []).map(conta => (
                      <option key={conta.id} value={conta.id}>{conta.nome}</option>
                    ))}
                  </select>
                  <span style={{ color: '#A5B3C7', fontSize: 14, marginRight: 4 }}>Categoria:</span>
                  <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} style={{ background: '#142B4D', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', marginRight: 12 }}>
                    <option value="Todas">Todas</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 6, background: '#10294A', borderRadius: 10, padding: '12px 16px', alignItems: 'center', width: 'fit-content', flexWrap: 'wrap' }}>
                  <span style={{ color: '#A5B3C7', fontSize: 14, marginRight: 4 }}>Tipo:</span>
                  <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} style={{ background: '#142B4D', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', marginRight: 12 }}>
                    <option value="Todos">Todos</option>
                    <option value="Despesa">Despesa</option>
                    <option value="Receita">Receita</option>
                  </select>
                  <span style={{ color: '#A5B3C7', fontSize: 14, marginRight: 4 }}>Mês:</span>
                  <select value={filtroMes} onChange={e => setFiltroMes(Number(e.target.value))} style={{ background: '#142B4D', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', marginRight: 12 }}>
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>{(i+1).toString().padStart(2, '0')}</option>
                    ))}
                  </select>
                  <span style={{ color: '#A5B3C7', fontSize: 14, marginRight: 4 }}>Ano:</span>
                  <select value={filtroAno} onChange={e => setFiltroAno(Number(e.target.value))} style={{ background: '#142B4D', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px' }}>
                    {[...Array(5)].map((_, i) => {
                      const ano = new Date().getFullYear() - 2 + i;
                      return <option key={ano} value={ano}>{ano}</option>
                    })}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <>
              <button className={styles.addButton} onClick={() => setModalOpen(true)}>+ Adicionar Lançamento</button>
              <div style={{ marginBottom: 18, display: 'flex', gap: 6, background: '#10294A', borderRadius: 10, padding: '12px 16px', alignItems: 'center', width: 'fit-content', flexWrap: 'wrap' }}>
                <span style={{ color: '#A5B3C7', fontSize: 14, marginRight: 4 }}>Conta:</span>
                <select value={contaFiltro} onChange={e => { setContaFiltro(Number(e.target.value)); setPagina(1); }} style={{ background: '#142B4D', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', marginRight: 12 }}>
                  <option value={0}>Todas</option>
                  {(Array.isArray(contas) ? contas : []).map(conta => (
                    <option key={conta.id} value={conta.id}>{conta.nome}</option>
                  ))}
                </select>
                <span style={{ color: '#A5B3C7', fontSize: 14, marginRight: 4 }}>Categoria:</span>
                <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} style={{ background: '#142B4D', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', marginRight: 12 }}>
                  <option value="Todas">Todas</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                  ))}
                </select>
                <span style={{ color: '#A5B3C7', fontSize: 14, marginRight: 4 }}>Tipo:</span>
                <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} style={{ background: '#142B4D', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', marginRight: 12 }}>
                  <option value="Todos">Todos</option>
                  <option value="Despesa">Despesa</option>
                  <option value="Receita">Receita</option>
                </select>
                <span style={{ color: '#A5B3C7', fontSize: 14, marginRight: 4 }}>Mês:</span>
                <select value={filtroMes} onChange={e => setFiltroMes(Number(e.target.value))} style={{ background: '#142B4D', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', marginRight: 12 }}>
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={i+1}>{(i+1).toString().padStart(2, '0')}</option>
                  ))}
                </select>
                <span style={{ color: '#A5B3C7', fontSize: 14, marginRight: 4 }}>Ano:</span>
                <select value={filtroAno} onChange={e => setFiltroAno(Number(e.target.value))} style={{ background: '#142B4D', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px' }}>
                  {[...Array(5)].map((_, i) => {
                    const ano = new Date().getFullYear() - 2 + i;
                    return <option key={ano} value={ano}>{ano}</option>
                  })}
                </select>
              </div>
            </>
          )}
          {carregando ? (
            <div className={styles.card} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180, height: '180px' }}>
              <LoadingSpinner size={48} inline />
            </div>
          ) : (
            <div className={styles.card} style={{ marginTop: 24, width: '86vw', marginBottom: 20}}>
              <h2 className={styles.tableTitle}>Lançamentos</h2>
              {lancamentosFiltrados.length === 0 ? (
                <div style={{ color: '#A5B3C7', textAlign: 'center', padding: 24 }}>Nenhum lançamento encontrado.</div>
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
                            <td style={{ color: l.tipo === 'Despesa' ? '#FF5C5C' : '#00D1B2' }}>{l.tipo}</td>
                            <td style={{ color: l.tipo === 'Despesa' ? '#FF5C5C' : '#00D1B2' }}>
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
                          <div className={styles.contaNome} style={{ color: '#00D1B2', fontWeight: 700 }}>{l.descricao}</div>
                          <div className={styles.contaTipo}>{l.conta?.nome || '-'}</div>
                          <div className={styles.contaTipo}>{l.categoria?.nome || '-'}</div>
                          <div className={styles.contaSaldo} style={{ color: l.tipo === 'Despesa' ? '#FF5C5C' : '#00D1B2', fontWeight: 700 }}>{l.tipo}</div>
                          <div className={styles.contaSaldo} style={{ color: l.tipo === 'Despesa' ? '#FF5C5C' : '#00D1B2' }}>
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
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 18, marginTop: 18 }}>
                      <button
                        onClick={() => setPagina(p => Math.max(1, p - 1))}
                        disabled={pagina === 1}
                        style={{
                          background: pagina === 1 ? '#223B5A' : '#00D1B2',
                          color: pagina === 1 ? '#A5B3C7' : '#081B33',
                          border: 'none',
                          borderRadius: 8,
                          padding: '8px 18px',
                          fontWeight: 600,
                          fontSize: 16,
                          cursor: pagina === 1 ? 'not-allowed' : 'pointer',
                          transition: 'background 0.2s',
                        }}
                      >Anterior</button>
                      <span style={{ color: '#A5B3C7', fontWeight: 600, fontSize: 16, minWidth: 32, textAlign: 'center' }}>{pagina} / {totalPaginas}</span>
                      <button
                        onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                        disabled={pagina === totalPaginas}
                        style={{
                          background: pagina === totalPaginas ? '#223B5A' : '#00D1B2',
                          color: pagina === totalPaginas ? '#A5B3C7' : '#081B33',
                          border: 'none',
                          borderRadius: 8,
                          padding: '8px 18px',
                          fontWeight: 600,
                          fontSize: 16,
                          cursor: pagina === totalPaginas ? 'not-allowed' : 'pointer',
                          transition: 'background 0.2s',
                        }}
                      >Próxima</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
            <div className={styles.modalTitle}>Adicionar Lançamento (em breve)</div>
            {/* Aqui entrará o formulário de cadastro/edição */}
          </Modal>
        </div>
      </main>
    </div>
  );
} 
