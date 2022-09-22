const express = require('express');
const AWS = require('aws-sdk');
const router = express.Router();

const SQS_CONFIG = {
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
};

const sqs = new AWS.SQS(SQS_CONFIG);
const queueURL = process.env.SQS_QUEUE_URL;
const REFRESH_TIMEOUT_IN_SECOND = 10;

var receiveMessageParams = {
  QueueUrl: process.env.SQS_QUEUE_URL,
  MaxNumberOfMessages: 10,
  VisibilityTimeout: 10,
  WaitTimeSeconds: 0,
  MessageAttributeNames: ['All'],
};

const receiveMessage = () => {
  console.log('API2');
  sqs.receiveMessage(receiveMessageParams, (err, data) => {
    console.log('API2 +');
    if (err) {
      console.log(err);
    }

    if (data.Messages) {
      console.log('POLLING API2');
      for (const {
        MessageAttributes: metadata,
        Body,
        ReceiptHandle: id,
      } of data.Messages) {
        if (metadata.Sender.StringValue === 'API1') {
          handleMessage(Body, metadata);
          removeFromQueue(id);
        }
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
  sendMessage(body.Whatever1 + body.Whatever2, metadata);
};

const sendMessage = (result, metadata) => {
  var params = {
    MessageAttributes: {
      Sender: {
        DataType: 'String',
        StringValue: 'API2',
      },
    },
    MessageDeduplicationId: 'API2+',
    MessageGroupId: 'Test',
    MessageBody: JSON.stringify({
      result: result,
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
};

var removeFromQueue = function (id: string) {
  sqs.deleteMessage(
    {
      QueueUrl: process.env.SQS_QUEUE_URL,
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
