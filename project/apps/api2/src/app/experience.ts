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

/**
var params = {
  AttributeNames: ['SentTimestamp'],
  MaxNumberOfMessages: 10,
  MessageAttributeNames: ['All'],
  QueueUrl: `${process.env.SQS_QUEUE_URL}#request`,
  VisibilityTimeout: 20,
  WaitTimeSeconds: 0,
};


sqs.receiveMessage(params, function (err, data) {
  if (err) {
    console.log('Receive Error', err);
  } else if (data.Messages) {
    var deleteParams = {
      QueueUrl: `${process.env.SQS_QUEUE_URL}#request`,
      ReceiptHandle: data.Messages[0].ReceiptHandle,
    };
    sqs.deleteMessage(deleteParams, function (err, data) {
      if (err) {
        console.log('Delete Error', err);
      } else {
        console.log('Message Deleted', data);
      }
    });

    sqs.sendMessage(
      {
        DelaySeconds: 10,
        MessageAttributes: {
          Test: {
            DataType: 'String',
            StringValue: 'Data1',
          },
        },
        MessageBody: 'This is a test',
        QueueUrl: `${process.env.SQS_QUEUE_URL}#reply`,
      },
      function (err, data) {
        if (err) {
          console.log('Error', err);
        } else {
          console.log('Success', data.MessageId);
        }
      }
    );
  }
});
**/

var receiveMessageParams = {
  QueueUrl: `${process.env.SQS_QUEUE_URL}#request`,
  MaxNumberOfMessages: 10,
  VisibilityTimeout: 10,
  WaitTimeSeconds: 10,
};

var receiveMessage = function () {
  console.log('RUN');
  sqs.receiveMessage(receiveMessageParams, function (err, data) {
    if (err) {
      console.log(err);
    }
    if (data.Messages) {
      for (var i = 0; i < data.Messages.length; i++) {
        var message = data.Messages[i];
        console.log(data.Messages);
        removeFromQueue(message);
      }
      receiveMessage();
    } else {
      console.log('TIMEDOUT');
      setTimeout(function () {
        receiveMessage();
      }, 10 * 1000);
    }
  });
};

var removeFromQueue = function (message) {
  sqs.deleteMessage(
    {
      QueueUrl: `${process.env.SQS_QUEUE_URL}#request`,
      ReceiptHandle: message.ReceiptHandle,
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
