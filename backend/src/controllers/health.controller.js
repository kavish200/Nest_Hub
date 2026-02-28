const health = (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'nesthub-backend',
    timestamp: new Date().toISOString()
  });
};

module.exports = { health };
