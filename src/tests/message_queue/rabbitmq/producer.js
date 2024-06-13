const amqp = require("amqplib");
const messages = "hello";

const runProducer = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost"); // neu ma doi passwork thì sẽ là amqp://guest:12345@localhost
    const channel = await connection.createChannel();

    const queueName = "test-topic";
    await channel.assertQueue(queueName, {
      durable: true, // khi start lai thi gui tiep chu khong mat du lieu
    });

    // send message
    channel.sendToQueue(queueName, Buffer.from(messages));
    console.log(`message sent: ${messages}}`);
  } catch (error) {
    console.error(error);
  }
};

runProducer().catch(console.error);
