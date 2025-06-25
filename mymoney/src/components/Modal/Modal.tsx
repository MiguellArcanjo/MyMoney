import React, { useEffect } from "react";
import styles from "./modal.module.css";
import { useSidebar } from "../SideBar/SidebarContext";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, children }: ModalProps) {
  const { setIsOpen } = useSidebar();

  useEffect(() => {
    if (open) {
      // Fechar a sidebar quando o modal abrir
      setIsOpen(false);
    }
  }, [open, setIsOpen]);

  if (!open) return null;
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
} 