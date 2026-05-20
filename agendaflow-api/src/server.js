const app = require('./app');
const { testConnection } = require('../database/connection');

const PORT = process.env.PORT || 3000;

async function start() {
  await testConnection();

  const server = app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown — fecha conexões limpamente ao encerrar
  process.on('SIGTERM', () => {
    console.log('SIGTERM recebido. Encerrando servidor...');
    server.close(() => process.exit(0));
  });
}

start();