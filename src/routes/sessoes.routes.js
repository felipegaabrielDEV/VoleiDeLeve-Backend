import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import {
  listarSessoes,
  criarSessao,
  atualizarStatusSessao
} from "../controllers/sessoes.controller.js";

const router = Router();

router.get("/", listarSessoes);
router.post("/", auth, isAdmin, criarSessao);
router.patch("/:id/status", auth, isAdmin, atualizarStatusSessao);

export default router;
