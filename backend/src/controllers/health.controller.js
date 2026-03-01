const mongoose = require('mongoose');

const health = (req, res) => {
  const readyStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.status(200).json({
    status: 'ok',
    service: 'nesthub-backend',
    timestamp: new Date().toISOString(),
    database: {
      status: readyStateMap[mongoose.connection.readyState] || 'unknown',
      name: mongoose.connection.name || null
    }
  });
};

module.exports = { health };
