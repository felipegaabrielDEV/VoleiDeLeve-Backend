import { z } from "zod";
import Sessao from "../models/Sessao.js";
import Horario from "../models/Horario.js";

// Validação para criar sessão
const criarSessaoSchema = z.object({
  dataSessao: z.string().min(8, "dataSessao inválida"), // vamos receber string e converter p/ Date
  horarioId: z.string().min(10, "horarioId inválido")
});

// Validação para mudar status
const statusSchema = z.object({
  status: z.enum(["ABERTA", "FECHADA", "CANCELADA"])
});

// GET /sessoes
export async function listarSessoes(req, res, next) {
  try {
    const sessoes = await Sessao.find()
      .populate("horarioId")
      .sort({ dataSessao: -1 });

    return res.json(sessoes);
  } catch (err) {
    return next(err);
  }
}

// POST /sessoes
// Cria uma sessão vinculada a um horário
export async function criarSessao(req, res, next) {
  try {
    const dados = criarSessaoSchema.parse(req.body);

    const horarioExiste = await Horario.findById(dados.horarioId);
    if (!horarioExiste) {
      return res.status(404).json({ message: "Horário não encontrado" });
    }

    const data = new Date(dados.dataSessao);
    if (isNaN(data.getTime())) {
      return res.status(400).json({ message: "dataSessao inválida (use formato ISO)" });
    }

    // Evita duplicar sessão do mesmo horário na mesma data/hora
    const jaExiste = await Sessao.findOne({
      horarioId: dados.horarioId,
      dataSessao: data
    });

    if (jaExiste) {
      return res.status(400).json({ message: "Já existe sessão para esse horário nessa data/hora" });
    }

    const sessao = await Sessao.create({
      dataSessao: data,
      horarioId: dados.horarioId,
      status: "ABERTA"
    });

    const sessaoPopulada = await Sessao.findById(sessao._id).populate("horarioId");
    return res.status(201).json(sessaoPopulada);
  } catch (err) {
    return next(err);
  }
}

// PATCH /sessoes/:id/status
export async function atualizarStatusSessao(req, res, next) {
  try {
    const { status } = statusSchema.parse(req.body);

    const sessao = await Sessao.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("horarioId");

    if (!sessao) {
      return res.status(404).json({ message: "Sessão não encontrada" });
    }

    return res.json(sessao);
  } catch (err) {
    return next(err);
  }
}
