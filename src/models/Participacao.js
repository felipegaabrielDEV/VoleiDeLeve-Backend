import mongoose from "mongoose";

const ParticipacaoSchema = new mongoose.Schema(
  {
    pessoaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pessoa",
      required: true
    },
    sessaoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sessao",
      required: true
    },

    dataRegistro: { type: Date, default: Date.now },
    pago: { type: Boolean, default: false },
    valorCobrado: { type: Number, default: 0, min: 0 },

    ordemLista: { type: Number, default: 0, min: 0 }, // útil pros diaristas
    ativo: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Evita duplicar a mesma pessoa na mesma sessão
ParticipacaoSchema.index({ pessoaId: 1, sessaoId: 1 }, { unique: true });

export default mongoose.model("Participacao", ParticipacaoSchema);
