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
    // Remove DelaySeconds parameter and value for FIFO queues
    DelaySeconds: 10,
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

router.get('/health', (req, res) => {
  res.send({ status: 'working' });
});

module.exports = router;
