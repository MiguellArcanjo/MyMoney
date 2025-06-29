"use client"

import SideBar from "@/components/SideBar/sideBar";
import styles from "../page.module.css";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Modal from "@/components/Modal/Modal";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSidebar } from "@/components/SideBar/SidebarContext";

export default function DetalheConta() {
  const params = useParams();
  const contaId = Number(params?.id);
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
  const [addMeta, setAddMeta] = useState("");
  const [addRecorrente, setAddRecorrente] = useState(false);
  const [addFrequencia, setAddFrequencia] = useState("mensal");
  const [addDataTermino, setAddDataTermino] = useState("");
  const [wizardStep, setWizardStep] = useState(1);
  const { setIsOpen } = useSidebar();

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
      console.log("contaId usado na busca:", contaId);
      const res = await fetch(`/api/lancamentos?contaId=${contaId}&page=${pagina}&limit=${itensPorPagina}&mes=${filtroMes}&ano=${filtroAno}`, {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Lançamentos recebidos da API:", data.lancamentos);
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
        metaId: addTipo === "Receita" && addMeta ? addMeta : undefined,
        recorrente: addRecorrente,
        frequencia: addRecorrente ? addFrequencia : undefined,
        dataTermino: addRecorrente && addDataTermino ? addDataTermino : undefined
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
    setAddMeta("");
    setAddRecorrente(false);
    setAddFrequencia("mensal");
    setAddDataTermino("");
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

  console.log("Lançamentos completos:", lancamentos);
  console.log("Datas dos lançamentos:", lancamentos.map(l => l.data));

  const getAnoMes = (data: any) => {
    if (!data) return '';
    if (typeof data === 'string') return data.slice(0, 7);
    if (data instanceof Date) return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
    return '';
  };
  const filtroAnoMes = `${filtroAno}-${String(filtroMes).padStart(2, '0')}`;

  const lancamentosFiltrados = (Array.isArray(lancamentos) ? lancamentos : [])
    .flatMap(l => {
      if (l.parcelado && l.parcelasLancamento?.length) {
        return l.parcelasLancamento
          .filter((p: any) => getAnoMes(p.dataVencimento) === filtroAnoMes)
          .map((p: any) => ({
            ...l,
            valor: p.valorParcela,
            data: p.dataVencimento,
            parcelaInfo: `${p.numeroParcela}/${l.parcelas}`,
            statusParcela: p.status,
            idParcela: p.id
          }));
      } else {
        if (getAnoMes(l.data) === filtroAnoMes) {
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
            <span className={styles.mobileTitle}>{conta ? `${conta.nome} - Detalhes` : "Detalhes da Conta"}</span>
          </div>
        ) : (
          <h1 className="title">{conta ? `${conta.nome} - Detalhes` : "Detalhes da Conta"}</h1>
        )}
        <div className={isMobile ? styles.mobileMainWrapper : undefined}>
          {/* Card de resumo centralizado e largo */}
          <div style={{ width: '100%', marginBottom: 32 }}>
            <div className={styles.totalGasto}>
              <div className={styles.totalGastoLabel}>Total Gasto no Mês:</div>
              <div className={styles.totalGastoValor}>
                R$ {valorAnimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          {/* Botão e filtros alinhados à direita no mobile */}
          {isMobile ? (
            <div className={styles.mobileActionButton}>
              <button className={styles.addButton} onClick={() => setModalAdd(true)}>
                + Adicionar Lançamento
              </button>
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
          {isMobile && (
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
          )}
          <div className={styles.card} style={{ marginTop: 24 }}>
            <h2 className={styles.tableTitle}>Lançamentos</h2>
            {carregando ? (
              <div className={styles.card} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180, height: '180px' }}>
                <LoadingSpinner size={48} inline />
              </div>
            ) : (
              <>
              {lancamentosFiltrados.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 24 }}>
                  Nenhum lançamento encontrado para este mês.
                </div>
              ) : (
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
              )}
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
          <div className={styles.modernFormHeader}>
            <h2 className={styles.modernFormTitle}>
              <span className={styles.modernFormIcon}>+</span>
              Novo Lançamento
            </h2>
            <p className={styles.modernFormSubtitle}>
              Adicione um novo lançamento à conta <strong>{conta?.nome}</strong>
            </p>
          </div>
          {/* Barra de progresso */}
          <div className={styles.progressBarWrapper}>
            <div className={styles.progressBarBg}>
              <div className={styles.progressBarFill} style={{ width: `${wizardStep * 25}%` }} />
            </div>
            <div className={styles.progressSteps}>
              <span className={wizardStep >= 1 ? styles.progressStepActive : styles.progressStep}>1</span>
              <span className={wizardStep >= 2 ? styles.progressStepActive : styles.progressStep}>2</span>
              <span className={wizardStep >= 3 ? styles.progressStepActive : styles.progressStep}>3</span>
              <span className={wizardStep >= 4 ? styles.progressStepActive : styles.progressStep}>4</span>
            </div>
          </div>
          <form className={styles.modernForm} onSubmit={handleAddSubmit}>
            {wizardStep === 1 && (
              <>
                <div className={styles.innerCard}>
                  <div className={styles.formField}>
                    <label className={styles.modernLabel}>Descrição</label>
                    <input
                      className={styles.modernInput}
                      type="text"
                      placeholder="Ex: Supermercado, Conta de luz, Salário"
                      value={addDescricao}
                      onChange={e => setAddDescricao(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className={styles.innerCard}>
                  <div className={styles.formRow}>
                    <div className={styles.formField}>
                      <label className={styles.modernLabel}>Valor</label>
                      <input
                        className={styles.modernInput}
                        type="number"
                        step="0.01"
                        placeholder="Ex: 150.00"
                        value={addValor}
                        onChange={e => setAddValor(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.formField}>
                      <label className={styles.modernLabel}>Tipo</label>
                      <select
                        className={styles.modernSelect}
                        value={addTipo}
                        onChange={e => setAddTipo(e.target.value)}
                        required
                      >
                        <option value="Despesa">Despesa</option>
                        <option value="Receita">Receita</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className={styles.formActions}>
                  <button type="button" className={styles.modernButtonPrimary} onClick={() => setWizardStep(2)} disabled={!addDescricao || !addValor || !addTipo}>
                    Próximo
                  </button>
                </div>
              </>
            )}
            {wizardStep === 2 && (
              <>
                <div className={styles.innerCard}>
                  <div className={styles.formRow}>
                    <div className={styles.formField}>
                      <label className={styles.modernLabel}>Categoria</label>
                      <select
                        className={styles.modernSelect}
                        value={addCategoria}
                        onChange={e => setAddCategoria(e.target.value)}
                        required
                      >
                        <option value="">Selecione uma categoria</option>
                        {categorias
                          .filter(cat => cat.tipo === addTipo)
                          .map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nome}</option>
                          ))}
                      </select>
                    </div>
                    <div className={styles.formField}>
                      <label className={styles.modernLabel}>Data</label>
                      <input
                        className={styles.modernInput}
                        type="date"
                        value={addData}
                        onChange={e => setAddData(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.formActions}>
                  <button type="button" className={styles.modernButtonSecondary} onClick={() => setWizardStep(1)}>
                    Voltar
                  </button>
                  <button type="button" className={styles.modernButtonPrimary} onClick={() => setWizardStep(3)} disabled={!addCategoria || !addData}>
                    Próximo
                  </button>
                </div>
              </>
            )}
            {wizardStep === 3 && (
              <>
                <div className={styles.innerCard + ' ' + styles.fixedCard}>
                  <div className={styles.formRow}>
                    <div className={styles.formField}>
                      <label className={styles.modernLabel}>Parcelado?</label>
                      <select
                        className={styles.modernSelect}
                        value={addParcelado ? "Sim" : "Não"}
                        onChange={e => setAddParcelado(e.target.value === "Sim")}
                      >
                        <option value="Não">Não</option>
                        <option value="Sim">Sim</option>
                      </select>
                    </div>
                    {addParcelado && (
                      <div className={styles.formField}>
                        <label className={styles.modernLabel}>Quantidade de parcelas</label>
                        <input
                          className={styles.modernInput}
                          type="number"
                          min={2}
                          max={24}
                          placeholder="Ex: 12"
                          value={addParcelas}
                          onChange={e => setAddParcelas(e.target.value)}
                          required={addParcelado}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.formActions}>
                  <button type="button" className={styles.modernButtonSecondary} onClick={() => setWizardStep(2)}>
                    Voltar
                  </button>
                  <button type="button" className={styles.modernButtonPrimary} onClick={() => setWizardStep(4)}>
                    Próximo
                  </button>
                </div>
              </>
            )}
            {wizardStep === 4 && (
              <>
                <div className={styles.innerCard + ' ' + styles.fixedCard}>
                  <div className={styles.recurrenceSection}>
                    <div className={styles.recurrenceHeader}>
                      <label className={styles.recurrenceToggle}>
                        <input
                          type="checkbox"
                          className={styles.recurrenceCheckbox}
                          checked={addRecorrente}
                          onChange={e => setAddRecorrente(e.target.checked)}
                        />
                        <span className={styles.recurrenceLabel}>Tornar lançamento recorrente</span>
                      </label>
                    </div>
                    {addRecorrente && (
                      <div className={styles.recurrenceFields}>
                        <div className={styles.formRow}>
                          <div className={styles.formField}>
                            <label className={styles.modernLabel}>Frequência da recorrência</label>
                            <select 
                              className={styles.modernSelect}
                              value={addFrequencia}
                              onChange={e => setAddFrequencia(e.target.value)}
                            >
                              <option value="mensal">Mensal</option>
                              <option value="quinzenal">Quinzenal</option>
                              <option value="semanal">Semanal</option>
                              <option value="anual">Anual</option>
                            </select>
                          </div>
                          <div className={styles.formField}>
                            <label className={styles.modernLabel}>Data de início da recorrência</label>
                            <input
                              className={styles.modernInput}
                              type="date"
                              value={addData}
                              onChange={e => setAddData(e.target.value)}
                            />
                          </div>
                          <div className={styles.formField}>
                            <label className={styles.modernLabel}>Data de término da recorrência (opcional)</label>
                            <input
                              className={styles.modernInput}
                              type="date"
                              value={addDataTermino}
                              onChange={e => setAddDataTermino(e.target.value)}
                              placeholder="Deixe em branco para recorrência indefinida"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {addTipo === "Receita" && (
                    <div className={styles.formField} style={{marginTop: 24}}>
                      <label className={styles.modernLabel}>É para alguma meta?</label>
                      <select
                        className={styles.modernSelect}
                        value={addMeta}
                        onChange={e => setAddMeta(e.target.value)}
                      >
                        <option value="">Nenhuma meta específica</option>
                        {metas.map((meta: any) => (
                          <option key={meta.id} value={meta.id}>{meta.descricao}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className={styles.formActions}>
                  <button type="button" className={styles.modernButtonSecondary} onClick={() => setWizardStep(3)}>
                    Voltar
                  </button>
                  <button type="submit" className={styles.modernButtonPrimary}>
                    Adicionar Lançamento
                  </button>
                </div>
              </>
            )}
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
