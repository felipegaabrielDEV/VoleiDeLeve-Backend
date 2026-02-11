import Horario from "../models/Horario.js";
import { z } from "zod";

// Regras de validação para criar/editar um Horário
// (impede salvar dados errados no banco)
const horarioSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  horaInicio: z.string().min(4, "Hora início inválida"), // ex: "18:30"
  horaFim: z.string().min(4, "Hora fim inválida"),       // ex: "20:30"
  limitesVagas: z.number().int().min(1, "Deve ter pelo menos 1 vaga")
});

// GET /horarios
export async function listarHorarios(req, res, next) {
  try {
    const horarios = await Horario.find().sort({ createdAt: 1 });
    return res.json(horarios);
  } catch (err) {
    return next(err);
  }
}

// POST /horarios
export async function criarHorario(req, res, next) {
  try {
    // Valida o body
    const dados = horarioSchema.parse(req.body);

    // Evita duplicar o mesmo intervalo de horário (ex: 18:30-20:30)
    const existe = await Horario.findOne({
      horaInicio: dados.horaInicio,
      horaFim: dados.horaFim
    });

    if (existe) {
      return res.status(400).json({ message: "Horário já cadastrado" });
    }

    const horario = await Horario.create(dados);
    return res.status(201).json(horario);
  } catch (err) {
    return next(err);
  }
}

// PATCH /horarios/:id
export async function atualizarHorario(req, res, next) {
  try {
    // partial() permite atualizar apenas alguns campos
    const dados = horarioSchema.partial().parse(req.body);

    const horario = await Horario.findByIdAndUpdate(
      req.params.id,
      dados,
      { new: true }
    );

    if (!horario) {
      return res.status(404).json({ message: "Horário não encontrado" });
    }

    return res.json(horario);
  } catch (err) {
    return next(err);
  }
}
