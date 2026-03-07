const express = require('express');
const { analyzeRepoController } = require('../controllers');
const { validateAnalyzeRepoRequest } = require('../middleware/validation');

const router = express.Router();

router.post('/analyze-repo', validateAnalyzeRepoRequest, analyzeRepoController);

module.exports = router;
