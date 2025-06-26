"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SideBar from "../../components/SideBar/sideBar";
import Modal from "@/components/Modal/Modal";
import styles from "./page.module.css";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function MinhaConta() {
  const [usuario, setUsuario] = useState<{ nome: string; email: string; salario?: number } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editNome, setEditNome] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editSalario, setEditSalario] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  const carregando = !usuario;

  useEffect(() => {
    async function fetchUsuario() {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUsuario(data);
      }
    }
    fetchUsuario();
  }, [router]);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/");
  }

  function openEditModal() {
    setEditNome(usuario?.nome || "");
    setEditEmail(usuario?.email || "");
    setEditSalario(usuario?.salario !== undefined && usuario?.salario !== null ? String(usuario.salario) : "");
    setEditError("");
    setModalOpen(true);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    const token = localStorage.getItem("token");
    if (!token) {
      setEditError("Token não encontrado. Faça login novamente.");
      setEditLoading(false);
      return;
    }
    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ nome: editNome, email: editEmail, salario: editSalario }),
    });
    if (res.ok) {
      const data = await res.json();
      setUsuario(data);
      setModalOpen(false);
    } else {
      setEditError("Erro ao atualizar dados. Tente novamente.");
    }
    setEditLoading(false);
  }

  return (
    <div>
      <SideBar />
      <main className={styles.mainContent}>
        {/* Barra de título e menu no mobile */}
        {isMobile ? (
          <div className={styles.mobileHeaderBar}>
            <span className={styles.mobileTitle}>Minha Conta</span>
          </div>
        ) : (
          <h1 className="title">Minha Conta</h1>
        )}
        <div className={isMobile ? styles.mobileMainWrapper : undefined}>
          <div className={styles.card} style={{ minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch' }}>
            <h2>Dados do Usuário</h2>
            {carregando ? (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <LoadingSpinner size={60} />
              </div>
            ) : (
              <>
                <div className={styles.infoGroup}>
                  <span>Nome:</span>
                  <span className={styles.infoValue}>{usuario ? usuario.nome : "Carregando..."}</span>
                </div>
                <div className={styles.infoGroup}>
                  <span>Email:</span>
                  <span className={styles.infoValue}>{usuario ? usuario.email : "Carregando..."}</span>
                </div>
                <div className={styles.infoGroup}>
                  <span>Salário:</span>
                  <span className={styles.infoValue}>{usuario && usuario.salario !== undefined && usuario.salario !== null ? `R$ ${Number(usuario.salario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}</span>
                </div>
                <div className={styles.buttonGroup}>
                  <button className={styles.actionButton}>Alterar Senha</button>
                  <button className={styles.actionButton} onClick={openEditModal}>Editar Dados</button>
                  <button className={styles.actionButton} onClick={handleLogout}>Logout</button>
                </div>
              </>
            )}
          </div>
        </div>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <h2 style={{ color: '#fff', marginBottom: 16 }}>Editar Dados</h2>
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ color: '#A5B3C7', fontSize: 14 }}>Nome</label>
            <input
              type="text"
              value={editNome}
              onChange={e => setEditNome(e.target.value)}
              style={{
                background: '#061426',
                border: 'none',
                borderRadius: 10,
                padding: '12px 16px',
                color: '#A5B3C7',
                fontSize: 16,
                marginBottom: 8
              }}
              required
            />
            <label style={{ color: '#A5B3C7', fontSize: 14 }}>Email</label>
            <input
              type="email"
              value={editEmail}
              onChange={e => setEditEmail(e.target.value)}
              style={{
                background: '#061426',
                border: 'none',
                borderRadius: 10,
                padding: '12px 16px',
                color: '#A5B3C7',
                fontSize: 16,
                marginBottom: 16
              }}
              required
            />
            <label style={{ color: '#A5B3C7', fontSize: 14 }}>Salário mensal (opcional)</label>
            <input
              type="number"
              value={editSalario}
              onChange={e => setEditSalario(e.target.value)}
              style={{
                background: '#061426',
                border: 'none',
                borderRadius: 10,
                padding: '12px 16px',
                color: '#A5B3C7',
                fontSize: 16,
                marginBottom: 8
              }}
              min={0}
              step={0.01}
              placeholder="Ex: 3500.00"
            />
            {editError && <span style={{ color: 'red', fontSize: 14 }}>{editError}</span>}
            <button type="submit" style={{
              background: '#00D1B2',
              color: '#222',
              border: 'none',
              borderRadius: 8,
              padding: '12px 0',
              fontSize: 16,
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: 8,
              opacity: editLoading ? 0.7 : 1
            }} disabled={editLoading}>
              {editLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        </Modal>
      </main>
    </div>
  );
} 
