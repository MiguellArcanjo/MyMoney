"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setMensagem("");
    setLoading(true);
    const res = await fetch("/api/auth/esqueci-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) {
      setMensagem(
        "Se o email estiver cadastrado, você receberá um link para redefinir sua senha."
      );
    } else {
      const data = await res.json();
      setErro(data.message || "Erro ao solicitar redefinição de senha.");
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
          Redefinir senha
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <label style={{ color: "#A5B3C7", fontSize: 14 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@gmail.com"
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
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "#00D1B2")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "#0E2A4C")
            }
          />

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
            {loading ? "Enviando..." : "Enviar link de redefinição"}
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
