const express = require('express');
const router = express.Router();
const uniqid = require('uniqid');
const REFRESH_TIMEOUT_IN_SECOND = 10;
import { receiveMessage, sendMessage } from '@project/queue';

/**
 * Send a message
 */
router.get('/send', (req, res) => {
  var params = {
    MessageAttributes: {
      Date: {
        DataType: 'String',
        StringValue: new Date().toString(),
      },
      Sender: {
        DataType: 'String',
        StringValue: 'API1',
      },
    },
    MessageDeduplicationId: uniqid(),
    MessageGroupId: 'Test',
    MessageBody: JSON.stringify({
      Whatever1: Math.random() * 100,
      Whatever2: Math.random() * 100,
    }),
    QueueUrl: process.env.SQS_QUEUE_URL,
  };

  sendMessage(params);

  res.send(true);
});

var receiveMessageParams = {
  QueueUrl: process.env.SQS_RESPONSE_QUEUE_URL,
  MaxNumberOfMessages: 10,
  VisibilityTimeout: 10,
  WaitTimeSeconds: 0,
  MessageAttributeNames: ['All'],
};

const handleMessage = (data: string, metadata) => {
  var body = JSON.parse(data);
  console.log(new Date(), body);
};

receiveMessage(
  process.env.SQS_RESPONSE_QUEUE_URL,
  receiveMessageParams,
  handleMessage
);

router.get('/health', (req, res) => {
  res.send({ status: 'working' });
});

module.exports = router;
