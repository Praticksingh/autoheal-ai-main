const express = require('express');
const { getHealthController } = require('../controllers');

const router = express.Router();

router.get('/health', getHealthController);

module.exports = router;
