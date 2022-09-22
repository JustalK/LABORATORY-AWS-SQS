const express = require('express');
const AWS = require('aws-sdk');
const router = express.Router();

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
    MessageBody: JSON.stringify({
      Whatever1: Math.random() * 100,
      Whatever2: Math.random() * 100,
    }),
    QueueUrl: `${process.env.SQS_QUEUE_URL}#request`,
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
  QueueUrl: `${process.env.SQS_QUEUE_URL}#reply`,
  MaxNumberOfMessages: 10,
  VisibilityTimeout: 10,
  WaitTimeSeconds: 10,
  MessageAttributeNames: ['All'],
};

const receiveMessage = () => {
  sqs.receiveMessage(receiveMessageParams, (err, data) => {
    if (err) {
      console.log(err);
    }

    if (data.Messages) {
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
  console.log(body);
};

const removeFromQueue = function (id: string) {
  sqs.deleteMessage(
    {
      QueueUrl: `${process.env.SQS_QUEUE_URL}#reply`,
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
