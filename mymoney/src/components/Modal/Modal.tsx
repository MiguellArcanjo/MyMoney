import React, { useEffect, createContext, useContext } from "react";
import styles from "./modal.module.css";
import { useSidebar } from "../SideBar/SidebarContext";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const ModalContext = createContext({ open: false });

export default function Modal({ open, onClose, children }: ModalProps) {
  const { setIsOpen } = useSidebar();

  useEffect(() => {
    if (open) {
      setIsOpen(false);
      document.body.style.overflowY = 'hidden';
    } else {
      document.body.style.overflowY = '';
    }
    return () => { document.body.style.overflowY = ''; };
  }, [open, setIsOpen]);

  if (!open) return null;
  return (
    <ModalContext.Provider value={{ open }}>
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
} 
