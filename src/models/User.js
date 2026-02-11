import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    senhaHash: { type: String, required: true },

    // ✅ Papel do usuário
    role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },

    // ✅ Vínculo com Pessoa (quem participa das sessões)
    pessoaId: { type: mongoose.Schema.Types.ObjectId, ref: "Pessoa", required: false },

    // ✅ Dados básicos para criar Pessoa automaticamente (opcional)
    telefone: { type: String, trim: true, required: false }
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
