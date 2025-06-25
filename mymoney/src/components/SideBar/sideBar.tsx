"use client"

import { usePathname, useRouter } from "next/navigation";
import "./sidebar.css";
import { useState, useEffect } from "react";
import Modal from "../Modal/Modal";
import { useSidebar } from "./SidebarContext";

export default function SideBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const { isOpen, setIsOpen } = useSidebar();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.classList.add('sidebar-mobile-open');
    } else {
      document.body.classList.remove('sidebar-mobile-open');
    }
    return () => {
      document.body.classList.remove('sidebar-mobile-open');
    };
  }, [isMobile, isOpen]);

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/");
  }

  if (isMobile) {
    return (
      <>
        {!isOpen && (
          <button className="sidebar-hamburger" onClick={() => setIsOpen(true)}>
            <span className="sidebar-hamburger-bar" />
            <span className="sidebar-hamburger-bar" />
            <span className="sidebar-hamburger-bar" />
          </button>
        )}
        {isOpen && (
          <aside className="sidebar sidebar-mobile">
            <div className="sidebar-title">Organizze <button className="sidebar-close" style={{zIndex: 10001, position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)'}} onClick={() => setIsOpen(false)}>&times;</button></div>
            <nav className="sidebar-nav">
              <ul>
                <li><a href="/dashboard" className={pathname === "/dashboard" ? "active" : ""} onClick={() => setIsOpen(false)}>Dashboard</a></li>
                <li><a href="/contas" className={pathname === "/contas" ? "active" : ""} onClick={() => setIsOpen(false)}>Contas</a></li>
                <li><a href="/lancamentos" className={pathname === "/lancamentos" ? "active" : ""} onClick={() => setIsOpen(false)}>Lançamentos</a></li>
                <li><a href="/categorias" className={pathname === "/categorias" ? "active" : ""} onClick={() => setIsOpen(false)}>Categorias</a></li>
                <li><a href="/metas" className={pathname === "/metas" ? "active" : ""} onClick={() => setIsOpen(false)}>Metas</a></li>
                <li><a href="/minhaConta" className={pathname === "/minhaConta" ? "active" : ""} onClick={() => setIsOpen(false)}>Minha conta</a></li>
                <li className="sidebar-exit"><button className="sidebar-logout-btn" onClick={() => setShowLogoutModal(true)}>Sair</button></li>
              </ul>
            </nav>
          </aside>
        )}
        <Modal open={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
          <div style={{ padding: 24, background: '#0E2A4C', borderRadius: 12, minWidth: 280, color: '#fff', textAlign: 'center' }}>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Deseja realmente sair?</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 18 }}>
              <button style={{ background: '#00D1B2', color: '#081B33', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }} onClick={handleLogout}>Sim, sair</button>
              <button style={{ background: '#223B5A', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }} onClick={() => setShowLogoutModal(false)}>Cancelar</button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-title">Organizze</div>
      <nav className="sidebar-nav">
        <ul>
          <li><a href="/dashboard" className={pathname === "/dashboard" ? "active" : ""}>Dashboard</a></li>
          <li><a href="/contas" className={pathname === "/contas" ? "active" : ""}>Contas</a></li>
          <li><a href="/lancamentos" className={pathname === "/lancamentos" ? "active" : ""}>Lançamentos</a></li>
          <li><a href="/categorias" className={pathname === "/categorias" ? "active" : ""}>Categorias</a></li>
          <li><a href="/metas" className={pathname === "/metas" ? "active" : ""}>Metas</a></li>
          <li><a href="/minhaConta" className={pathname === "/minhaConta" ? "active" : ""}>Minha conta</a></li>
          <li className="sidebar-exit"><button className="sidebar-logout-btn" onClick={() => setShowLogoutModal(true)}>Sair</button></li>
        </ul>
      </nav>
      <Modal open={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
        <div style={{ padding: 24, background: '#0E2A4C', borderRadius: 12, minWidth: 280, color: '#fff', textAlign: 'center' }}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Deseja realmente sair?</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 18 }}>
            <button style={{ background: '#00D1B2', color: '#081B33', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }} onClick={handleLogout}>Sim, sair</button>
            <button style={{ background: '#223B5A', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }} onClick={() => setShowLogoutModal(false)}>Cancelar</button>
          </div>
        </div>
      </Modal>
    </aside>
  );
}
