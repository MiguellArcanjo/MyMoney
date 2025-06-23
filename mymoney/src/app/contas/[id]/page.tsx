"use client"

import SideBar from "@/components/SideBar/sideBar";
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

  const carregando = !conta || categorias.length === 0 || lancamentos.length === 0;

  useEffect(() => {
    async function fetchConta() {
      const token = localStorage.getItem("token");
      if (!token || !contaId) return;
      const res = await fetch(`/api/contas/${contaId}`, {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        setConta(data);
      }
    }
    async function fetchLancamentos() {
      const token = localStorage.getItem("token");
      if (!token || !contaId) return;
      const res = await fetch(`/api/lancamentos?contaId=${contaId}`, {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        setLancamentos(data);
      }
    }
    async function fetchCategorias() {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/categorias", {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        setCategorias(data);
      }
    }
    async function fetchMetas() {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/metas", {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        setMetas(data);
      }
    }
    fetchConta();
    fetchLancamentos();
    fetchCategorias();
    fetchMetas();
  }, [contaId]);

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
      setLancamentos(data);
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
      const lanc = data.find((l: any) => l.id === lancamento.id);
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
      setLancamentos(data);
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

  // Lançamentos filtrados do mês/ano + categoria + tipo
  const lancamentosFiltrados = lancamentos
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

  // Calcular total gasto no mês (apenas despesas filtradas)
  const totalGastoMes = lancamentosFiltrados
    .filter(l => l.tipo === "Despesa")
    .reduce((acc, l) => acc + Number(l.valor), 0);

  const [addMeta, setAddMeta] = useState("");

  return (
    <div>
      <SideBar />
      <main className={styles.mainContent}>
        <h1 className="title">{conta ? `${conta.nome} - Detalhes` : "Detalhes da Conta"}</h1>
        <div style={{ display: 'flex', gap: 32, marginBottom: 24 }}>
          <div style={{ background: '#0E2A4C', borderRadius: 12, padding: 24, minWidth: 340, border: '2px dashed #3A4B6A', marginBottom: 8 }}>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Resumo da Conta</h2>
            <div style={{ color: '#A5B3C7', fontSize: 15, marginBottom: 6 }}>Total Gasto no Mês:</div>
            <div style={{ color: '#00D1B2', fontSize: 24, fontWeight: 700 }}>
              R$ {Math.abs(totalGastoMes).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
        <button className={styles.addButton} onClick={() => setModalAdd(true)}>+ Adicionar Lançamento</button>
        <div style={{ marginBottom: 18, display: 'flex', gap: 6, background: '#10294A', borderRadius: 10, padding: '12px 16px', alignItems: 'center', width: 'fit-content' }}>
          {/* Filtro Categoria */}
          <span style={{ color: '#A5B3C7', fontSize: 14, marginRight: 4 }}>Categoria:</span>
          <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} style={{ background: '#142B4D', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', marginRight: 12 }}>
            <option value="Todas">Todas</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.nome}>{cat.nome}</option>
            ))}
          </select>
          {/* Filtro Tipo */}
          <span style={{ color: '#A5B3C7', fontSize: 14, marginRight: 4 }}>Tipo:</span>
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} style={{ background: '#142B4D', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', marginRight: 12 }}>
            <option value="Todos">Todos</option>
            <option value="Despesa">Despesa</option>
            <option value="Receita">Receita</option>
          </select>
          {/* Filtro Mês */}
          <span style={{ color: '#A5B3C7', fontSize: 14, marginRight: 4 }}>Mês:</span>
          <select value={filtroMes} onChange={e => setFiltroMes(Number(e.target.value))} style={{ background: '#142B4D', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', marginRight: 12 }}>
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>{(i+1).toString().padStart(2, '0')}</option>
            ))}
          </select>
          <select value={filtroAno} onChange={e => setFiltroAno(Number(e.target.value))} style={{ background: '#142B4D', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px' }}>
            {[...Array(5)].map((_, i) => {
              const ano = new Date().getFullYear() - 2 + i;
              return <option key={ano} value={ano}>{ano}</option>
            })}
          </select>
        </div>
        <div className={styles.card} style={{ marginTop: 24 }}>
          <h2 className={styles.tableTitle}>Lançamentos</h2>
          {carregando ? (
            <div className={styles.card} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180, height: '180px' }}>
              <LoadingSpinner size={48} inline />
            </div>
          ) : (
            <table className={styles.tableMetas}>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Parcelado</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {lancamentosFiltrados.map((l, i) => (
                  <tr key={l.id + (l.idParcela ? `-p${l.idParcela}` : '')}>
                    <td>{l.descricao}</td>
                    <td>{l.categoria?.nome || "-"}</td>
                    <td>{l.tipo}</td>
                    <td style={{ color: l.tipo === 'Despesa' ? '#FF5C5C' : '#00D1B2' }}>
                      R$ {l.tipo === 'Despesa' ? '-' : '+'}{Math.abs(Number(l.valor)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>{l.parcelado ? (l.parcelaInfo || 'Sim') : 'Não'}</td>
                    <td>{l.data ? new Date(l.data).toLocaleDateString('pt-BR') : '-'}</td>
                    <td className={styles.actionCell}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => openEditarModal(l)}
                      >Editar</button>
                      {l.parcelado && l.idParcela && (
                        <button
                          className={styles.actionBtn}
                          onClick={() => openParcelamentoModal(l)}
                        >Detalhes</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
          <h2 className={styles.modalTitle}>Adicionar Lançamento</h2>
          <form className={styles.formMeta} onSubmit={handleAddSubmit}>
            <label className={styles.labelMeta}>Descrição</label>
            <input
              className={styles.inputMeta}
              type="text"
              placeholder="Ex: Supermercado"
              value={addDescricao}
              onChange={e => setAddDescricao(e.target.value)}
              required
            />
            <label className={styles.labelMeta}>Valor</label>
            <input
              className={styles.inputMeta}
              type="number"
              placeholder="Ex: 150.00"
              value={addValor}
              onChange={e => setAddValor(e.target.value)}
              required
            />
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
            <label className={styles.labelMeta}>Conta</label>
            <input
              className={styles.inputMeta}
              type="text"
              value={conta ? conta.nome : ""}
              disabled
            />
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
            <label className={styles.labelMeta}>Data</label>
            <input
              className={styles.inputMeta}
              type="date"
              value={addData}
              onChange={e => setAddData(e.target.value)}
              required
            />
            <label className={styles.labelMeta}>Parcelado?</label>
            <select
              className={styles.inputMeta}
              value={addParcelado ? "Sim" : "Não"}
              onChange={e => setAddParcelado(e.target.value === "Sim")}
            >
              <option value="Não">Não</option>
              <option value="Sim">Sim</option>
            </select>
            {addParcelado && (
              <>
                <label className={styles.labelMeta}>Quantidade de parcelas</label>
                <input
                  className={styles.inputMeta}
                  type="number"
                  min={2}
                  value={addParcelas}
                  onChange={e => setAddParcelas(e.target.value)}
                  required={addParcelado}
                />
              </>
            )}
            {addTipo === "Receita" && (
              <>
                <label className={styles.labelMeta}>Meta</label>
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
              </>
            )}
            <button className={styles.buttonMeta} type="submit">Adicionar Lançamento</button>
          </form>
        </Modal>
        <button
          style={{ marginTop: 32, background: '#00D1B2', color: '#081B33', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 600, cursor: 'pointer' }}
          onClick={() => router.push('/contas')}
        >
          Voltar
        </button>
      </main>
    </div>
  );
} 