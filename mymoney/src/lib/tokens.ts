import crypto from 'crypto';

export function gerarTokenVerificacao(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function gerarTokenRedefinicaoSenha(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function calcularExpiracao(horas: number = 24): Date {
  const agora = new Date();
  agora.setHours(agora.getHours() + horas);
  return agora;
}

export function tokenExpirado(dataExpiracao: Date): boolean {
  return new Date() > dataExpiracao;
} 