const express = require('express');
const AWS = require('aws-sdk');
const router = express.Router();

const SQS_CONFIG = {
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
};

const sqs = new AWS.SQS(SQS_CONFIG);

router.get('/send', (req, res) => {
  var params = {
    MessageAttributes: {
      Title: {
        DataType: 'String',
        StringValue: 'The Whistler',
      },
      Author: {
        DataType: 'String',
        StringValue: 'John Grisham',
      },
      WeeksOn: {
        DataType: 'Number',
        StringValue: '6',
      },
    },
    MessageBody:
      'Information about current NY Times fiction bestseller for week of 12/11/2016.',
    // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
    // MessageGroupId: "Group1",  // Required for FIFO queues
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

sqs.receiveMessage(
  {
    AttributeNames: ['SentTimestamp'],
    MaxNumberOfMessages: 10,
    MessageAttributeNames: ['All'],
    QueueUrl: `${process.env.SQS_QUEUE_URL}#reply`,
    VisibilityTimeout: 20,
    WaitTimeSeconds: 0,
  },
  function (err, data) {
    if (err) {
      console.log('Receive Error', err);
    } else if (data.Messages) {
      var deleteParams = {
        QueueUrl: `${process.env.SQS_QUEUE_URL}#reply`,
        ReceiptHandle: data.Messages[0].ReceiptHandle,
      };
      sqs.deleteMessage(deleteParams, function (err, data) {
        if (err) {
          console.log('Delete Error', err);
        } else {
          console.log('Message Deleted', data);
        }
      });
    }
  }
);

router.get('/health', (req, res) => {
  res.send({ status: 'working' });
});

module.exports = router;
