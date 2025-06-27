"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";

export default function VerificarEmail() {
  const [status, setStatus] = useState<'verificando' | 'sucesso' | 'erro' | 'reenviando'>('verificando');
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('erro');
      setMensagem("Token de verificação não encontrado.");
      return;
    }

    verificarEmail();
  }, [token]);

  async function verificarEmail() {
    try {
      const res = await fetch("/api/auth/verificar-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('sucesso');
        setMensagem(data.message);
        setTimeout(() => router.push("/"), 3000);
      } else {
        setStatus('erro');
        setMensagem(data.message);
      }
    } catch (error) {
      setStatus('erro');
      setMensagem("Erro ao verificar email. Tente novamente.");
    }
  }

  async function reenviarEmail() {
    setLoading(true);
    setStatus('reenviando');
    
    try {
      // Extrair email do token (você pode armazenar o email em localStorage ou usar outro método)
      const res = await fetch("/api/auth/reenviar-verificacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: localStorage.getItem('emailParaVerificacao') }),
      });

      const data = await res.json();

      if (res.ok) {
        setMensagem("Email de verificação reenviado! Verifique sua caixa de entrada.");
        setStatus('sucesso');
      } else {
        setMensagem(data.message);
        setStatus('erro');
      }
    } catch (error) {
      setMensagem("Erro ao reenviar email. Tente novamente.");
      setStatus('erro');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Suspense>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <img src="/logo.png" alt="Logo" />
          </div>
          
          <h1>Verificação de Email</h1>
          
          {status === 'verificando' && (
            <div className={styles.status}>
              <div className={styles.spinner}></div>
              <p>Verificando seu email...</p>
            </div>
          )}

          {status === 'sucesso' && (
            <div className={styles.status}>
              <div className={styles.successIcon}>✓</div>
              <p>{mensagem}</p>
              <p className={styles.redirect}>Redirecionando para o login...</p>
            </div>
          )}

          {status === 'erro' && (
            <div className={styles.status}>
              <div className={styles.errorIcon}>✕</div>
              <p>{mensagem}</p>
              <div className={styles.actions}>
                <button 
                  onClick={reenviarEmail} 
                  disabled={loading}
                  className={styles.button}
                >
                  {loading ? 'Reenviando...' : 'Reenviar Email'}
                </button>
                <button 
                  onClick={() => router.push("/")}
                  className={styles.buttonSecondary}
                >
                  Voltar ao Login
                </button>
              </div>
            </div>
          )}

          {status === 'reenviando' && (
            <div className={styles.status}>
              <div className={styles.spinner}></div>
              <p>Reenviando email de verificação...</p>
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
} 