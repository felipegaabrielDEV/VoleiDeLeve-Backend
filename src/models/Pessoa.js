import mongoose from "mongoose";

const PessoaSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    telefone: { type: String, required: true, trim: true },
    tipo: { type: String, required: true, enum: ["MENSALISTA", "DIARISTA"] },
    ativo: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Pessoa", PessoaSchema);
