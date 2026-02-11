import mongoose from "mongoose";

export async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI não carregou. Verifique o arquivo .env.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB conectado (Atlas)");
  } catch (err) {
    console.error("❌ Erro ao conectar no MongoDB:", err.message);
    process.exit(1);
  }
}
