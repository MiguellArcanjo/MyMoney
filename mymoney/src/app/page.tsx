"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      const data = await res.json();
      if (data.emailNaoVerificado) {
        setErro("Email não verificado. Verifique sua caixa de entrada e clique no link de verificação.");
        // Armazenar email para reenvio de verificação
        localStorage.setItem('emailParaVerificacao', email);
      } else {
        setErro("Email ou senha inválidos.");
      }
    }
  }

  return (
    <div className={styles.containerPageLogin}>
      <div className={styles.authContainer}>
        {!isMobile && (
          <div className={styles.splitLeftElegant}>
            <img src="/logo.png" alt="Logo" className={styles.splitLogo} />
            <div>
              <div className={styles.welcomeTitle}>Bem-vindo de volta!</div>
              <div className={styles.welcomeText}>
                Acesse sua conta para gerenciar seus gastos de forma inteligente
                e segura.
              </div>
            </div>
          </div>
        )}
        <div className={styles.splitRight}>
          <form className={styles.formLogin} onSubmit={handleSubmit}>
            <h2>Login</h2>
            <div>
              <label>Email</label>
              <input
                type="email"
                placeholder="seuemail@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label>Senha</label>
              <div style={{ position: "relative" }}>
                <input
                  type={senhaVisivel ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  style={{ paddingRight: 36 }}
                />
                <span
                  onClick={() => setSenhaVisivel((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                  }}
                >
                  {senhaVisivel ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#223B5A" strokeWidth="2">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#223B5A" strokeWidth="2">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                      <path d="M3 3l18 18"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </span>
              </div>
            </div>
            {erro && <span style={{ color: "red" }}>{erro}</span>}
            <button type="submit" className={styles.buttonLogin} disabled={loading}>
              {loading ? <LoadingSpinner size={22} inline /> : "Entrar"}
            </button>
            <div className={styles.cadastroHint}>
              <span>Não tem conta? </span>
              <span
                className={styles.cadastroLink}
                onClick={() => router.push("/registro")}
              >
                Cadastre-se
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
