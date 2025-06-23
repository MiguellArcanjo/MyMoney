import React from "react";

export default function LoadingSpinner({ size = 48, inline = false }: { size?: number, inline?: boolean }) {
  if (inline) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <div style={{
          width: size,
          height: size,
          border: `${size * 0.13}px solid #223B5A`,
          borderTop: `${size * 0.13}px solid #00D1B2`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'rgba(8, 27, 51, 0.18)',
      zIndex: 9999
    }}>
      <div style={{
        width: size,
        height: size,
        border: `${size * 0.13}px solid #223B5A`,
        borderTop: `${size * 0.13}px solid #00D1B2`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 