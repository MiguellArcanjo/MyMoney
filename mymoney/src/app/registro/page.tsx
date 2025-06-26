"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";

export default function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [salario, setSalario] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha, salario }),
    });
    setLoading(false);
    if (res.ok) {
      setSucesso(true);
      setTimeout(() => router.push("/"), 1500);
    } else {
      const data = await res.json();
      setErro(data.message || "Erro ao registrar usuário.");
    }
  }

  return (
    <div className={styles.containerPage}>
      <div>
        <form className={styles.formLogin} onSubmit={handleSubmit}>
          <h2>Crie sua Conta</h2>
          <div className={styles.inputGrid}>
            <div>
              <label>Nome</label>
              <input
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Email</label>
              <input
                type="email"
                placeholder="seuemail@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Senha</label>
              <input
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Salário mensal (opcional)</label>
              <input
                type="number"
                placeholder="Ex: 3500.00"
                value={salario}
                onChange={e => setSalario(e.target.value)}
                min={0}
                step={0.01}
              />
            </div>
          </div>
          {erro && <span style={{ color: "red" }}>{erro}</span>}
          {sucesso && <span style={{ color: "#00D1B2" }}>Usuário cadastrado! Redirecionando...</span>}
          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.buttonLogin} disabled={loading}>
              {loading ? "Registrando..." : "Registrar"}
            </button>
          </div>
          <div className={styles.cadastroHint}>
            <span>Já tem conta?</span>
            <span className={styles.cadastroLink} onClick={() => router.push("/")}>Entrar</span>
          </div>
        </form>
      </div>
    </div>
  );
} 