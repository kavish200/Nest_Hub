const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173'
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'NestHub API is running',
    docs: ['GET /api/health']
  });
});

app.use('/api', healthRoutes);

module.exports = app;
