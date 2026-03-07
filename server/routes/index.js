const express = require('express');
const router = express.Router();
const analyzeRoutes = require('./analyzeRoutes');
const healthRoutes = require('./healthRoutes');
const historyRoutes = require('./historyRoutes');
const githubRoutes = require('./githubRoutes');
const webhookRoutes = require('./webhookRoutes');

router.use('/', healthRoutes);
router.use('/', analyzeRoutes);
router.use('/', historyRoutes);
router.use('/', githubRoutes);
router.use('/', webhookRoutes);

module.exports = router;