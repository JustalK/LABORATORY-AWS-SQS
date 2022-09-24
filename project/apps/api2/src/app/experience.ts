import * as express from 'express';
const router = express.Router();
import { receiveMessage, sendMessage } from '@project/queue';

const handleMessage = (data: string) => {
  var body = JSON.parse(data);
  console.log(new Date(), body);
  sendMessage(
    process.env.SQS_RESPONSE_QUEUE_URL,
    JSON.stringify({
      result: body.Whatever1 + body.Whatever2,
    })
  );
};

receiveMessage(process.env.SQS_QUEUE_URL, handleMessage);

router.get(
  '/health',
  (_req: express.Request, res: express.Response<{ status: string }>) => {
    res.send({ status: 'working' });
  }
);

module.exports = router;
