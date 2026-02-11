import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import {
  listarHorarios,
  criarHorario,
  atualizarHorario
} from "../controllers/horarios.controller.js";

const router = Router();

router.get("/", listarHorarios);
router.post("/", auth, isAdmin, criarHorario);
router.patch("/:id", auth, isAdmin, atualizarHorario);

export default router;
