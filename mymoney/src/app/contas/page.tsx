"use client"

import { useState, useEffect } from "react";
import SideBar from "@/components/SideBar/sideBar";
import Modal from "@/components/Modal/Modal";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Contas() {
  const [contas, setContas] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("Cartão de Crédito");
  const [saldo, setSaldo] = useState("");
  const [editConta, setEditConta] = useState<any>(null);
  const [deleteConta, setDeleteConta] = useState<any>(null);
  const router = useRouter();
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1);
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear());
  const [loadingContas, setLoadingContas] = useState(true);

  // Função para calcular saldo da conta
  async function calcularSaldo(conta: any) {
    const token = localStorage.getItem("token");
    if (!token) return 0;
    const res = await fetch(`/api/lancamentos?contaId=${conta.id}`, {
      headers: { Authorization: "Bearer " + token }
    });
    if (res.ok) {
      const lancamentos = await res.json();
      let saldo = 0;
      lancamentos.forEach((l: any) => {
        if (l.tipo === "Receita") saldo += Number(l.valor);
        if (l.tipo === "Despesa") saldo -= Number(l.valor);
      });
      return saldo;
    }
    return 0;
  }

  // Função para calcular saldo de despesas do mês/ano filtrado (considerando parcelas)
  async function calcularSaldoMes(conta: any) {
    const token = localStorage.getItem("token");
    if (!token) return 0;
    const res = await fetch(`/api/lancamentos?contaId=${conta.id}`, {
      headers: { Authorization: "Bearer " + token }
    });
    if (res.ok) {
      const lancamentos = await res.json();
      let saldo = 0;
      lancamentos.forEach((l: any) => {
        if (l.tipo === "Despesa") {
          if (l.parcelado && l.parcelasLancamento?.length) {
            l.parcelasLancamento.forEach((p: any) => {
              const data = new Date(p.dataVencimento);
              if (data.getMonth() + 1 === filtroMes && data.getFullYear() === filtroAno) {
                saldo += Number(p.valorParcela);
              }
            });
          } else {
            const data = new Date(l.data);
            if (data.getMonth() + 1 === filtroMes && data.getFullYear() === filtroAno) {
              saldo += Number(l.valor);
            }
          }
        }
      });
      return saldo;
    }
    return 0;
  }

  // Estado para armazenar saldos
  const [saldos, setSaldos] = useState<{ [key: number]: number }>({});
  // Estado para armazenar saldos filtrados
  const [saldosMes, setSaldosMes] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    async function atualizarSaldos() {
      const novosSaldos: { [key: number]: number } = {};
      for (const conta of contas) {
        novosSaldos[conta.id] = await calcularSaldo(conta);
      }
      setSaldos(novosSaldos);
    }
    if (contas.length > 0) atualizarSaldos();
  }, [contas]);

  useEffect(() => {
    async function atualizarSaldosMes() {
      const novosSaldos: { [key: number]: number } = {};
      for (const conta of contas) {
        novosSaldos[conta.id] = await calcularSaldoMes(conta);
      }
      setSaldosMes(novosSaldos);
    }
    if (contas.length > 0) atualizarSaldosMes();
  }, [contas, filtroMes, filtroAno]);

  useEffect(() => {
    async function fetchContas() {
      const token = localStorage.getItem("token");
      if (!token) return setLoadingContas(false);
      const res = await fetch("/api/contas", {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) setContas(await res.json());
      setLoadingContas(false);
    }
    fetchContas();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch("/api/contas", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ nome, tipo })
    });
    if (res.ok) {
      setModalOpen(false);
      setNome("");
      setTipo("Cartão de Crédito");
      // Atualiza lista
      const contasRes = await fetch("/api/contas", { headers: { Authorization: "Bearer " + token } });
      if (contasRes.ok) setContas(await contasRes.json());
    }
  }

  function openEditModal(conta: any) {
    setEditConta(conta);
    setNome(conta.nome);
    setTipo(conta.tipo);
    setModalEdit(true);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !editConta) return;
    const res = await fetch("/api/contas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ id: editConta.id, nome, tipo })
    });
    if (res.ok) {
      setModalEdit(false);
      setNome("");
      setTipo("Cartão de Crédito");
      setEditConta(null);
      // Atualiza lista
      const contasRes = await fetch("/api/contas", { headers: { Authorization: "Bearer " + token } });
      if (contasRes.ok) setContas(await contasRes.json());
    }
  }

  function openDeleteModal(conta: any) {
    setDeleteConta(conta);
    setModalDelete(true);
  }

  async function handleDelete() {
    const token = localStorage.getItem("token");
    if (!token || !deleteConta) return;
    await fetch(`/api/contas?id=${deleteConta.id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    });
    setModalDelete(false);
    setDeleteConta(null);
    // Atualiza lista
    const contasRes = await fetch("/api/contas", { headers: { Authorization: "Bearer " + token } });
    if (contasRes.ok) setContas(await contasRes.json());
  }

  return (
    <div>
      <SideBar />
      <main className={styles.mainContent}>
        <h1 className="title">Minhas Contas</h1>
        <button className={styles.addButton} onClick={() => setModalOpen(true)}>
          + Adicionar Conta
        </button>
        <div style={{ marginBottom: 18, display: 'flex', gap: 6, background: '#10294A', borderRadius: 10, padding: '12px 16px', alignItems: 'center', width: 'fit-content' }}>
          <span style={{ color: '#A5B3C7', fontSize: 14, marginRight: 4 }}>Mês:</span>
          <select value={filtroMes} onChange={e => setFiltroMes(Number(e.target.value))} style={{ background: '#142B4D', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', marginRight: 12 }}>
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>{(i+1).toString().padStart(2, '0')}</option>
            ))}
          </select>
          <select value={filtroAno} onChange={e => setFiltroAno(Number(e.target.value))} style={{ background: '#142B4D', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px' }}>
            {[...Array(5)].map((_, i) => {
              const ano = new Date().getFullYear() - 2 + i;
              return <option key={ano} value={ano}>{ano}</option>
            })}
          </select>
        </div>
        {loadingContas ? (
          <div className={styles.card} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180, height: '180px' }}>
            <LoadingSpinner size={48} inline />
          </div>
        ) : (
          <div className={styles.card}>
            <h2 className={styles.tableTitle}>Lista de Contas</h2>
            {contas.length === 0 ? (
              <div style={{ color: '#A5B3C7', textAlign: 'center', padding: 24 }}>Nenhuma conta cadastrada.</div>
            ) : (
              <table className={styles.tableMetas}>
                <thead>
                  <tr>
                    <th>Nome da Conta</th>
                    <th>Tipo</th>
                    <th>Saldo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contas.map((conta) => (
                    <tr key={conta.id}>
                      <td style={{ cursor: "pointer", color: "#00D1B2" }} onClick={() => router.push(`/contas/${conta.id}`)}>{conta.nome}</td>
                      <td>{conta.tipo || '-'}</td>
                      <td>R$ {saldosMes[conta.id] !== undefined ? Math.abs(Number(saldosMes[conta.id])).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</td>
                      <td className={styles.actionCell}>
                        <button className={styles.actionBtn} onClick={() => openEditModal(conta)}>Editar</button>
                        <button className={styles.actionBtn} onClick={() => openDeleteModal(conta)}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <h2 className={styles.modalTitle}>Adicionar Conta</h2>
          <form className={styles.formMeta} onSubmit={handleSubmit}>
            <label className={styles.labelMeta}>Nome da Conta</label>
            <input
              className={styles.inputMeta}
              type="text"
              placeholder="Ex: Mercado, Nubank, PicPay"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
            />
            <label className={styles.labelMeta}>Tipo</label>
            <select
              className={styles.inputMeta}
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              required
            >
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Carteira Digital">Carteira Digital</option>
              <option value="Espécie">Espécie</option>
              <option value="Conta Corrente">Conta Corrente</option>
              <option value="Conta Poupança">Conta Poupança</option>
              <option value="Outro">Outro</option>
            </select>
            <button className={styles.buttonMeta} type="submit">Adicionar Conta</button>
          </form>
        </Modal>
        <Modal open={modalEdit} onClose={() => setModalEdit(false)}>
          <h2 className={styles.modalTitle}>Editar Conta</h2>
          <form className={styles.formMeta} onSubmit={handleEditSubmit}>
            <label className={styles.labelMeta}>Nome da Conta</label>
            <input
              className={styles.inputMeta}
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
            />
            <label className={styles.labelMeta}>Tipo</label>
            <select
              className={styles.inputMeta}
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              required
            >
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Carteira Digital">Carteira Digital</option>
              <option value="Espécie">Espécie</option>
              <option value="Conta Corrente">Conta Corrente</option>
              <option value="Conta Poupança">Conta Poupança</option>
              <option value="Outro">Outro</option>
            </select>
            <button className={styles.buttonMeta} type="submit">Salvar Alterações</button>
          </form>
        </Modal>
        <Modal open={modalDelete} onClose={() => setModalDelete(false)}>
          <h2 className={styles.modalTitle}>Confirmar Exclusão</h2>
          <p style={{ color: '#A5B3C7', marginBottom: 24 }}>Tem certeza que deseja excluir esta conta?</p>
          <div style={{ display: 'flex', gap: 16 }}>
            <button className={styles.buttonMeta} style={{ background: '#00D1B2', color: '#081B33' }} onClick={handleDelete}>
              Confirmar
            </button>
            <button className={styles.buttonMeta} style={{ background: '#223B5A', color: '#fff' }} onClick={() => setModalDelete(false)}>
              Cancelar
            </button>
          </div>
        </Modal>
      </main>
    </div>
  );
} 