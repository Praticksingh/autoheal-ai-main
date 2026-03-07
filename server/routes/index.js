const express = require('express');
const router = express.Router();
const analyzeRoutes = require('./analyzeRoutes');
const healthRoutes = require('./healthRoutes');
const historyRoutes = require('./historyRoutes');

router.use('/', healthRoutes);
router.use('/', analyzeRoutes);
router.use('/', historyRoutes);

module.exports = router;