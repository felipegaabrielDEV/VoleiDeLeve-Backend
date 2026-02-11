import { Router } from "express";
import {
  listarParticipacoes,
  entrarNaSessao,
  atualizarPagamento,
  sairDaSessao
} from "../controllers/participacoes.controller.js";

const router = Router();

router.get("/", listarParticipacoes);
router.post("/entrar", entrarNaSessao);
router.patch("/:id/pagamento", atualizarPagamento);
router.delete("/:id", sairDaSessao);

export default router;
