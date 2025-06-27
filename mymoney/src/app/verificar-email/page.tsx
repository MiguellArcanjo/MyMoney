import { Suspense } from "react";
import VerificarEmail from "@/components/Verificar-email/verificarEmail";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <VerificarEmail />
    </Suspense>
  );
}
