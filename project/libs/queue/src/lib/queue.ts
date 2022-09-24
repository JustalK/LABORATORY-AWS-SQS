const AWS = require('aws-sdk');
const uniqid = require('uniqid');
const REFRESH_TIMEOUT_IN_SECOND = 10;

const SQS_CONFIG = {
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
};

const sqs = new AWS.SQS(SQS_CONFIG);

interface Message {
  Id?: string;
  MessageAttributes?: any;
  MessageDeduplicationId: string;
  MessageGroupId: string;
  MessageBody: string;
  QueueUrl?: string;
}

/**
===============================================================================================================
SEND MESSAGE
===============================================================================================================
 */

export function sendMessage(url: string, data: string, attributes = null) {
  let params: Message = {
    MessageDeduplicationId: uniqid(),
    MessageGroupId: 'Test',
    MessageBody: data,
    QueueUrl: url,
  };

  if (attributes) {
    params.MessageAttributes = attributes;
  }

  sqs.sendMessage(params, function (err, data) {
    if (err) {
      console.log('Error', err);
    } else {
      console.log('Success', data.MessageId);
    }
  });
}

/**
===============================================================================================================
RECEIVE MESSAGE
===============================================================================================================
 */

const receiveMessageParams = {
  MaxNumberOfMessages: 10,
  VisibilityTimeout: 10,
  WaitTimeSeconds: 5,
  MessageAttributeNames: ['All'],
};

export const receiveMessage = (
  url: string,
  callback: (data: string) => void
) => {
  const params = {
    ...receiveMessageParams,
    QueueUrl: url,
  };

  sqs.receiveMessage(params, (err, data) => {
    if (err) {
      console.log(err);
    }

    if (data.Messages) {
      for (const {
        MessageAttributes: _metadata,
        Body,
        ReceiptHandle: id,
      } of data.Messages) {
        callback(Body);
        deleteMessage(url, id);
      }
      receiveMessage(url, callback);
    } else {
      setTimeout(() => {
        receiveMessage(url, callback);
      }, REFRESH_TIMEOUT_IN_SECOND * 1000);
    }
  });
};

/**
===============================================================================================================
DELETE MESSAGE
===============================================================================================================
 */

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

/**
===============================================================================================================
===============================================================================================================
BATCH PROCESS - SEND MESSAGES 
===============================================================================================================
===============================================================================================================
 */

export function sendBatchMessage(
  url: string,
  data: string[],
  attributes = null
) {
  let params = {
    QueueUrl: url,
    Entries: [],
  };

  for (const d of data) {
    let message: Message = {
      Id: uniqid(),
      MessageDeduplicationId: uniqid(),
      MessageGroupId: 'Test',
      MessageBody: d,
    };

    if (attributes) {
      message.MessageAttributes = attributes;
    }

    params.Entries.push(message);
  }

  sqs.sendMessageBatch(params, function (err, data) {
    if (err) {
      console.log('Error', err);
    } else {
      console.log('Success', data.MessageId);
    }
  });
}
