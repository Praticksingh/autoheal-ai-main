const express = require('express');
const { getHistoryController } = require('../controllers');
const { validateHistoryQuery } = require('../middleware/validation');

const router = express.Router();

router.get('/history', validateHistoryQuery, getHistoryController);

module.exports = router;
