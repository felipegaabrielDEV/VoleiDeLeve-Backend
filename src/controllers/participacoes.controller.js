import { z } from "zod";
import Participacao from "../models/Participacao.js";
import Pessoa from "../models/Pessoa.js";
import Sessao from "../models/Sessao.js";

const entrarSchema = z.object({
  // ✅ opcional: se não vier, usamos req.user.pessoaId (do JWT)
  pessoaId: z.string().min(10).optional(),
  sessaoId: z.string().min(10),

  // ✅ opcional: permite o app escolher Mensalista/Diarista no botão
  tipo: z.enum(["MENSALISTA", "DIARISTA"]).optional()
});

const pagarSchema = z.object({
  pago: z.boolean(),
  valorCobrado: z.number().min(0).optional()
});

// GET /participacoes?sessaoId=...
export async function listarParticipacoes(req, res, next) {
  try {
    const { sessaoId } = req.query;

    const filtro = {};
    if (sessaoId) filtro.sessaoId = sessaoId;

    const lista = await Participacao.find(filtro)
      .populate("pessoaId")
      .populate({
        path: "sessaoId",
        populate: { path: "horarioId" }
      })
      .sort({ ordemLista: 1, createdAt: 1 });

    return res.json(lista);
  } catch (err) {
    next(err);
  }
}

// POST /participacoes/entrar
export async function entrarNaSessao(req, res, next) {
  try {
    const parsed = entrarSchema.parse(req.body);

    const sessaoId = parsed.sessaoId;
    const pessoaId = parsed.pessoaId ?? req.user?.pessoaId;
    const tipoEntrada = parsed.tipo; // pode vir do botão

    if (!pessoaId) {
      return res.status(400).json({ message: "pessoaId não informado (faça login novamente)" });
    }

    const pessoa = await Pessoa.findById(pessoaId);
    if (!pessoa || !pessoa.ativo) {
      return res.status(404).json({ message: "Pessoa não encontrada ou inativa" });
    }

    const sessao = await Sessao.findById(sessaoId).populate("horarioId");
    if (!sessao) return res.status(404).json({ message: "Sessão não encontrada" });
    if (sessao.status !== "ABERTA") {
      return res.status(400).json({ message: "Sessão não está aberta" });
    }

    // Contagem atual de vagas ocupadas (ativas) na sessão
    const ocupadas = await Participacao.countDocuments({ sessaoId, ativo: true });

    const limite = sessao.horarioId?.limitesVagas ?? 0;
    if (limite <= 0) {
      return res.status(400).json({ message: "Horário sem limite de vagas configurado" });
    }

    if (ocupadas >= limite) {
      return res.status(400).json({ message: "Sessão lotada" });
    }

    // Define tipo efetivo (se veio do botão, usa ele; senão usa o tipo cadastrado na Pessoa)
    const tipoEfetivo = tipoEntrada ?? pessoa.tipo;

    // ordemLista: para diaristas, coloca o próximo número
    let ordemLista = 0;
    if (tipoEfetivo === "DIARISTA") {
      const last = await Participacao.findOne({ sessaoId })
        .sort({ ordemLista: -1 })
        .select("ordemLista");
      ordemLista = (last?.ordemLista ?? 0) + 1;
    }

    const valorCobrado = tipoEfetivo === "MENSALISTA" ? 42 : 12;

    const participacao = await Participacao.create({
      pessoaId,
      sessaoId,
      ordemLista,
      pago: false,
      valorCobrado,
      ativo: true
    });

    const completa = await Participacao.findById(participacao._id)
      .populate("pessoaId")
      .populate({
        path: "sessaoId",
        populate: { path: "horarioId" }
      });

    return res.status(201).json(completa);
  } catch (err) {
    next(err);
  }
}

// PATCH /participacoes/:id/pagamento
export async function atualizarPagamento(req, res, next) {
  try {
    const { pago, valorCobrado } = pagarSchema.parse(req.body);

    const update = { pago };
    if (typeof valorCobrado === "number") update.valorCobrado = valorCobrado;

    const participacao = await Participacao.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    )
      .populate("pessoaId")
      .populate({
        path: "sessaoId",
        populate: { path: "horarioId" }
      });

    if (!participacao) {
      return res.status(404).json({ message: "Participação não encontrada" });
    }

    return res.json(participacao);
  } catch (err) {
    next(err);
  }
}

// DELETE /participacoes/:id (desativa)
export async function sairDaSessao(req, res, next) {
  try {
    const participacao = await Participacao.findByIdAndUpdate(
      req.params.id,
      { ativo: false },
      { new: true }
    );

    if (!participacao) {
      return res.status(404).json({ message: "Participação não encontrada" });
    }

    return res.json({ message: "Participação desativada", participacao });
  } catch (err) {
    next(err);
  }
}
