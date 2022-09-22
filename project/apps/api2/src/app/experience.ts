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
  QueueUrl: `${process.env.SQS_QUEUE_URL}#request`,
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
  console.log(body);
  sendMessage(body.Whatever1 * body.Whatever2, metadata);
};

const sendMessage = (result, metadata) => {
  var params = {
    MessageAttributes: {
      Sender: {
        DataType: 'String',
        StringValue: 'API2',
      },
    },
    MessageBody: JSON.stringify({
      result: result,
    }),
    QueueUrl: `${process.env.SQS_QUEUE_URL}#reply`,
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
      QueueUrl: `${process.env.SQS_QUEUE_URL}#request`,
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
