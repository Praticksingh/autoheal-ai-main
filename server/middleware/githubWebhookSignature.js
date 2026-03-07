const crypto = require('crypto');

function createAuthError(message, statusCode = 401) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function verifyGithubWebhookSignature(req, res, next) {
  try {
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw createAuthError('GITHUB_WEBHOOK_SECRET is not configured on the server', 500);
    }

    const signatureHeader = req.header('x-hub-signature-256');
    if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
      throw createAuthError('Missing or invalid x-hub-signature-256 header');
    }

    if (!Buffer.isBuffer(req.body)) {
      throw createAuthError('Invalid webhook body format', 400);
    }

    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body)
      .digest('hex')}`;

    const signatureBuffer = Buffer.from(signatureHeader, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

    if (
      signatureBuffer.length !== expectedBuffer.length
      || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      throw createAuthError('Webhook signature verification failed');
    }

    const parsedPayload = JSON.parse(req.body.toString('utf8'));
    req.webhookPayload = parsedPayload;

    return next();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return next(createAuthError('Webhook payload is not valid JSON', 400));
    }

    return next(error);
  }
}

module.exports = {
  verifyGithubWebhookSignature,
};
