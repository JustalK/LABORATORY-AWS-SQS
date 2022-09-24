const express = require('express');
const AWS = require('aws-sdk');
const router = express.Router();
const uniqid = require('uniqid');

const SQS_CONFIG = {
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
};

const sqs = new AWS.SQS(SQS_CONFIG);
const REFRESH_TIMEOUT_IN_SECOND = 10;

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

  sqs.sendMessage(params, function (err, data) {
    if (err) {
      console.log('Error', err);
    } else {
      console.log('Success', data.MessageId);
    }
  });

  res.send(true);
});

var receiveMessageParams = {
  QueueUrl: process.env.SQS_RESPONSE_QUEUE_URL,
  MaxNumberOfMessages: 10,
  VisibilityTimeout: 10,
  WaitTimeSeconds: 0,
  MessageAttributeNames: ['All'],
};

const receiveMessage = () => {
  console.log('API1');
  sqs.receiveMessage(receiveMessageParams, (err, data) => {
    if (err) {
      console.log(err);
    }

    if (data.Messages) {
      console.log('POLLING API1');
      for (const {
        MessageAttributes: metadata,
        Body,
        ReceiptHandle: id,
      } of data.Messages) {
        handleMessage(Body, metadata);
        removeFromQueue(id);
      }
      receiveMessage();
    } else {
      setTimeout(() => {
        receiveMessage();
      }, REFRESH_TIMEOUT_IN_SECOND * 1000);
    }
  });
};

const handleMessage = (data: string, metadata) => {
  var body = JSON.parse(data);
  console.log(new Date(), body);
};

const removeFromQueue = function (id: string) {
  sqs.deleteMessage(
    {
      QueueUrl: process.env.SQS_RESPONSE_QUEUE_URL,
      ReceiptHandle: id,
    },
    function (err, data) {
      err && console.log(err);
    }
  );
};

receiveMessage();

router.get('/health', (req, res) => {
  res.send({ status: 'working' });
});

module.exports = router;
