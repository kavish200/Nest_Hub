const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const envCandidates = [
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), '.env')
];
const envPath = envCandidates.find((candidate) => fs.existsSync(candidate));
dotenv.config(envPath ? { path: envPath } : undefined);

if (envPath) {
  console.log(`Loaded environment from ${envPath}`);
} else {
  console.warn('No .env file found. Using system environment variables only.');
}

const app = require('./app');
const connectDB = require('./config/db');

const port = process.env.PORT || 5000;
const host = process.env.HOST || '127.0.0.1';

const startServer = async () => {
  try {
    const dbConnected = await connectDB();
    if (!dbConnected) {
      console.warn('Starting API without database connection. Check MONGO_URI / MongoDB status.');
    }
    const server = app.listen(port, host, () => {
      console.log(`NestHub backend listening on http://${host}:${port}`);
    });
    server.on('error', (error) => {
      if (error.code === 'EPERM') {
        console.error(
          `Server bind blocked by environment on ${host}:${port}. ` +
            'This is not an app-code bug; run the server in a normal local terminal.'
        );
        process.exit(1);
      }
      console.error(`Failed to bind server on ${host}:${port}: ${error.message}`);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start backend:', error.message);
    process.exit(1);
  }
};

startServer();
