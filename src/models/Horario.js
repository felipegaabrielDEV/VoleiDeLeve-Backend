import mongoose from "mongoose";

const HorarioSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    horaInicio: { type: String, required: true }, // ex: "18:30"
    horaFim: { type: String, required: true },    // ex: "20:30"
    limitesVagas: { type: Number, required: true, min: 1 }
  },
  { timestamps: true }
);

export default mongoose.model("Horario", HorarioSchema);
