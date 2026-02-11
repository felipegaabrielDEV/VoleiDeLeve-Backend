import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import pessoasRoutes from "./routes/pessoas.routes.js";
import horariosRoutes from "./routes/horarios.routes.js";
import sessoesRoutes from "./routes/sessoes.routes.js";
import participacoesRoutes from "./routes/participacoes.routes.js";

import { auth } from "./middlewares/auth.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

// health check
app.get("/", (req, res) => res.json({ ok: true, api: "Vôlei de Leve" }));

// rotas públicas
app.use("/auth", authRoutes);
app.use("/horarios", horariosRoutes);
app.use("/sessoes", sessoesRoutes);

// rotas protegidas (precisa token)
app.use("/pessoas", auth, pessoasRoutes);
app.use("/participacoes", auth, participacoesRoutes);

// middleware de erro (SEMPRE por último)
app.use(errorHandler);

export default app;
