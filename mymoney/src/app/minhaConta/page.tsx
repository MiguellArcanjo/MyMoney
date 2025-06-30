"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SideBar from "../../components/SideBar/sideBar";
import Modal from "@/components/Modal/Modal";
import styles from "./page.module.css";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSidebar } from "@/components/SideBar/SidebarContext";
import { useTheme } from "@/components/ThemeProvider";
import { FaPencilAlt, FaLock, FaSignOutAlt, FaEnvelope, FaMoneyBillWave } from "react-icons/fa";

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
  const { setIsOpen } = useSidebar();
  const { theme } = useTheme();

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

  // Função para pegar a inicial do nome
  function getInitial(nome: string | undefined) {
    if (!nome) return "?";
    return nome.trim().charAt(0).toUpperCase();
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: theme === 'dark'
        ? 'linear-gradient(135deg, #081B33 0%, #0E2A4C 100%)'
        : '#f6f8fa',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <SideBar />
      <main className={styles.mainContent} style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        width: '100vw',
      }}>
        <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
              <span className={styles.mobileTitle}>Minha Conta</span>
            </div>
          ) : (
            <h1 className={styles.title}>Minha Conta</h1>
          )}

          {/* Exibir apenas o spinner enquanto carrega */}
          {carregando ? (
            <div style={{ width: '100%', minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LoadingSpinner size={60} />
            </div>
          ) : (
            <div
              className={theme === 'dark' ? styles.card : `${styles.card} ${styles.cardLight}`}
              style={{
                background: theme === 'dark' ? 'rgba(14,42,76,0.85)' : '#fff',
                borderRadius: 28,
                boxShadow: theme === 'dark'
                  ? '0 8px 32px 0 rgba(0,0,0,0.25)'
                  : '0 4px 24px 0 rgba(0,0,0,0.08)',
                border: theme === 'dark' ? '2px solid #00D1B2' : '1.5px solid #e0e7ef',
                boxSizing: 'border-box',
                maxWidth: 420,
                width: '100%',
                margin: '0 auto',
                padding: '40px 32px',
                position: 'relative',
                outline: 'none',
                transition: 'box-shadow 0.2s',
                filter: theme === 'dark' ? 'drop-shadow(0 0 12px #00D1B2AA)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backdropFilter: theme === 'dark' ? 'blur(8px)' : 'none',
                WebkitBackdropFilter: theme === 'dark' ? 'blur(8px)' : 'none',
                marginTop: 28,
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 84,
                height: 84,
                borderRadius: '50%',
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, #00D1B2 60%, #0E2A4C 100%)'
                  : 'linear-gradient(135deg, #00D1B2 60%, #fff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
                boxShadow: theme === 'dark'
                  ? '0 2px 12px 0 #00D1B288'
                  : '0 2px 8px 0 #00D1B222',
                fontSize: 38,
                fontWeight: 800,
                color: '#fff',
                letterSpacing: 1.5,
                userSelect: 'none',
                border: theme === 'dark' ? '3px solid #fff' : '3px solid #00D1B2',
                transition: 'box-shadow 0.2s',
              }}>
                {getInitial(usuario?.nome)}
              </div>
              {/* Dados do usuário */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', alignItems: 'center', marginBottom: 28 }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: theme === 'dark' ? '#00D1B2' : '#223B5A', fontWeight: 700, fontSize: 22, letterSpacing: 0.2, fontFamily: 'Poppins, Inter, sans-serif' }}>{usuario ? usuario.nome : "Carregando..."}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <FaEnvelope color={theme === 'dark' ? '#00D1B2' : '#081B33'} size={18} />
                  <a href={`mailto:${usuario?.email}`} style={{ color: theme === 'dark' ? '#A5B3C7' : '#223B5A', fontWeight: 500, fontSize: 16, textDecoration: 'underline dotted', wordBreak: 'break-all', fontFamily: 'Inter, sans-serif' }}>{usuario ? usuario.email : "Carregando..."}</a>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <FaMoneyBillWave color={theme === 'dark' ? '#00D1B2' : '#081B33'} size={20} />
                  <span style={{ color: '#00D1B2', fontWeight: 700, fontSize: 18, fontFamily: 'Inter, sans-serif' }}>
                    {usuario && usuario.salario !== undefined && usuario.salario !== null ? `R$ ${Number(usuario.salario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                  </span>
                </div>
              </div>
              {/* Botões */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 8 }}>
                <button
                  className={styles.actionButton}
                  style={{
                    background: '#00D1B2',
                    color: '#fff',
                    borderRadius: 16,
                    fontWeight: 700,
                    fontSize: 17,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    boxShadow: '0 2px 8px 0 #00D1B255',
                    transition: 'box-shadow 0.2s, transform 0.1s',
                    width: '100%',
                    maxWidth: 320,
                    justifyContent: 'center',
                    padding: '14px 0',
                  }}
                  onClick={openEditModal}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <FaPencilAlt size={20} color={theme === 'dark' ? '#081B33' : '#fff'} /> Editar Dados
                </button>
                <button
                  className={styles.actionButton}
                  style={{
                    background: '#00D1B2',
                    color: '#fff',
                    borderRadius: 16,
                    fontWeight: 700,
                    fontSize: 17,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    boxShadow: '0 2px 8px 0 #00D1B255',
                    transition: 'box-shadow 0.2s, transform 0.1s',
                    width: '100%',
                    maxWidth: 320,
                    justifyContent: 'center',
                    padding: '14px 0',
                  }}
                  onClick={handleLogout}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <FaSignOutAlt size={20} color={theme === 'dark' ? '#081B33' : '#fff'} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} customOverlayClass={styles.minhaContaEditOverlay}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 24, marginBottom: 24, textAlign: 'center', letterSpacing: 0.5, fontFamily: 'Poppins, Inter, sans-serif' }}>Editar Dados</h2>
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%', maxWidth: 340, margin: '0 auto' }}>
            <label style={{ color: '#A5B3C7', fontSize: 13, marginBottom: 2, fontWeight: 500 }}>Nome</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#0E2A4C', borderRadius: 10, border: '1.5px solid #00D1B2', padding: '0 12px', marginBottom: 2 }}>
              <FaPencilAlt color="#00D1B2" size={18} style={{ marginRight: 8 }} />
              <input
                type="text"
                value={editNome}
                onChange={e => setEditNome(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: 16,
                  padding: '12px 0',
                  width: '100%',
                  fontFamily: 'Inter, sans-serif',
                }}
                required
              />
            </div>
            <label style={{ color: '#A5B3C7', fontSize: 13, marginBottom: 2, fontWeight: 500 }}>Email</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#0E2A4C', borderRadius: 10, border: '1.5px solid #00D1B2', padding: '0 12px', marginBottom: 2 }}>
              <FaEnvelope color="#00D1B2" size={18} style={{ marginRight: 8 }} />
              <input
                type="email"
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: 16,
                  padding: '12px 0',
                  width: '100%',
                  fontFamily: 'Inter, sans-serif',
                }}
                required
              />
            </div>
            <label style={{ color: '#A5B3C7', fontSize: 13, marginBottom: 2, fontWeight: 500 }}>Salário mensal (opcional)</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#0E2A4C', borderRadius: 10, border: '1.5px solid #00D1B2', padding: '0 12px', marginBottom: 2 }}>
              <FaMoneyBillWave color="#00D1B2" size={18} style={{ marginRight: 8 }} />
              <input
                type="number"
                value={editSalario}
                onChange={e => setEditSalario(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: 16,
                  padding: '12px 0',
                  width: '100%',
                  fontFamily: 'Inter, sans-serif',
                }}
                min={0}
                step={0.01}
              />
            </div>
            {editError && (
              <div style={{ color: '#ff5e5e', fontSize: 14, marginTop: 2, textAlign: 'center' }}>{editError}</div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
                  background: 'none',
                  color: '#A5B3C7',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 16,
                  borderRadius: 8,
                  padding: '10px 18px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={editLoading}
                style={{
                  background: '#00D1B2',
                  color: '#081B33',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 16,
                  borderRadius: 8,
                  padding: '10px 22px',
                  cursor: editLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px 0 #00D1B255',
                  transition: 'background 0.2s, box-shadow 0.2s',
                  opacity: editLoading ? 0.7 : 1,
                }}
              >
                {editLoading ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
} 
