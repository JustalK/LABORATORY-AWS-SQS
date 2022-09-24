const AWS = require('aws-sdk');
const REFRESH_TIMEOUT_IN_SECOND = 10;

const SQS_CONFIG = {
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
};

const sqs = new AWS.SQS(SQS_CONFIG);

export function sendMessage(params) {
  sqs.sendMessage(params, function (err, data) {
    if (err) {
      console.log('Error', err);
    } else {
      console.log('Success', data.MessageId);
    }
  });
}

export const receiveMessage = (url, params, callback) => {
  sqs.receiveMessage(params, (err, data) => {
    if (err) {
      console.log(err);
    }

    if (data.Messages) {
      for (const {
        MessageAttributes: metadata,
        Body,
        ReceiptHandle: id,
      } of data.Messages) {
        callback(Body, metadata);
        deleteMessage(url, id);
      }
      receiveMessage(url, params, callback);
    } else {
      setTimeout(() => {
        receiveMessage(url, params, callback);
      }, REFRESH_TIMEOUT_IN_SECOND * 1000);
    }
  });
};

export const deleteMessage = (url: string, id: string) => {
  sqs.deleteMessage(
    {
      QueueUrl: url,
      ReceiptHandle: id,
    },
    function (err, data) {
      err && console.log(err);
    }
  );
};
