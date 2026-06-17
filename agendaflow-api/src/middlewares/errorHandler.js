function errorHandler(err, req, res, next) {
  // Erros de validação Joi
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.details.map((d) => d.message),
    });
  }

  // Erros operacionais conhecidos (lançados pelo sistema)
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Erro de chave duplicada no MySQL (ex: email já cadastrado)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Registro duplicado.' });
  }

  // Qualquer outro erro inesperado
  app.use((err, req, res, next) => {
    console.error("🔥 ERRO CAPTURADO:");
    console.error(err); // <-- ISSO MOSTRA A CAUSA REAL

    return res.status(err.status || 500).json({
      error: err.message,
      stack: err.stack, // só dev
    });
  });
}

module.exports = { errorHandler };