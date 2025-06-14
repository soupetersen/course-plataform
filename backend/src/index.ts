import './server';

async function main() {
  const { buildApp } = await import('./server');
  const app = await buildApp();
  const port = parseInt(process.env.PORT || '3001');
  const host = process.env.HOST || '0.0.0.0';
  await app.listen({ port, host });
  app.log.info(`Server listening on http://${host}:${port}`);
}

main().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});
