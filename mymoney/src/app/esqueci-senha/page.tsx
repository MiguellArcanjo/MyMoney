import { Suspense } from "react";
import EsqueciSenha from "@/components/Esqueci-senha/esqueciSenha";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <EsqueciSenha />
    </Suspense>
  );
}
