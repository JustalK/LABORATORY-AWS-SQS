import * as express from 'express';
const router = express.Router();
import { sendBatchMessage } from '@project/queue';

/**
 * Send a message
 */
router.get('/send', (_req: express.Request, res: express.Response<boolean>) => {
  const attributes = {
    Date: {
      DataType: 'String',
      StringValue: new Date().toString(),
    },
    Sender: {
      DataType: 'String',
      StringValue: 'API1',
    },
  };

  const data = Array.from({ length: 2 }).map(() => {
    return JSON.stringify({
      Whatever1: Math.random() * 100,
      Whatever2: Math.random() * 100,
    });
  });

  sendBatchMessage(process.env.SQS_QUEUE_URL, data, attributes);

  res.send(true);
});

module.exports = router;
