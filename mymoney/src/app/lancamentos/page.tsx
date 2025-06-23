"use client";

import { useEffect, useState } from "react";
import SideBar from "@/components/SideBar/sideBar";
import Modal from "@/components/Modal/Modal";
import styles from "../contas/page.module.css";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Lancamentos() {
  const [contas, setContas] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [contaFiltro, setContaFiltro] = useState(0);
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1);
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear());
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingContas, setLoadingContas] = useState(true);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loadingLancamentos, setLoadingLancamentos] = useState(true);

  // Buscar contas
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

  // Buscar categorias
  useEffect(() => {
    async function fetchCategorias() {
      const token = localStorage.getItem("token");
      if (!token) return setLoadingCategorias(false);
      const res = await fetch("/api/categorias", {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) setCategorias(await res.json());
      setLoadingCategorias(false);
    }
    fetchCategorias();
  }, []);

  // Buscar lançamentos (todos ou filtrados por conta)
  useEffect(() => {
    async function fetchLancamentos() {
      const token = localStorage.getItem("token");
      if (!token) return setLoadingLancamentos(false);
      let url = "/api/lancamentos";
      if (contaFiltro) url += `?contaId=${contaFiltro}`;
      const res = await fetch(url, {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.ok) setLancamentos(await res.json());
      setLoadingLancamentos(false);
    }
    fetchLancamentos();
  }, [contaFiltro]);

  // Lançamentos filtrados
  const lancamentosFiltrados = lancamentos
    .flatMap(l => {
      if (l.parcelado && l.parcelasLancamento?.length) {
        return l.parcelasLancamento
          .filter((p: any) => {
            const data = new Date(p.dataVencimento);
            return data.getMonth() + 1 === filtroMes && data.getFullYear() === filtroAno;
          })
          .map((p: any) => ({
            ...l,
            valor: p.valorParcela,
            data: p.dataVencimento,
            parcelaInfo: `${p.numeroParcela}/${l.parcelas}`,
            statusParcela: p.status,
            idParcela: p.id
          }));
      } else {
        const data = new Date(l.data);
        if (data.getMonth() + 1 === filtroMes && data.getFullYear() === filtroAno) {
          return [{ ...l }];
        }
        return [];
      }
    })
    .filter(l =>
      (filtroCategoria === 'Todas' || l.categoria?.nome === filtroCategoria) &&
      (filtroTipo === 'Todos' || l.tipo === filtroTipo)
    );

  // Calcular total gasto no mês (apenas despesas filtradas)
  const totalGastoMes = lancamentosFiltrados
    .filter(l => l.tipo === "Despesa")
    .reduce((acc, l) => acc + Number(l.valor), 0);

  const carregando = loadingContas || loadingCategorias || loadingLancamentos;

  return (
    <div>
      <SideBar />
      <main className={styles.mainContent}>
        <h1 className={styles.title}>Lançamentos</h1>
        <div style={{ display: 'flex', gap: 32, marginBottom: 24 }}>
          <div style={{ background: '#0E2A4C', borderRadius: 12, padding: 24, minWidth: 340, border: '2px dashed #3A4B6A', marginBottom: 8 }}>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Total Gasto no Mês:</h2>
            <div style={{ color: '#00D1B2', fontSize: 24, fontWeight: 700 }}>
              R$ {Math.abs(totalGastoMes).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
        <button className={styles.addButton} onClick={() => setModalOpen(true)}>+ Adicionar Lançamento</button>
        <div style={{ marginBottom: 18, display: 'flex', gap: 6, background: '#10294A', borderRadius: 10, padding: '12px 16px', alignItems: 'center', width: 'fit-content', flexWrap: 'wrap' }}>
          <span style={{ color: '#A5B3C7', fontSize: 14, marginRight: 4 }}>Conta:</span>
          <select value={contaFiltro} onChange={e => setContaFiltro(Number(e.target.value))} style={{ background: '#142B4D', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', marginRight: 12 }}>
            <option value={0}>Todas</option>
            {contas.map(conta => (
              <option key={conta.id} value={conta.id}>{conta.nome}</option>
            ))}
          </select>
          <span style={{ color: '#A5B3C7', fontSize: 14, marginRight: 4 }}>Categoria:</span>
          <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} style={{ background: '#142B4D', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', marginRight: 12 }}>
            <option value="Todas">Todas</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.nome}>{cat.nome}</option>
            ))}
          </select>
          <span style={{ color: '#A5B3C7', fontSize: 14, marginRight: 4 }}>Tipo:</span>
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} style={{ background: '#142B4D', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', marginRight: 12 }}>
            <option value="Todos">Todos</option>
            <option value="Despesa">Despesa</option>
            <option value="Receita">Receita</option>
          </select>
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
        {carregando ? (
          <div className={styles.card} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180, height: '180px' }}>
            <LoadingSpinner size={48} inline />
          </div>
        ) : (
          <div className={styles.card} style={{ marginTop: 24 }}>
            <h2 className={styles.tableTitle}>Lançamentos</h2>
            {lancamentosFiltrados.length === 0 ? (
              <div style={{ color: '#A5B3C7', textAlign: 'center', padding: 24 }}>Nenhum lançamento encontrado.</div>
            ) : (
              <table className={styles.tableMetas}>
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Conta</th>
                    <th>Categoria</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Parcelado</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {lancamentosFiltrados.map((l: any) => (
                    <tr key={l.id + (l.idParcela ? `-p${l.idParcela}` : '')}>
                      <td>{l.descricao}</td>
                      <td>{contas.find(c => c.id === l.contaId)?.nome || '-'}</td>
                      <td>{l.categoria?.nome || '-'}</td>
                      <td style={{ color: l.tipo === 'Despesa' ? '#FF5C5C' : '#00D1B2' }}>{l.tipo}</td>
                      <td style={{ color: l.tipo === 'Despesa' ? '#FF5C5C' : '#00D1B2' }}>
                        R$ {l.tipo === 'Despesa' ? '-' : '+'}{Math.abs(Number(l.valor)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td>{l.parcelado ? (l.parcelaInfo || 'Sim') : 'Não'}</td>
                      <td>{l.data ? new Date(l.data).toLocaleDateString('pt-BR') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <div className={styles.modalTitle}>Adicionar Lançamento (em breve)</div>
          {/* Aqui entrará o formulário de cadastro/edição */}
        </Modal>
      </main>
    </div>
  );
} 