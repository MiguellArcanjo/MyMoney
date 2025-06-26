"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [salario, setSalario] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 700);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (step === 1) {
      if (!nome || !email || !senha) {
        setErro("Preencha todos os campos obrigatórios.");
        return;
      }
      setStep(2);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha, salario, objetivo }),
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
    <div className={styles.containerPageLogin}>
      <div className={styles.authContainer}>
        {!isMobile && (
          <div className={styles.splitLeft}>
            <img src="/logo.png" alt="Logo" className={styles.splitLogo} />
            <div>
              <div className={styles.welcomeTitle}>Crie sua Conta</div>
              <div className={styles.welcomeText}>
                Cadastre-se para começar a controlar seus gastos e alcançar suas metas financeiras!
              </div>
            </div>
          </div>
        )}
        <div className={styles.splitRight}>
          <form className={styles.formLogin} onSubmit={handleSubmit}>
            <h2>Cadastro</h2>
            <div className={styles.inputGridCadastro}>
              {step === 1 && (
                <>
                  <div>
                    <label>Nome</label>
                    <input
                      type="text"
                      placeholder="Seu nome completo"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="seuemail@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.senhaFullWidth}>
                    <label>Senha</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={senhaVisivel ? "text" : "password"}
                        placeholder="Digite sua senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
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
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <label>Salário mensal (opcional)</label>
                    <input
                      type="number"
                      placeholder="Ex: 3500.00"
                      value={salario}
                      onChange={(e) => setSalario(e.target.value)}
                      min={0}
                      step={0.01}
                    />
                  </div>
                  <div>
                    <label>Objetivo financeiro</label>
                    <select
                      value={objetivo}
                      onChange={(e) => setObjetivo(e.target.value)}
                      className={styles.inputInteractiveWrapper}
                      required
                    >
                      <option value="">Selecione...</option>
                      <option value="Controlar gastos">Controlar gastos</option>
                      <option value="Acompanhar metas">Acompanhar metas</option>
                      <option value="Planejar parcelas">Planejar parcelas</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Barra de Progresso */}
            <div style={{
                width: "100%",
                height: 10,
                background: "#061426",
                borderRadius: 999,
                overflow: "hidden",
                margin: "18px 0 24px",
              }}>
              <div style={{
                width: step === 1 ? "50%" : "100%",
                background: "linear-gradient(90deg, #00D1B2, #00bfa6)",
                height: "100%",
                borderRadius: 999,
                transition: "width 0.4s cubic-bezier(.4,1.6,.6,1)"
              }} />
            </div>


            {erro && <span style={{ color: "red" }}>{erro}</span>}
            {sucesso && (
              <span style={{ color: "#00D1B2" }}>
                Usuário cadastrado! Redirecionando...
              </span>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {step === 2 && (
                <button
                  type="button"
                  className={styles.buttonLogin}
                  onClick={() => setStep(1)}
                >
                  Voltar
                </button>
              )}
              <button
                type="submit"
                className={styles.buttonLogin}
                disabled={loading}
              >
                {step === 1 ? "Próximo" : loading ? "Registrando..." : "Registrar"}
              </button>
            </div>
            <div className={styles.cadastroHint}>
              <span>Já tem conta? </span>
              <span
                className={styles.cadastroLink}
                onClick={() => router.push("/")}
              >
                Entrar
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
