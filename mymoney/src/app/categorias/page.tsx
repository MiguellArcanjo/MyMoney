"use client"

import { useEffect, useState } from "react";
import SideBar from "@/components/SideBar/sideBar";
import Modal from "@/components/Modal/Modal";
import styles from "./page.module.css";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Categorias() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("Despesa");
  const [cor, setCor] = useState("#222");
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    setNome("");
    setTipo("Despesa");
    setCor("#222");
    setModalOpen(true);
  }

  function openEditModal(cat: any) {
    setEditId(cat.id);
    setNome(cat.nome);
    setTipo(cat.tipo);
    setCor(cat.cor);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;
    if (editId) {
      // Editar categoria
      const res = await fetch(`/api/categorias/${editId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ nome, tipo, cor }),
      });
      if (res.ok) {
        setCategorias(categorias.map(cat => cat.id === editId ? { ...cat, nome, tipo, cor } : cat));
        setModalOpen(false);
      }
    } else {
      // Adicionar categoria
      const res = await fetch("/api/categorias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ nome, tipo, cor }),
      });
      if (res.ok) {
        const novaCategoria = await res.json();
        setCategorias([novaCategoria, ...categorias]);
        setModalOpen(false);
        setNome("");
        setTipo("Despesa");
        setCor("#222");
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
    const res = await fetch(`/api/categorias/${deleteId}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    });
    if (res.ok) {
      setCategorias(categorias.filter(cat => cat.id !== deleteId));
    }
    setConfirmDeleteOpen(false);
    setDeleteId(null);
  }

  return (
    <div>
      <SideBar />
      <main className={styles.mainContent}>
        {/* Barra de título e menu no mobile */}
        {isMobile ? (
          <div className={styles.mobileHeaderBar}>
            <span className={styles.mobileTitle}>Categorias</span>
          </div>
        ) : (
          <h1 className="title">Categorias</h1>
        )}
        {isMobile ? (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className={styles.addButton} onClick={openAddModal}>
              + Adicionar Categoria
            </button>
          </div>
        ) : (
          <button className={styles.addButton} onClick={openAddModal}>
            + Adicionar Categoria
          </button>
        )}
        {loadingCategorias ? (
          <div className={styles.card} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180, height: '180px' }}>
            <LoadingSpinner size={48} inline />
          </div>
        ) : (
          <div className={isMobile ? styles.mobileMainWrapper : undefined}>
            <div className={styles.card}>
              <h2 className={styles.tableTitle}>Lista de Categorias</h2>
              {categorias.length === 0 ? (
                <div style={{ color: '#A5B3C7', textAlign: 'center', padding: 24 }}>Nenhuma categoria cadastrada.</div>
              ) : (
                <>
                  {!isMobile && (
                    <table className={styles.tableMetas}>
                      <thead>
                        <tr>
                          <th>Categoria</th>
                          <th>Tipo</th>
                          <th>Cor</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categorias.map((cat) => (
                          <tr key={cat.id}>
                            <td>{cat.nome}</td>
                            <td>{cat.tipo}</td>
                            <td>
                              <span
                                style={{ width: 18, height: 18, borderRadius: 4, background: cat.cor, display: 'inline-block', border: '2px solid #223B5A', verticalAlign: 'middle' }}
                              ></span>
                            </td>
                            <td className={styles.actionCell}>
                              <button className={styles.actionBtn} onClick={() => openEditModal(cat)}>Editar</button>
                              <button className={styles.actionBtn} onClick={() => openDeleteModal(cat.id)}>Excluir</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {isMobile && (
                    <div className={styles.cardsMobileWrapper}>
                      {categorias.map((cat) => (
                        <div className={styles.contaCardMobile} key={cat.id}>
                          <div className={styles.contaNome} style={{ color: '#00D1B2', fontWeight: 700 }}>{cat.nome}</div>
                          <div className={styles.contaTipo}>{cat.tipo}</div>
                          <div className={styles.contaTipo}>
                            <span style={{ width: 18, height: 18, borderRadius: 4, background: cat.cor, display: 'inline-block', border: '2px solid #223B5A', verticalAlign: 'middle' }}></span>
                          </div>
                          <div className={styles.contaAcoes}>
                            <button onClick={() => openEditModal(cat)}>Editar</button>
                            <button onClick={() => openDeleteModal(cat.id)}>Excluir</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <h2 className={styles.modalTitle}>{editId ? "Editar Categoria" : "Adicionar Categoria"}</h2>
          <form className={styles.formMeta} onSubmit={handleSubmit}>
            <label className={styles.labelMeta}>Nome da Categoria</label>
            <input
              className={styles.inputMeta}
              type="text"
              placeholder="Ex: Mercado"
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
              <option value="Despesa">Despesa</option>
              <option value="Receita">Receita</option>
            </select>
            <label className={styles.labelMeta}>Cor da Categoria</label>
            <input
              className={styles.inputColor}
              type="color"
              value={cor}
              onChange={e => setCor(e.target.value)}
              style={{ width: 50, height: 32, padding: 2 }}
              required
            />
            <button className={styles.buttonMeta} type="submit">{editId ? "Salvar Alterações" : "Adicionar Categoria"}</button>
          </form>
        </Modal>
        <Modal open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
          <h2 className={styles.modalTitle}>Confirmar Exclusão</h2>
          <p style={{ color: '#A5B3C7', marginBottom: 24 }}>Tem certeza que deseja excluir esta categoria?</p>
          <div style={{ display: 'flex', gap: 16 }}>
            <button className={styles.buttonMeta} style={{ background: '#00D1B2', color: '#081B33' }} onClick={handleDelete}>
              Confirmar
            </button>
            <button className={styles.buttonMeta} style={{ background: '#223B5A', color: '#fff' }} onClick={() => setConfirmDeleteOpen(false)}>
              Cancelar
            </button>
          </div>
        </Modal>
      </main>
    </div>
  );
} 