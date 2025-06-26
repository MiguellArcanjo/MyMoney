"use client"

import { useState, useEffect } from "react";
import SideBar from "@/components/SideBar/sideBar";
import Modal from "@/components/Modal/Modal";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Contas() {
  const [contas, setContas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("Cartão de Crédito");
  const [saldo, setSaldo] = useState("");
  const [editConta, setEditConta] = useState<any>(null);
  const [deleteConta, setDeleteConta] = useState<any>(null);
  const router = useRouter();
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1);
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear());
  const [loadingContas, setLoadingContas] = useState(true);
  // Paginação para contas
  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 10;
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [contasPaginadas, setContasPaginadas] = useState<any[]>([]);
  // Estado para armazenar saldos
  const [saldos, setSaldos] = useState<{ [key: number]: number }>({});
  // Estado para armazenar saldos filtrados
  const [saldosMes, setSaldosMes] = useState<{ [key: number]: number }>({});
  // Estado para armazenar saldos animados
  const [valoresAnimados, setValoresAnimados] = useState<{ [key: number]: number }>({});
  const [isMobile, setIsMobile] = useState(false);

  // Função para calcular saldo da conta
  async function calcularSaldo(conta: any) {
    const token = localStorage.getItem("token");
    if (!token) return 0;
    const res = await fetch(`/api/lancamentos?contaId=${conta.id}`, {
      headers: { Authorization: "Bearer " + token }
    });
    if (res.ok) {
      const data = await res.json();
      const lancamentos = data.lancamentos || [];
      let saldo = 0;
      (Array.isArray(lancamentos) ? lancamentos : []).forEach((l: any) => {
        if (l.tipo === "Receita") saldo += Number(l.valor);
        if (l.tipo === "Despesa") saldo -= Number(l.valor);
      });
      return saldo;
    }
    return 0;
  }

  // Função para calcular saldo de despesas do mês/ano filtrado (considerando parcelas)
  async function calcularSaldoMes(conta: any) {
    const token = localStorage.getItem("token");
    if (!token) return 0;
    const res = await fetch(`/api/lancamentos?contaId=${conta.id}`, {
      headers: { Authorization: "Bearer " + token }
    });
    if (res.ok) {
      const data = await res.json();
      const lancamentos = data.lancamentos || [];
      let saldo = 0;
      (Array.isArray(lancamentos) ? lancamentos : []).forEach((l: any) => {
        if (l.tipo === "Despesa") {
          if (l.parcelado && l.parcelasLancamento?.length) {
            (Array.isArray(l.parcelasLancamento) ? l.parcelasLancamento : []).forEach((p: any) => {
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

  useEffect(() => {
    async function atualizarSaldos() {
      const novosSaldos: { [key: number]: number } = {};
      for (const conta of contas) {
        novosSaldos[conta.id] = await calcularSaldo(conta);
      }
      setSaldos(novosSaldos);
    }
    if (contas.length > 0) atualizarSaldos();
  }, [contas]);

  useEffect(() => {
    async function atualizarSaldosMes() {
      const novosSaldos: { [key: number]: number } = {};
      for (const conta of contas) {
        novosSaldos[conta.id] = await calcularSaldoMes(conta);
      }
      setSaldosMes(novosSaldos);
    }
    if (contas.length > 0) atualizarSaldosMes();
  }, [contas, filtroMes, filtroAno]);

  useEffect(() => {
    async function fetchContas() {
      const token = localStorage.getItem("token");
      if (!token) return setLoadingContas(false);
      const res = await fetch(`/api/contas?page=${pagina}&limit=${itensPorPagina}`, {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        setContas(data.contas || []);
        setContasPaginadas(data.contas);
        setTotalPaginas(Math.ceil(data.totalCount / itensPorPagina));
      }
      setLoadingContas(false);
    }
    fetchContas();
  }, [pagina, itensPorPagina]);

  useEffect(() => {
    const novosValores: { [key: number]: number } = { ...valoresAnimados };
    Object.keys(saldosMes).forEach((id) => {
      const contaId = Number(id);
      const start = valoresAnimados[contaId] || 0;
      const end = Math.abs(saldosMes[contaId] || 0);
      if (start === end) return;
      const duration = 800;
      const startTime = performance.now();
      function animate(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = start + (end - start) * progress;
        novosValores[contaId] = Number(value.toFixed(2));
        setValoresAnimados({ ...novosValores });
        if (progress < 1) requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saldosMes]);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch("/api/contas", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ nome, tipo })
    });
    if (res.ok) {
      setModalOpen(false);
      setNome("");
      setTipo("Cartão de Crédito");
      // Atualiza lista
      const contasRes = await fetch(`/api/contas?page=${pagina}&limit=${itensPorPagina}`, { headers: { Authorization: "Bearer " + token } });
      if (contasRes.ok) {
        const data = await contasRes.json();
        setContas(data.contas || []);
        setContasPaginadas(data.contas);
        setTotalPaginas(Math.ceil(data.totalCount / itensPorPagina));
      }
    }
  }

  function openEditModal(conta: any) {
    setEditConta(conta);
    setNome(conta.nome);
    setTipo(conta.tipo);
    setModalEdit(true);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !editConta) return;
    const res = await fetch("/api/contas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ id: editConta.id, nome, tipo })
    });
    if (res.ok) {
      setModalEdit(false);
      setNome("");
      setTipo("Cartão de Crédito");
      setEditConta(null);
      // Atualiza lista
      const contasRes = await fetch(`/api/contas?page=${pagina}&limit=${itensPorPagina}`, { headers: { Authorization: "Bearer " + token } });
      if (contasRes.ok) {
        const data = await contasRes.json();
        setContas(data.contas || []);
        setContasPaginadas(data.contas);
        setTotalPaginas(Math.ceil(data.totalCount / itensPorPagina));
      }
    }
  }

  function openDeleteModal(conta: any) {
    setDeleteConta(conta);
    setModalDelete(true);
  }

  async function handleDelete() {
    const token = localStorage.getItem("token");
    if (!token || !deleteConta) return;
    await fetch(`/api/contas?id=${deleteConta.id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    });
    setModalDelete(false);
    setDeleteConta(null);
    // Atualiza lista
    const contasRes = await fetch(`/api/contas?page=${pagina}&limit=${itensPorPagina}`, { headers: { Authorization: "Bearer " + token } });
    if (contasRes.ok) {
      const data = await contasRes.json();
      setContas(data.contas || []);
      setContasPaginadas(data.contas);
      setTotalPaginas(Math.ceil(data.totalCount / itensPorPagina));
    }
  }

  return (
    <div>
      <SideBar />
      <main className={styles.mainContent}>
        {/* Header responsivo com menu e título na mesma linha no mobile */}
        {isMobile ? (
          <div className={styles.mobileHeaderBar}>
            <span className={styles.mobileTitle}>Minhas Contas</span>
          </div>
        ) : (
          <h1 className="title">Minhas Contas</h1>
        )}
        {/* Botão e filtros alinhados à direita no mobile */}
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%' }}>
            <button className={styles.addButton} onClick={() => setModalOpen(true)}>
              + Adicionar Conta
            </button>
            <div style={{ marginBottom: 18, display: 'flex', gap: 6, background: '#10294A', borderRadius: 10, padding: '12px 16px', alignItems: 'center', width: 'fit-content', marginTop: 8 }}>
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
          </div>
        ) : (
          <>
            <button className={styles.addButton} onClick={() => setModalOpen(true)}>
              + Adicionar Conta
            </button>
            <div style={{ marginBottom: 18, display: 'flex', gap: 6, background: '#10294A', borderRadius: 10, padding: '12px 16px', alignItems: 'center', width: 'fit-content' }}>
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
          </>
        )}
        {loadingContas ? (
          <div className={styles.card} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180, height: '180px' }}>
            <LoadingSpinner size={48} inline />
          </div>
        ) : (
          <div className={styles.card}>
            <h2 className={styles.tableTitle}>Lista de Contas</h2>
            {contas.length === 0 ? (
              <div style={{ color: '#A5B3C7', textAlign: 'center', padding: 24 }}>Nenhuma conta cadastrada.</div>
            ) : (
              <>
                <table className={styles.tableMetas}>
                  <thead>
                    <tr>
                      <th>Nome da Conta</th>
                      <th>Tipo</th>
                      <th>Saldo</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contasPaginadas.map((conta) => (
                      <tr key={conta.id}>
                        <td style={{ cursor: "pointer", color: "#00D1B2" }} onClick={() => router.push(`/contas/${conta.id}`)}>{conta.nome}</td>
                        <td>{conta.tipo || '-'}</td>
                        <td>R$ {valoresAnimados[conta.id] !== undefined ? valoresAnimados[conta.id].toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</td>
                        <td className={styles.actionCell}>
                          <button className={styles.actionBtn} onClick={() => openEditModal(conta)}>Editar</button>
                          <button className={styles.actionBtn} onClick={() => openDeleteModal(conta)}>Excluir</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Cards responsivos para mobile */}
                {isMobile && (
                  <div className={styles.cardsMobileWrapper}>
                    {contasPaginadas.map((conta) => (
                      <div className={styles.contaCardMobile} key={conta.id}>
                        <div className={styles.contaNome} onClick={() => router.push(`/contas/${conta.id}`)}>{conta.nome}</div>
                        <div className={styles.contaTipo}>{conta.tipo || '-'}</div>
                        <div className={styles.contaSaldo}>R$ {valoresAnimados[conta.id] !== undefined ? valoresAnimados[conta.id].toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</div>
                        <div className={styles.contaAcoes}>
                          <button onClick={() => openEditModal(conta)}>Editar</button>
                          <button onClick={() => openDeleteModal(conta)}>Excluir</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Paginação */}
                {totalPaginas > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, marginTop: 18 }}>
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
          <h2 className={styles.modalTitle}>Adicionar Conta</h2>
          <form className={styles.formMeta} onSubmit={handleSubmit}>
            <label className={styles.labelMeta}>Nome da Conta</label>
            <input
              className={styles.inputMeta}
              type="text"
              placeholder="Ex: Mercado, Nubank, PicPay"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
            />
            <label className={styles.labelMeta}>Tipo</label>
            <select
              className={styles.inputMeta}
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              required
            >
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Carteira Digital">Carteira Digital</option>
              <option value="Espécie">Espécie</option>
              <option value="Conta Corrente">Conta Corrente</option>
              <option value="Conta Poupança">Conta Poupança</option>
              <option value="Outro">Outro</option>
            </select>
            <button className={styles.buttonMeta} type="submit">Adicionar Conta</button>
          </form>
        </Modal>
        <Modal open={modalEdit} onClose={() => setModalEdit(false)}>
          <h2 className={styles.modalTitle}>Editar Conta</h2>
          <form className={styles.formMeta} onSubmit={handleEditSubmit}>
            <label className={styles.labelMeta}>Nome da Conta</label>
            <input
              className={styles.inputMeta}
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
            />
            <label className={styles.labelMeta}>Tipo</label>
            <select
              className={styles.inputMeta}
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              required
            >
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Carteira Digital">Carteira Digital</option>
              <option value="Espécie">Espécie</option>
              <option value="Conta Corrente">Conta Corrente</option>
              <option value="Conta Poupança">Conta Poupança</option>
              <option value="Outro">Outro</option>
            </select>
            <button className={styles.buttonMeta} type="submit">Salvar Alterações</button>
          </form>
        </Modal>
        <Modal open={modalDelete} onClose={() => setModalDelete(false)}>
          <h2 className={styles.modalTitle}>Confirmar Exclusão</h2>
          <p style={{ color: '#A5B3C7', marginBottom: 24 }}>Tem certeza que deseja excluir esta conta?</p>
          <div style={{ display: 'flex', gap: 16 }}>
            <button className={styles.buttonMeta} style={{ background: '#00D1B2', color: '#081B33' }} onClick={handleDelete}>
              Confirmar
            </button>
            <button className={styles.buttonMeta} style={{ background: '#223B5A', color: '#fff' }} onClick={() => setModalDelete(false)}>
              Cancelar
            </button>
          </div>
        </Modal>
      </main>
    </div>
  );
}
