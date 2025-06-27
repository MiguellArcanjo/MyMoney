-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tokenExpiracao" TIMESTAMP(3),
ADD COLUMN     "tokenVerificacao" TEXT;
