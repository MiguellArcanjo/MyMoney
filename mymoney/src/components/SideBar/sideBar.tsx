"use client"

import { usePathname, useRouter } from "next/navigation";
import "./sidebar.css";

export default function SideBar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/");
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
          <li className="sidebar-exit"><button className="sidebar-logout-btn" onClick={handleLogout}>Sair</button></li>
        </ul>
      </nav>
    </aside>
  );
}
