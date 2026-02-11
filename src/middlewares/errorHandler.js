export function errorHandler(err, req, res, next) {
  // Zod
  if (err?.name === "ZodError") {
    return res.status(400).json({
      message: "Dados inválidos",
      issues: err.issues
    });
  }

  // Mongoose duplicate key (ex: unique)
  if (err?.code === 11000) {
    return res.status(400).json({
      message: "Dado duplicado",
      details: err.keyValue
    });
  }

  console.error(err);
  return res.status(500).json({ message: "Erro interno no servidor" });
}
