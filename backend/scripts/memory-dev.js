const { spawn } = require('child_process');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function main() {
  const mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri('smart_crm_db');
  const env = {
    ...process.env,
    MONGO_URI: uri,
    JWT_SECRET: 'local-verification-secret-not-for-production-use',
    JWT_EXPIRES_IN: '7d',
    CLIENT_URL: process.env.SMART_CRM_CLIENT_URL || 'http://localhost:5173',
    NODE_ENV: 'development',
    PORT: '5000',
  };

  const seed = spawn(process.execPath, ['seed/seed.js'], { env, stdio: 'inherit' });
  seed.on('exit', (code) => {
    if (code !== 0) {
      mongo.stop().finally(() => process.exit(code || 1));
      return;
    }
    const server = spawn(process.execPath, ['server.js'], { env, stdio: 'inherit' });
    const shutdown = () => {
      server.kill();
      mongo.stop().finally(() => process.exit(0));
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
