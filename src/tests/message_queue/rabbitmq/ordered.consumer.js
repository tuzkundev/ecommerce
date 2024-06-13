"use strict";

const amqp = require("amqplib");

async function consumerOrderedMessage() {
  const connection = await amqp.connect("amqp://localhost"); // neu ma doi passwork thì sẽ là amqp://guest:12345@localhost
  const channel = await connection.createChannel();

  const queueName = "ordered-queued-message";
  await channel.assertQueue(queueName, {
    durable: true, // khi start lai thi gui tiep chu khong mat du lieu
  });

  // set prefetch to 1 to ensure only one ack at a time

  channel.prefetch(1);

  channel.consume(queueName, (msg) => {
    const message = msg.content.toString();

    setTimeout(() => {
      console.log("processed", message);
      channel.ack(msg);
    }, Math.random() * 1000);
  });
}

consumerOrderedMessage().catch((err) => console.error(err));
