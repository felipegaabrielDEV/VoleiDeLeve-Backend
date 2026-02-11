import Pessoa from "../models/Pessoa.js";
import { z } from "zod";

const pessoaSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  telefone: z.string().min(8, "Telefone inválido"),
  tipo: z.enum(["MENSALISTA", "DIARISTA"]),
  ativo: z.boolean().optional()
});

export async function listarPessoas(req, res, next) {
  try {
    const pessoas = await Pessoa.find().sort({ createdAt: -1 });
    return res.json(pessoas);
  } catch (err) {
    next(err);
  }
}

export async function criarPessoa(req, res, next) {
  try {
    const dados = pessoaSchema.parse(req.body);
    const pessoa = await Pessoa.create(dados);
    return res.status(201).json(pessoa);
  } catch (err) {
    next(err);
  }
}

export async function atualizarPessoa(req, res, next) {
  try {
    const dados = pessoaSchema.partial().parse(req.body);

    const pessoa = await Pessoa.findByIdAndUpdate(
      req.params.id,
      dados,
      { new: true }
    );

    if (!pessoa) return res.status(404).json({ message: "Pessoa não encontrada" });

    return res.json(pessoa);
  } catch (err) {
    next(err);
  }
}

// Em vez de deletar, a gente “desativa”
export async function desativarPessoa(req, res, next) {
  try {
    const pessoa = await Pessoa.findByIdAndUpdate(
      req.params.id,
      { ativo: false },
      { new: true }
    );

    if (!pessoa) return res.status(404).json({ message: "Pessoa não encontrada" });

    return res.json({ message: "Pessoa desativada", pessoa });
  } catch (err) {
    next(err);
  }
}
