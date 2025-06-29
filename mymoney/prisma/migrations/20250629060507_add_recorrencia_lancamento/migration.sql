-- AlterTable
ALTER TABLE "Lancamento" ADD COLUMN     "dataTermino" TIMESTAMP(3),
ADD COLUMN     "frequencia" TEXT,
ADD COLUMN     "recorrente" BOOLEAN NOT NULL DEFAULT false;
