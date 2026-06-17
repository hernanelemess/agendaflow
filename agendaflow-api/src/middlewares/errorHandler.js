function errorHandler(err, req, res, next) {
  console.error("🔥 ERRO CAPTURADO:");
  console.error(err);

  // Erros de validação Joi
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.details.map((d) => d.message),
    });
  }

  // Erros operacionais conhecidos
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Chave duplicada MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'Registro duplicado.',
    });
  }

  // Erro inesperado
  return res.status(500).json({
    error: err.message || 'Erro interno do servidor',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}

module.exports = { errorHandler };