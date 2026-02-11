import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Pessoa from "../models/Pessoa.js";

const registerUserSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6),
  telefone: z.string().min(8),
  tipo: z.enum(["MENSALISTA", "DIARISTA"]).default("DIARISTA")
});

const registerAdminSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1)
});

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      pessoaId: user.pessoaId ? user.pessoaId.toString() : undefined
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ✅ Cadastro padrão (USER) + cria Pessoa vinculada
export async function register(req, res, next) {
  try {
    const { nome, email, senha, telefone, tipo } = registerUserSchema.parse(req.body);

    const jaExiste = await User.findOne({ email });
    if (jaExiste) return res.status(400).json({ message: "Email já cadastrado" });

    const senhaHash = await bcrypt.hash(senha, 10);

    const pessoa = await Pessoa.create({
      nome,
      telefone,
      tipo,
      ativo: true
    });

    const user = await User.create({
      nome,
      email,
      senhaHash,
      role: "USER",
      pessoaId: pessoa._id,
      telefone
    });

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: { id: user._id, nome: user.nome, email: user.email, role: user.role, pessoaId: pessoa._id },
      pessoa
    });
  } catch (err) {
    next(err);
  }
}

// ✅ Cadastro de ADMIN (protegido por secret opcional)
export async function registerAdmin(req, res, next) {
  try {
    const secret = process.env.ADMIN_REGISTER_SECRET;
    if (secret) {
      const sent = req.headers["x-admin-secret"];
      if (!sent || sent !== secret) {
        return res.status(403).json({ message: "Ação não permitida" });
      }
    }

    const { nome, email, senha } = registerAdminSchema.parse(req.body);

    const jaExiste = await User.findOne({ email });
    if (jaExiste) return res.status(400).json({ message: "Email já cadastrado" });

    const senhaHash = await bcrypt.hash(senha, 10);

    const user = await User.create({
      nome,
      email,
      senhaHash,
      role: "ADMIN"
    });

    return res.status(201).json({
      id: user._id,
      nome: user.nome,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    next(err);
  }
}

// ✅ Login retorna token + user + pessoaId (e garante Pessoa criada)
export async function login(req, res, next) {
  try {
    const { email, senha } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Credenciais inválidas" });

    const ok = await bcrypt.compare(senha, user.senhaHash);
    if (!ok) return res.status(401).json({ message: "Credenciais inválidas" });

    // Se por algum motivo o usuário não tem pessoa, cria automaticamente (com defaults)
    let pessoa = null;
    if (user.pessoaId) {
      pessoa = await Pessoa.findById(user.pessoaId);
    }
    if (!pessoa) {
      pessoa = await Pessoa.create({
        nome: user.nome,
        telefone: user.telefone || "00000000000",
        tipo: "DIARISTA",
        ativo: true
      });
      user.pessoaId = pessoa._id;
      await user.save();
    }

    const token = signToken(user);

    return res.json({
      token,
      user: { id: user._id, nome: user.nome, email: user.email, role: user.role, pessoaId: pessoa._id },
      pessoa
    });
  } catch (err) {
    next(err);
  }
}
