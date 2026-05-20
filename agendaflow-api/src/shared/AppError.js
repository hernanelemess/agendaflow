// Cria um erro operacional com statusCode para o errorHandler capturar
function AppError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

module.exports = { AppError };