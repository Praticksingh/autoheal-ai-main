const express = require('express');
const { commitFixController } = require('../controllers');

const router = express.Router();

router.post('/github/commit-fix', commitFixController);

module.exports = router;
