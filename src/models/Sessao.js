import mongoose from "mongoose";

const SessaoSchema = new mongoose.Schema(
  {
    dataSessao: { type: Date, required: true },
    status: {
      type: String,
      enum: ["ABERTA", "FECHADA", "CANCELADA"],
      default: "ABERTA",
      required: true
    },
    horarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Horario",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Sessao", SessaoSchema);
