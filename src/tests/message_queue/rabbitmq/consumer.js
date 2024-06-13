const amqp = require("amqplib");

const runConsumer = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const queueName = "test-topic";
    await channel.assertQueue(queueName, {
      durable: true, // khi start lai thi gui tiep chu khong mat du lieu
    });

    // send message
    channel.consume(
      queueName,
      (messages) => {
        console.log(`Receive${messages.content.toString()}`);
      },
      {
        noAck: false, // neu false thi du lieu da duoc xu ly roi thi se khong gui lai nua
      }
    );
  } catch (error) {
    console.error(error);
  }
};

runConsumer().catch(console.error);
