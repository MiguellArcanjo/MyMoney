import React, { useState } from "react";
import styles from "./wizardMetaModal.module.css";

interface WizardMetaModalProps {
  open: boolean;
  onClose: () => void;
  onMetaCreated?: (meta: any) => void;
}

export default function WizardMetaModal({ open, onClose, onMetaCreated }: WizardMetaModalProps) {
  const [step, setStep] = useState(1);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setStep(1);
    setDescricao("");
    setValor("");
    setDataInicio("");
    setDataFim("");
    setLoading(false);
    setSuccess(false);
    setError("");
  }

  React.useEffect(() => {
    if (!open) reset();
  }, [open]);

  function validateStep1() {
    if (!descricao.trim()) {
      setError("Informe uma descrição para a meta.");
      return false;
    }
    if (!valor || isNaN(Number(valor)) || Number(valor) <= 0) {
      setError("Informe um valor objetivo válido.");
      return false;
    }
    setError("");
    return true;
  }

  function validateStep2() {
    if (!dataInicio) {
      setError("Informe a data de início.");
      return false;
    }
    if (!dataFim) {
      setError("Informe a data de fim.");
      return false;
    }
    if (dataFim < dataInicio) {
      setError("A data de fim deve ser após a data de início.");
      return false;
    }
    setError("");
    return true;
  }

  function handleNext() {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  async function handleCreate() {
    if (!validateStep2()) return;
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/metas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          descricao,
          valorObjetivo: valor,
          dataInicio,
          dataFim,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        if (onMetaCreated) {
          const novaMeta = await res.json();
          onMetaCreated(novaMeta);
        }
      } else {
        setError("Erro ao criar meta. Tente novamente.");
      }
    } catch {
      setError("Erro ao criar meta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    onClose();
    setTimeout(reset, 300);
  }

  return open ? (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={handleClose}>&times;</button>
        {!success ? (
          <>
            <div className={styles.stepsBar}>
              <div className={`${styles.step} ${step >= 1 ? styles.active : ""}`}>1</div>
              <div className={styles.line} />
              <div className={`${styles.step} ${step >= 2 ? styles.active : ""}`}>2</div>
              <div className={styles.line} />
              <div className={`${styles.step} ${step === 3 ? styles.active : ""}`}>3</div>
            </div>
            {step === 1 && (
              <div className={styles.stepContent}>
                <h2 className={styles.title}>Informações da Meta</h2>
                <label className={styles.label}>Descrição da meta</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Ex: Viagem, Reserva, Notebook"
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  autoFocus
                />
                <label className={styles.label}>Valor objetivo</label>
                <input
                  className={styles.input}
                  type="number"
                  placeholder="Ex: 5000"
                  value={valor}
                  onChange={e => setValor(e.target.value)}
                  min={1}
                />
                {error && <div className={styles.error}>{error}</div>}
                <button className={styles.button} onClick={handleNext}>
                  Próximo
                </button>
              </div>
            )}
            {step === 2 && (
              <div className={styles.stepContent}>
                <h2 className={styles.title}>Período da Meta</h2>
                <label className={styles.label}>Data de início</label>
                <input
                  className={styles.input}
                  type="date"
                  value={dataInicio}
                  onChange={e => setDataInicio(e.target.value)}
                />
                <label className={styles.label}>Data de fim</label>
                <input
                  className={styles.input}
                  type="date"
                  value={dataFim}
                  onChange={e => setDataFim(e.target.value)}
                />
                {error && <div className={styles.error}>{error}</div>}
                <div className={styles.buttonRow}>
                  <button className={styles.buttonSecondary} onClick={handleBack}>
                    Voltar
                  </button>
                  <button className={styles.button} onClick={handleNext}>
                    Próximo
                  </button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className={styles.stepContent}>
                <h2 className={styles.title}>Confirmação</h2>
                <div className={styles.resumoBox}>
                  <div><span className={styles.label}>Descrição:</span> <span className={styles.resumo}>{descricao}</span></div>
                  <div><span className={styles.label}>Valor objetivo:</span> <span className={styles.resumo}>R$ {Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                  <div><span className={styles.label}>Início:</span> <span className={styles.resumo}>{dataInicio}</span></div>
                  <div><span className={styles.label}>Fim:</span> <span className={styles.resumo}>{dataFim}</span></div>
                </div>
                {error && <div className={styles.error}>{error}</div>}
                <div className={styles.buttonRow}>
                  <button className={styles.buttonSecondary} onClick={handleBack}>
                    Voltar
                  </button>
                  <button className={styles.button} onClick={handleCreate} disabled={loading}>
                    {loading ? <span className={styles.loader}></span> : "Criar Meta"}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.successContent}>
            <div className={styles.successIcon}>✔️</div>
            <h2 className={styles.title}>Meta criada com sucesso!</h2>
            <div className={styles.buttonRow}>
              <button className={styles.button} onClick={handleClose}>
                Ver minhas metas
              </button>
              <button className={styles.buttonSecondary} onClick={() => { reset(); setStep(1); setSuccess(false); }}>
                Criar outra
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;
} 