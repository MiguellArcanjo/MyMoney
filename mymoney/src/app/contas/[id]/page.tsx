"use client"

import SideBar from "@/components/sidebar/SideBar";
import styles from "../page.module.css";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Modal from "@/components/Modal/Modal";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function DetalheConta() {
  const params = useParams();
  const contaId = params?.id;
  const [conta, setConta] = useState<any>(null);
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [modalParcelamento, setModalParcelamento] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [editDescricao, setEditDescricao] = useState("");
  const [editCategoria, setEditCategoria] = useState("");
  const [editTipo, setEditTipo] = useState("");
  const [editValor, setEditValor] = useState("");
  const [editDataLanc, setEditDataLanc] = useState("");
  const [parcelas, setParcelas] = useState<any[]>([]);
  const [parcelamentoInfo, setParcelamentoInfo] = useState<any>(null);
  const [modalAdd, setModalAdd] = useState(false);
  const [addDescricao, setAddDescricao] = useState("");
  const [addValor, setAddValor] = useState("");
  const [addTipo, setAddTipo] = useState("Despesa");
  const [addCategoria, setAddCategoria] = useState("");
  const [addData, setAddData] = useState("");
  const [addParcelado, setAddParcelado] = useState(false);
  const [addParcelas, setAddParcelas] = useState("");
  const [categorias, setCategorias] = useState<any[]>([]);
  const [parcelaLoading, setParcelaLoading] = useState<number | null>(null);
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1);
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear());
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [metas, setMetas] = useState<any[]>([]);
  const router = useRouter();
  const [loadingConta, setLoadingConta] = useState(true);
  const [loadingLancamentos, setLoadingLancamentos] = useState(true);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loadingMetas, setLoadingMetas] = useState(true);
  // Estados de paginação
  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 10;
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [lancamentosTotais, setLancamentosTotais] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  const carregando = loadingConta || loadingLancamentos || loadingCategorias || loadingMetas;

  useEffect(() => {
    async function fetchConta() {
      const token = localStorage.getItem("token");
      if (!token || !contaId) { setLoadingConta(false); return; }
      const res = await fetch(`/api/contas/${contaId}`, {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        setConta(data);
      }
      setLoadingConta(false);
    }
    async function fetchLancamentos() {
      const token = localStorage.getItem("token");
      if (!token || !contaId) { setLoadingLancamentos(false); return; }
      const res = await fetch(`/api/lancamentos?contaId=${contaId}&page=${pagina}&limit=${itensPorPagina}`, {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        setLancamentos(data.lancamentos || []);
        setTotalPaginas(Math.ceil((data.totalCount || 0) / itensPorPagina));
      }
      setLoadingLancamentos(false);
    }
    async function fetchCategorias() {
      const token = localStorage.getItem("token");
      if (!token) { setLoadingCategorias(false); return; }
      const res = await fetch("/api/categorias", {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        setCategorias(data);
      }
      setLoadingCategorias(false);
    }
    async function fetchMetas() {
      const token = localStorage.getItem("token");
      if (!token) { setLoadingMetas(false); return; }
      const res = await fetch("/api/metas", {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        setMetas(Array.isArray(data.metas) ? data.metas : []);
      }
      setLoadingMetas(false);
    }
    async function fetchLancamentosTotais() {
      const token = localStorage.getItem("token");
      if (!token || !contaId) return;
      const res = await fetch(`/api/lancamentos?contaId=${contaId}`, {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        setLancamentosTotais(data.lancamentos || []);
      }
    }
    fetchConta();
    fetchLancamentos();
    fetchCategorias();
    fetchMetas();
    fetchLancamentosTotais();
  }, [contaId, pagina, filtroMes, filtroAno]);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function openEditarModal(lancamento: any) {
    setEditData(lancamento);
    setEditDescricao(lancamento.descricao);
    setEditCategoria(lancamento.categoria?.nome || "");
    setEditTipo(lancamento.tipo);
    setEditValor(lancamento.valor);
    setEditDataLanc(lancamento.data ? lancamento.data.slice(0, 10) : "");
    setModalEditar(true);
  }

  async function handleEditarSubmit(e: any) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !editData) return;
    await fetch(`/api/lancamentos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({
        id: editData.id,
        descricao: editDescricao,
        tipo: editTipo,
        valor: Number(editValor),
        data: editDataLanc,
        categoriaId: editData.categoriaId
      })
    });
    setModalEditar(false);
    // Atualiza lançamentos
    const res = await fetch(`/api/lancamentos?contaId=${contaId}`, {
      headers: { Authorization: "Bearer " + token }
    });
    if (res.ok) {
      const data = await res.json();
      setLancamentos(data.lancamentos || []);
    }
  }

  async function openParcelamentoModal(lancamento: any) {
    setParcelamentoInfo(lancamento);
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch(`/api/lancamentos?contaId=${contaId}`, {
      headers: { Authorization: "Bearer " + token }
    });
    if (res.ok) {
      const data = await res.json();
      const lanc = (Array.isArray(data.lancamentos) ? data.lancamentos : []).find((l: any) => l.id === lancamento.id);
      setParcelas(lanc?.parcelasLancamento || []);
    }
    setModalParcelamento(true);
  }

  async function handleAddSubmit(e: any) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;
    await fetch("/api/lancamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({
        descricao: addDescricao,
        tipo: addTipo,
        valor: Number(addValor),
        data: addData,
        parcelado: addParcelado,
        parcelas: addParcelado ? Number(addParcelas) : null,
        contaId: contaId,
        categoriaId: addCategoria,
        metaId: addTipo === "Receita" && addMeta ? addMeta : undefined
      })
    });
    setModalAdd(false);
    setAddDescricao("");
    setAddValor("");
    setAddTipo("Despesa");
    setAddCategoria("");
    setAddData("");
    setAddParcelado(false);
    setAddParcelas("");
    // Atualiza lançamentos
    const res = await fetch(`/api/lancamentos?contaId=${contaId}`, {
      headers: { Authorization: "Bearer " + token }
    });
    if (res.ok) {
      const data = await res.json();
      setLancamentos(data.lancamentos || []);
    }
  }

  async function marcarParcelaComoPaga(parcelaId: number) {
    setParcelaLoading(parcelaId);
    const token = localStorage.getItem("token");
    await fetch(`/api/parcelas/${parcelaId}`, {
      method: "PATCH",
      headers: { Authorization: "Bearer " + token }
    });
    setParcelaLoading(null);
    // Atualiza as parcelas após o pagamento
    if (parcelamentoInfo) openParcelamentoModal(parcelamentoInfo);
  }

  // Lançamentos filtrados por mês/ano, categoria e tipo (filtros aplicados no frontend)
  const lancamentosFiltrados = (Array.isArray(lancamentos) ? lancamentos : [])
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

  // Calcular total gasto no mês (apenas despesas filtradas, usando todos os lançamentos da conta)
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

  const [addMeta, setAddMeta] = useState("");

  return (
    <div>
      <SideBar />
      <main className={styles.mainContent}>
        {/* Barra de título e menu no mobile */}
        {isMobile ? (
          <div className={styles.mobileHeaderBar}>
            <button className="sidebar-hamburger" onClick={() => document.querySelector('.sidebar-hamburger')?.dispatchEvent(new Event('click', { bubbles: true }))}>
              <span className="sidebar-hamburger-bar" />
              <span className="sidebar-hamburger-bar" />
              <span className="sidebar-hamburger-bar" />
            </button>
            <span className={styles.mobileTitle}>{conta ? `${conta.nome} - Detalhes` : "Detalhes da Conta"}</span>
          </div>
        ) : (
          <h1 className="title">{conta ? `${conta.nome} - Detalhes` : "Detalhes da Conta"}</h1>
        )}
        <div className={isMobile ? styles.mobileMainWrapper : undefined}>
          {/* Card de resumo alinhado à direita */}
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
              <button className={styles.addButton} onClick={() => setModalAdd(true)}>
                + Adicionar Lançamento
              </button>
              <div style={{ marginBottom: 18, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, background: 'none', borderRadius: 0, padding: 0, width: '100%', marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 6, background: '#10294A', borderRadius: 10, padding: '12px 16px', alignItems: 'center', width: 'fit-content', flexWrap: 'wrap' }}>
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
                </div>
                <div style={{ display: 'flex', gap: 6, background: '#10294A', borderRadius: 10, padding: '12px 16px', alignItems: 'center', width: 'fit-content', flexWrap: 'wrap' }}>
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
              <button className={styles.addButton} onClick={() => setModalAdd(true)}>
                + Adicionar Lançamento
              </button>
              <div className={styles.filtrosBar}>
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
            </>
          )}
          <div className={styles.card} style={{ marginTop: 24 }}>
            <h2 className={styles.tableTitle}>Lançamentos</h2>
            {carregando ? (
              <div className={styles.card} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180, height: '180px' }}>
                <LoadingSpinner size={48} inline />
              </div>
            ) : (
              <>
              <table className={styles.tableMetas}>
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Data</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lancamentosFiltrados.map((lancamento) => (
                    <tr key={lancamento.id}>
                      <td>{lancamento.descricao}</td>
                      <td>{lancamento.categoria?.nome || '-'}</td>
                      <td style={{ color: lancamento.tipo === 'Despesa' ? '#FF5C5C' : '#00D1B2' }}>{lancamento.tipo}</td>
                      <td style={{ color: lancamento.tipo === 'Despesa' ? '#FF5C5C' : '#00D1B2' }}>
                        R$ {Number(lancamento.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td>{lancamento.data ? new Date(lancamento.data).toLocaleDateString('pt-BR') : '-'}</td>
                      <td className={styles.actionCell}>
                        <button className={styles.actionBtn} onClick={() => openEditarModal(lancamento)}>Editar</button>
                        {lancamento.parcelado ? (
                          <button className={styles.actionBtn} onClick={() => openParcelamentoModal(lancamento)}>Parcelas</button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Cards responsivos para mobile */}
              {isMobile && (
                <div className={styles.cardsMobileWrapper}>
                  {lancamentosFiltrados.map((lancamento) => (
                    <div className={styles.contaCardMobile} key={lancamento.id}>
                      <div className={styles.contaNome}>{lancamento.descricao}</div>
                      <div className={styles.contaTipo}>{lancamento.categoria?.nome || '-'}</div>
                      <div className={styles.contaSaldo} style={{ color: lancamento.tipo === 'Despesa' ? '#FF5C5C' : '#00D1B2' }}>{lancamento.tipo}</div>
                      <div className={styles.contaSaldo} style={{ color: lancamento.tipo === 'Despesa' ? '#FF5C5C' : '#00D1B2' }}>
                        R$ {Number(lancamento.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className={styles.contaTipo}>{lancamento.data ? new Date(lancamento.data).toLocaleDateString('pt-BR') : '-'}</div>
                      <div className={styles.contaAcoes}>
                        <button onClick={() => openEditarModal(lancamento)}>Editar</button>
                        {lancamento.parcelado ? (
                          <button onClick={() => openParcelamentoModal(lancamento)}>Parcelas</button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Paginação */}
              {totalPaginas > 1 && (
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
        </div>
        {/* Modal de Parcelamento */}
        {modalParcelamento && parcelamentoInfo && (
          <div className={styles.parcelamentoModalOverlay}>
            <div className={styles.parcelamentoModal}>
              <button className={styles.parcelamentoModalClose} onClick={() => setModalParcelamento(false)}>&times;</button>
              <div className={styles.parcelamentoModalTitle}>Detalhes do Parcelamento</div>
              <div className={styles.parcelamentoInfo}>
                <span>Descrição: <strong>{parcelamentoInfo.descricao}</strong></span>
                <span>Valor total: <strong>R$ {Number(parcelamentoInfo.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                <span className="parcelas">Parcelas: <strong>{parcelamentoInfo.parcelasLancamento?.length || parcelamentoInfo.parcelas} de {parcelamentoInfo.parcelas}</strong></span>
                <span className="status">Status: <strong>{parcelas.filter(p => p.status === 'Pago').length} pagas, {parcelas.filter(p => p.status !== 'Pago').length} em aberto</strong></span>
              </div>
              {/* Tabela só no desktop */}
              {!isMobile && (
                <div className={styles.parcelamentoTableWrapper}>
                  <table className={styles.parcelamentoTable}>
                    <thead>
                      <tr>
                        <th>Parcela</th>
                        <th>Valor</th>
                        <th>Data</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parcelas.map((p, idx) => (
                        <tr key={idx}>
                          <td>{p.numeroParcela}/{parcelamentoInfo.parcelas}</td>
                          <td>R$ {Number(p.valorParcela).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td>{p.dataVencimento ? p.dataVencimento.slice(0, 10).split('-').reverse().join('/') : '-'}</td>
                          <td className={p.status === "Pago" ? styles.statusPago : styles.statusAberto}>
                            {p.status}
                            {p.status === "Em aberto" && (
                              <button
                                style={{ marginLeft: 15, color: "#00D1B2", background: "none", border: "none", cursor: "pointer", opacity: parcelaLoading === p.id ? 0.6 : 1 }}
                                onClick={() => marcarParcelaComoPaga(p.id)}
                                disabled={parcelaLoading === p.id}
                              >
                                {parcelaLoading === p.id ? "Marcando..." : "Marcar como pago"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <button className={styles.fecharBtn} onClick={() => setModalParcelamento(false)}>Fechar</button>
            </div>
          </div>
        )}
        {/* Modal de Edição */}
        {modalEditar && (
          <div className={styles.editarModalOverlay}>
            <div className={styles.editarModal}>
              <button className={styles.editarModalClose} onClick={() => setModalEditar(false)}>&times;</button>
              <div className={styles.editarModalTitle}>Editar Lançamento</div>
              <form className={styles.editarForm} onSubmit={handleEditarSubmit}>
                <label className={styles.editarLabel}>Descrição</label>
                <input
                  className={styles.editarInput}
                  type="text"
                  value={editDescricao}
                  onChange={e => setEditDescricao(e.target.value)}
                  required
                />
                <label className={styles.editarLabel}>Categoria</label>
                <input
                  className={styles.editarInput}
                  type="text"
                  value={editCategoria}
                  onChange={e => setEditCategoria(e.target.value)}
                  required
                  disabled
                />
                <label className={styles.editarLabel}>Tipo</label>
                <select
                  className={styles.editarSelect}
                  value={editTipo}
                  onChange={e => setEditTipo(e.target.value)}
                  required
                >
                  <option value="Despesa">Despesa</option>
                  <option value="Receita">Receita</option>
                </select>
                <label className={styles.editarLabel}>Valor</label>
                <input
                  className={styles.editarInput}
                  type="number"
                  value={editValor}
                  onChange={e => setEditValor(e.target.value)}
                  required
                />
                <label className={styles.editarLabel}>Data</label>
                <input
                  className={styles.editarInput}
                  type="date"
                  value={editDataLanc}
                  onChange={e => setEditDataLanc(e.target.value)}
                  required
                />
                <button className={styles.editarBtn} type="submit">Salvar Alterações</button>
              </form>
            </div>
          </div>
        )}
        <Modal open={modalAdd} onClose={() => setModalAdd(false)}>
            <h2 className={styles.modalTitle}>
              <span style={{marginRight: 8, color: "#00D1B2"}}>+</span>
              Adicionar Lançamento
            </h2>
            <form className={styles.formMeta} onSubmit={handleAddSubmit}>
              <div className={styles.inputGroup}>
                <label className={styles.labelMeta}>Descrição</label>
                <input
                  className={styles.inputMeta}
                  type="text"
                  placeholder="Ex: Supermercado"
                  value={addDescricao}
                  onChange={e => setAddDescricao(e.target.value)}
                  required
                />
              </div>
              <div className={styles.inputGroupRow}>
                <div className={styles.inputGroup} style={{flex: 1}}>
                  <label className={styles.labelMeta}>Valor</label>
                  <input
                    className={styles.inputMeta}
                    type="number"
                    placeholder="Ex: 150.00"
                    value={addValor}
                    onChange={e => setAddValor(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.inputGroup} style={{flex: 1}}>
                  <label className={styles.labelMeta}>Tipo</label>
                  <select
                    className={styles.inputMeta}
                    value={addTipo}
                    onChange={e => setAddTipo(e.target.value)}
                    required
                  >
                    <option value="Despesa">Despesa</option>
                    <option value="Receita">Receita</option>
                  </select>
                </div>
              </div>
              <div className={styles.inputGroupRow}>
                <div className={styles.inputGroup} style={{flex: 1}}>
                  <label className={styles.labelMeta}>Categoria</label>
                  <select
                    className={styles.inputMeta}
                    value={addCategoria}
                    onChange={e => setAddCategoria(e.target.value)}
                    required
                  >
                    <option value="">Selecione</option>
                    {categorias
                      .filter(cat => cat.tipo === addTipo)
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nome}</option>
                      ))}
                  </select>
                </div>
                <div className={styles.inputGroup} style={{flex: 1}}>
                  <label className={styles.labelMeta}>Data</label>
                  <input
                    className={styles.inputMeta}
                    type="date"
                    value={addData}
                    onChange={e => setAddData(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className={styles.inputGroupRow}>
                <div className={styles.inputGroup} style={{flex: 1}}>
                  <label className={styles.labelMeta}>Parcelado?</label>
                  <select
                    className={styles.inputMeta}
                    value={addParcelado ? "Sim" : "Não"}
                    onChange={e => setAddParcelado(e.target.value === "Sim")}
                  >
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                  </select>
                </div>
                {addParcelado && (
                  <div className={styles.inputGroup} style={{flex: 1}}>
                    <label className={styles.labelMeta}>Quantidade de parcelas</label>
                    <input
                      className={styles.inputMeta}
                      type="number"
                      min={2}
                      value={addParcelas}
                      onChange={e => setAddParcelas(e.target.value)}
                      required={addParcelado}
                    />
                  </div>
                )}
              </div>
              <div className={styles.inputGroupRow}>
                {addTipo === "Receita" && (
                  <div className={styles.inputGroup} style={{flex: 1}}>
                    <label className={styles.labelMeta}>É para alguma meta?</label>
                    <select
                      className={styles.inputMeta}
                      value={addMeta}
                      onChange={e => setAddMeta(e.target.value)}
                    >
                      <option value="">Nenhuma</option>
                      {metas.map((meta: any) => (
                        <option key={meta.id} value={meta.id}>{meta.descricao}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <button className={styles.buttonMeta} type="submit">Adicionar Lançamento</button>
            </form>
        </Modal>
        <button
          className={isMobile ? styles.voltarBtnMobile : styles.addButton}
          onClick={() => router.back()}
        >
          Voltar
        </button>
      </main>
    </div>
  );
} 