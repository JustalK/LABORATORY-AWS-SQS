# LABORATORY-AWS-SQS

![./documentation/graph.png](./documentation/graph.png)

This laboratory is a little experimentation with Amazon SQS. Using two **Express** apps in a **NX** WorkSpace, I am calculating the addition of two random numbers and passing the information through two SQS queue for creating a Request/Reply pattern. The first app API1 is responsible for giving two random numbers while the second app API2 is responsible for additionning this two numbers and give the result back to API1.

All of my Amazon SQS queue are fifo, so the order is kept and there is no duplication.

## Plan of the presentation

I explain with all the details how I build the project and my way of working.

- [Theory](#theory)
- [Development](#development)
- [Result](#result)
- [Running](#running)
- [System](#system)

## Theory

#### FIFO vs Standard

On Amazon, there are two types of queue FIFO (first-in-first-out) and standard. By default, the queue on Amazon are in standard type. The standard type will try to process as many message as possible, even if it's in not in the right order and might create duplicate messages.

On the other side, the FIFO queue will keep the order of the message but will only be able to handle up to 3k messages per second without batching. With batching, we can go up to 30k messages per seconds.

#### Options

There are a bunch of options possible on the configuration of the queue such as:

- **Retention:** is the time a message will stay on the queue before it gets deleted.
- **MessageGroupId:** Group the message into a group (a group can handle 20k messages max in flight, so be careful)
- **MessageDeduplicationId:** Id of a message, it need to be unique or else no message will be sent.
- **MaxNumberOfMessages:** The number max of message that can be handle when querying the queue
- **WaitTimeSeconds:** The time for polling (meaning the time the connection for polling message will stay open). It avoid querying the queue often like we do in short polling.
- **VisibilityTimeout:** The time a message will be invisible/lock for any other polling. If the message is not handle properly or take too long before getting deleted, it will be treated once again after this time.
- **Dead queue**: A queue where with sent the message that has failed to be deleted after x polling.

## Development

#### Create the queues on Amazon

![./documentation/4.png](./documentation/4.png)
![./documentation/3.png](./documentation/3.png)
![./documentation/2.png](./documentation/2.png)
![./documentation/1.png](./documentation/1.png)

#### Create a lib

```bash
npx nx g @nrwl/node:lib queue
```

```js
import { receiveMessage, sendMessage } from "@project/queue";
```

## Result

I can now see on my Postman the result of my call:

![./documentation/test.png](./documentation/test.png)

## Running

I am using NX, so for starting the project use the following command:

```bash
$ nx serve api
```

For testing the app, use Postman.

## System

Ubuntu Version: Ubuntu 20.04.1 LTS
Node Version: v16.15.1

```bash
# Get the version of node
$ node -v

# Get the latest version of ubuntu
$ lsb_release -a
```
