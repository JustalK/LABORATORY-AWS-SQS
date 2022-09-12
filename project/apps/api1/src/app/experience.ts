const express = require('express');
const AWS = require('aws-sdk');
const router = express.Router();

router.get('/health', (req, res) => {
  res.send({ status: 'working' });
});

module.exports = router;
