const express = require('express');
const router = express.Router();
import { receiveMessage, sendMessage } from '@project/queue';

/**
 * Send a message
 */
router.get('/send', (req, res) => {
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

  const data = JSON.stringify({
    Whatever1: Math.random() * 100,
    Whatever2: Math.random() * 100,
  });

  sendMessage(process.env.SQS_QUEUE_URL, data, attributes);

  res.send(true);
});

const handleMessage = (data: string, metadata) => {
  var body = JSON.parse(data);
  console.log(new Date(), body);
};

receiveMessage(process.env.SQS_RESPONSE_QUEUE_URL, handleMessage);

router.get('/health', (req, res) => {
  res.send({ status: 'working' });
});

module.exports = router;
