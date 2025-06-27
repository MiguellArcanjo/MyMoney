import { Suspense } from "react";
import RedefinirSenha from "@/components/Redefinir-senha/redefinirSenha";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <RedefinirSenha />
    </Suspense>
  );
}
