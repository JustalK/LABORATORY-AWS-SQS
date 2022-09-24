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

## Development

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
