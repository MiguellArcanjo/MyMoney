"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Home() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } else {
      setErro("Email ou senha inválidos.");
    }
  }

  return (
    <div className={styles.containerPage}>
      <div>
        <form className={styles.formLogin} onSubmit={handleSubmit}>
          <h2>Controle de Gastos</h2>
          <div>
            <label>Email</label>
            <input
              type="email"
              placeholder="seuemail@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label>Senha</label>
            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
            />
          </div>
          {erro && <span style={{ color: "red" }}>{erro}</span>}
          <button type="submit" className={styles.buttonLogin} disabled={loading}>
            {loading ? <LoadingSpinner size={22} inline /> : "Entrar"}
          </button>
          <div className={styles.cadastroHint}>
            <span>Não tem conta? </span>
            <span className={styles.cadastroLink} onClick={() => router.push("/registro")}>Cadastre-se</span>
          </div>
        </form>
      </div>
    </div>
  );
}
