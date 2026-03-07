const express = require('express');
const { githubWebhookController } = require('../controllers');
const { verifyGithubWebhookSignature } = require('../middleware/githubWebhookSignature');

const router = express.Router();

router.post(
  '/webhooks/github',
  express.raw({ type: 'application/json' }),
  verifyGithubWebhookSignature,
  githubWebhookController
);

module.exports = router;
