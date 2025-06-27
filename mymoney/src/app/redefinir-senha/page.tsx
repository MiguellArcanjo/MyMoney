"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RedefinirSenha() {
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [senhasIguais, setSenhasIguais] = useState(true);

  // Verificação em tempo real se as senhas são iguais
  useEffect(() => {
    if (confirmar.length > 0) {
      setSenhasIguais(senha === confirmar);
    } else {
      setSenhasIguais(true);
    }
  }, [senha, confirmar]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setMensagem("");

    if (!senha || senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/redefinir-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, senha }),
    });
    setLoading(false);

    if (res.ok) {
      setMensagem("Senha redefinida com sucesso! Você já pode fazer login.");
      setTimeout(() => router.push("/"), 2500);
    } else {
      const data = await res.json();
      setErro(data.message || "Erro ao redefinir senha.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#081B33",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "rgba(14, 42, 76, 0.85)",
          backdropFilter: "blur(8px)",
          borderRadius: 20,
          padding: "32px 28px",
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
        }}
      >
        <h2
          style={{
            color: "#fff",
            textAlign: "center",
            marginBottom: 24,
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          Criar nova senha
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <label style={{ color: "#A5B3C7", fontSize: 14 }}>Nova senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Digite a nova senha"
            required
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid #0E2A4C",
              background: "#061426",
              color: "#A5B3C7",
              fontSize: 15,
              outline: "none",
              transition: "border-color 0.3s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#00D1B2")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#0E2A4C")}
          />

          <label style={{ color: "#A5B3C7", fontSize: 14 }}>
            Confirmar nova senha
          </label>
          <input
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            placeholder="Confirme a nova senha"
            required
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              border: `1px solid ${
                senhasIguais ? "#0E2A4C" : "#FF6B6B"
              }`,
              background: "#061426",
              color: "#A5B3C7",
              fontSize: 15,
              outline: "none",
              transition: "border-color 0.3s",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = senhasIguais
                ? "#00D1B2"
                : "#FF6B6B")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = senhasIguais
                ? "#0E2A4C"
                : "#FF6B6B")
            }
          />

          {!senhasIguais && (
            <span
              style={{
                color: "#FF6B6B",
                fontSize: 13,
                marginTop: -8,
                marginBottom: -4,
              }}
            >
              ⚠️ As senhas não coincidem
            </span>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#00D1B2",
              color: "#081B33",
              border: "none",
              borderRadius: 10,
              padding: "12px 14px",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              transition: "background 0.3s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "#00bfa6")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "#00D1B2")
            }
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>

        {mensagem && (
          <p
            style={{
              color: "#00D1B2",
              textAlign: "center",
              marginTop: 16,
              fontSize: 14,
            }}
          >
            {mensagem}
          </p>
        )}
        {erro && (
          <p
            style={{
              color: "#FF6B6B",
              textAlign: "center",
              marginTop: 16,
              fontSize: 14,
            }}
          >
            {erro}
          </p>
        )}

        <div
          style={{
            marginTop: 24,
            textAlign: "center",
            color: "#A5B3C7",
            cursor: "pointer",
            fontSize: 14,
            transition: "color 0.3s",
          }}
          onClick={() => router.push("/")}
          onMouseOver={(e) => (e.currentTarget.style.color = "#00D1B2")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#A5B3C7")}
        >
          Voltar ao login
        </div>
      </div>
    </div>
  );
}
