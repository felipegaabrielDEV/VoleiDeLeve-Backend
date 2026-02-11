import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import {
  listarPessoas,
  criarPessoa,
  atualizarPessoa,
  desativarPessoa
} from "../controllers/pessoas.controller.js";

const router = Router();

router.get("/", listarPessoas);
router.post("/", auth, isAdmin, criarPessoa);
router.patch("/:id", auth, isAdmin, atualizarPessoa);
router.delete("/:id", auth, isAdmin, desativarPessoa);

export default router;
