"use client"

import { useEffect, useState } from "react";
import SideBar from "@/components/SideBar/SideBar";
import Modal from "@/components/Modal/Modal";
import styles from "./page.module.css";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Metas() {
  const [metas, setMetas] = useState<any[]>([]);
  const [loadingMetas, setLoadingMetas] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [detalheMeta, setDetalheMeta] = useState<any | null>(null);
  const [receitasPorMeta, setReceitasPorMeta] = useState<{ [metaId: number]: number }>({});
  const carregando = metas.length === 0;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    async function fetchMetas() {
      const token = localStorage.getItem("token");
      if (!token) return setLoadingMetas(false);
      const res = await fetch("/api/metas", {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        setMetas(Array.isArray(data) ? data : (Array.isArray(data.metas) ? data.metas : []));
      }
      setLoadingMetas(false);
    }
    fetchMetas();
  }, []);

  useEffect(() => {
    async function fetchReceitasPorMeta() {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/lancamentos", {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) {
        const data = await res.json();
        const receitas: { [metaId: number]: number } = {};
        let lancs = Array.isArray(data) ? data : (Array.isArray(data.lancamentos) ? data.lancamentos : []);
        lancs.forEach((l: any) => {
          if (l.tipo === "Receita" && l.metaId) {
            receitas[l.metaId] = (receitas[l.metaId] || 0) + Number(l.valor);
          }
        });
        setReceitasPorMeta(receitas);
      }
    }
    fetchReceitasPorMeta();
  }, []);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function openAddModal() {
    setEditId(null);
    setDescricao("");
    setValor("");
    setDataInicio("");
    setDataFim("");
    setModalOpen(true);
  }

  function openEditModal(meta: any) {
    setEditId(meta.id);
    setDescricao(meta.descricao);
    setValor(meta.valorObjetivo);
    setDataInicio(meta.dataInicio ? meta.dataInicio.slice(0, 10) : "");
    setDataFim(meta.dataFim ? meta.dataFim.slice(0, 10) : "");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;
    if (editId) {
      // Editar meta
      const res = await fetch(`/api/metas/${editId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          descricao,
          valorObjetivo: valor,
          dataInicio,
          dataFim,
        }),
      });
      if (res.ok) {
        setMetas(metas.map(meta => meta.id === editId ? { ...meta, descricao, valorObjetivo: valor, dataInicio, dataFim } : meta));
        setModalOpen(false);
      }
    } else {
      // Adicionar meta
      const res = await fetch("/api/metas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          descricao,
          valorObjetivo: valor,
          dataInicio,
          dataFim,
        }),
      });
      if (res.ok) {
        const novaMeta = await res.json();
        setMetas([novaMeta, ...metas]);
        setModalOpen(false);
        setDescricao("");
        setValor("");
        setDataInicio("");
        setDataFim("");
      }
    }
  }

  function openDeleteModal(id: number) {
    setDeleteId(id);
    setConfirmDeleteOpen(true);
  }

  async function handleDelete() {
    if (!deleteId) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch(`/api/metas/${deleteId}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    });
    if (res.ok) {
      setMetas(metas.filter(meta => meta.id !== deleteId));
    }
    setConfirmDeleteOpen(false);
    setDeleteId(null);
  }

  function formatPeriodo(meta: any) {
    if (!meta.dataInicio || !meta.dataFim) return "";
    const inicio = new Date(meta.dataInicio);
    const fim = new Date(meta.dataFim);
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${meses[inicio.getMonth()]} ${inicio.getFullYear()} - ${meses[fim.getMonth()]} ${fim.getFullYear()}`;
  }

  function openDetalheModal(meta: any) {
    setDetalheMeta(meta);
  }

  return (
    <div>
      <SideBar />
      <main className={styles.mainContent}>
        {/* Barra de título e menu no mobile */}
        {isMobile ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: 18 }}>
            <span className={styles.mobileTitle} style={{ textAlign: 'right', width: '100%', marginBottom: 8 }}>Metas de Economia</span>
            <button className={styles.addButton} onClick={openAddModal}>
              + Adicionar Meta
            </button>
          </div>
        ) : (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: 18 }}>
            <h1 className={styles.title} style={{ textAlign: 'left', width: '100%', marginBottom: 8 }}>Metas de Economia</h1>
            <button className={styles.addButton} onClick={openAddModal}>
              + Adicionar Meta
            </button>
          </div>
        )}
        <div className={isMobile ? styles.mobileMainWrapper : undefined}>
          <div className={styles.card}>
            <h2 className={styles.tableTitle}>Lista de Metas</h2>
            {loadingMetas ? (
              <div className={styles.card} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180, height: '180px' }}>
                <LoadingSpinner size={48} inline />
              </div>
            ) : (
              <>
                {!isMobile && (
                  <table className={styles.tableMetas}>
                    <thead>
                      <tr>
                        <th>Descrição</th>
                        <th>Valor Objetivo</th>
                        <th>Período</th>
                        <th>Progresso</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metas.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ color: '#A5B3C7', textAlign: 'center', padding: 24 }}>Nenhuma meta cadastrada.</td>
                        </tr>
                      ) : (
                        metas.map(meta => (
                          <tr key={meta.id}>
                            <td>
                              <span
                                style={{ color: '#00D1B2', cursor: 'pointer', textDecoration: 'underline' }}
                                onClick={() => openDetalheModal(meta)}
                              >
                                {meta.descricao}
                              </span>
                            </td>
                            <td>R$ {Number(meta.valorObjetivo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            <td>{formatPeriodo(meta)}</td>
                            <td>
                              <div className={styles.progressBar}>
                                <div
                                  className={styles.progressFill}
                                  style={{ width: `${Math.min(100, (receitasPorMeta[meta.id] || 0) / meta.valorObjetivo * 100)}%` }}
                                />
                              </div>
                              <span className={styles.progressText}>
                                {Math.min(100, ((receitasPorMeta[meta.id] || 0) / meta.valorObjetivo * 100)).toFixed(1)}%&nbsp;
                                (R$ {(receitasPorMeta[meta.id] || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                              </span>
                            </td>
                            <td>{meta.status || (new Date(meta.dataFim) < new Date() ? "Concluída" : "Em andamento")}</td>
                            <td className={styles.actionCell}>
                              <button className={styles.actionBtn} onClick={() => openEditModal(meta)}>Editar</button>
                              <button className={styles.actionBtn} onClick={() => openDeleteModal(meta.id)}>Excluir</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
                {isMobile && (
                  <div className={styles.cardsMobileWrapper}>
                    {metas.length === 0 ? (
                      <div style={{ color: '#A5B3C7', textAlign: 'center', padding: 24 }}>Nenhuma meta cadastrada.</div>
                    ) : (
                      metas.map(meta => (
                        <div className={styles.contaCardMobile} key={meta.id}>
                          <div className={styles.contaNome} style={{ color: '#00D1B2', fontWeight: 700 }}>{meta.descricao}</div>
                          <div className={styles.contaTipo}>R$ {Number(meta.valorObjetivo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                          <div className={styles.contaTipo}>{formatPeriodo(meta)}</div>
                          <div className={styles.progressBar} style={{ width: '100%', margin: '8px 0 4px 0' }}>
                            <div
                              className={styles.progressFill}
                              style={{ width: `${Math.min(100, (receitasPorMeta[meta.id] || 0) / meta.valorObjetivo * 100)}%` }}
                            />
                          </div>
                          <span className={styles.progressText}>
                            {Math.min(100, ((receitasPorMeta[meta.id] || 0) / meta.valorObjetivo * 100)).toFixed(1)}%&nbsp;
                            (R$ {(receitasPorMeta[meta.id] || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                          </span>
                          <div className={styles.contaTipo} style={{ marginTop: 4 }}>{meta.status || (new Date(meta.dataFim) < new Date() ? "Concluída" : "Em andamento")}</div>
                          <div className={styles.contaAcoes}>
                            <button onClick={() => openEditModal(meta)}>Editar</button>
                            <button onClick={() => openDeleteModal(meta.id)}>Excluir</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <h2 className={styles.modalTitle}>{editId ? "Editar Meta" : "Adicionar Nova Meta"}</h2>
          <form className={styles.formMeta} onSubmit={handleSubmit}>
            <label className={styles.labelMeta}>Descrição da Meta</label>
            <input
              className={styles.inputMeta}
              type="text"
              placeholder="Ex: Viagem, Reserva, Notebook"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              required
            />
            <label className={styles.labelMeta}>Valor Objetivo</label>
            <input
              className={styles.inputMeta}
              type="number"
              placeholder="Ex: 5000"
              value={valor}
              onChange={e => setValor(e.target.value)}
              required
            />
            <label className={styles.labelMeta}>Data de Início</label>
            <input
              className={styles.inputMeta}
              type="date"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
              required
            />
            <label className={styles.labelMeta}>Data de Fim</label>
            <input
              className={styles.inputMeta}
              type="date"
              value={dataFim}
              onChange={e => setDataFim(e.target.value)}
              required
            />
            <button className={styles.buttonMeta} type="submit">{editId ? "Salvar Alterações" : "Adicionar Meta"}</button>
          </form>
        </Modal>
        <Modal open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
          <h2 className={styles.modalTitle}>Confirmar Exclusão</h2>
          <p style={{ color: '#A5B3C7', marginBottom: 24 }}>Tem certeza que deseja excluir esta meta?</p>
          <div style={{ display: 'flex', gap: 16 }}>
            <button className={styles.buttonMeta} style={{ background: '#00D1B2', color: '#081B33' }} onClick={handleDelete}>
              Confirmar
            </button>
            <button className={styles.buttonMeta} style={{ background: '#223B5A', color: '#fff' }} onClick={() => setConfirmDeleteOpen(false)}>
              Cancelar
            </button>
          </div>
        </Modal>
        <Modal open={!!detalheMeta} onClose={() => setDetalheMeta(null)}>
          {detalheMeta && (
            <div>
              <h2 className={styles.modalTitle}>Detalhes da Meta</h2>
              <div style={{ color: '#A5B3C7', marginBottom: 12 }}>
                <div>Descrição: <span style={{ color: '#00D1B2', fontWeight: 600 }}>{detalheMeta.descricao}</span></div>
                <div>Valor Objetivo: <span style={{ color: '#00D1B2', fontWeight: 600 }}>R$ {Number(detalheMeta.valorObjetivo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                <div>Período: <span style={{ color: '#00D1B2', fontWeight: 600 }}>{formatPeriodo(detalheMeta)}</span></div>
                <div>Valor Economizado: <span style={{ color: '#00D1B2', fontWeight: 600 }}>R$ {(receitasPorMeta[detalheMeta.id] || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                <div>Status: <span style={{ color: '#fff' }}>{detalheMeta.status || (new Date(detalheMeta.dataFim) < new Date() ? "Concluída" : "Em andamento")}</span></div>
              </div>
              <div style={{ margin: '18px 0 8px 0' }}>
                <div style={{ color: '#A5B3C7', fontSize: 15, marginBottom: 4 }}>Progresso:</div>
                <div className={styles.progressBar} style={{ width: '100%', height: 16, background: '#081B33' }}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${Math.min(100, (receitasPorMeta[detalheMeta.id] || 0) / detalheMeta.valorObjetivo * 100)}%`, height: '100%' }}
                  />
                </div>
                <div className={styles.progressText} style={{ color: '#A5B3C7', fontSize: 15, marginTop: 6 }}>
                  {Math.min(100, ((receitasPorMeta[detalheMeta.id] || 0) / detalheMeta.valorObjetivo * 100)).toFixed(1)}% da meta concluída
                </div>
              </div>
              <button className={styles.buttonMeta} style={{ marginTop: 18 }} onClick={() => setDetalheMeta(null)}>
                Fechar
              </button>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}