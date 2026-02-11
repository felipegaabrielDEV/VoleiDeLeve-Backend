import { Router } from "express";
import { login, register, registerAdmin } from "../controllers/auth.controller.js";

const router = Router();

// ✅ Cadastro padrão do app (USER + Pessoa)
router.post("/register", register);

// ✅ Cadastro de admin (opcionalmente protegido por ADMIN_REGISTER_SECRET + header x-admin-secret)
router.post("/register-admin", registerAdmin);

router.post("/login", login);

export default router;
