const amqp = require("amqplib");
const messages = "hello";

const log = console.log;

console.log = function () {
  log.apply(console, [new Date()].concat(arguments));
};

const runProducer = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost"); // neu ma doi passwork thì sẽ là amqp://guest:12345@localhost
    const channel = await connection.createChannel();

    const notificationExchange = "notificationExchange"; // notificationExchange direct

    const notificationQueue = "notificationQueueProcess"; // assert Queue
    const notificationExchangeDLX = "notificationExchangeDLX";
    const notificationRoutingKeyDLX = "notificationRoutingKeyDLX"; // assert

    //1. create exchange
    await channel.assertExchange(notificationExchange, "direct", {
      durable: true, // khi start lai thi gui tiep chu khong mat du lieu
    });

    //2. create queue
    const queueResult = await channel.assertQueue(notificationQueue, {
      exclusive: false, // cho phep cac ket noi truy cap vao cung 1 luc hang doi
      deadLetterExchange: notificationExchangeDLX,
      deadLetterRoutingKey: notificationRoutingKeyDLX,
    });

    //3. Binding queue
    await channel.bindQueue(queueResult.queue, notificationExchange);

    // 4.send message
    const msg = "a new product";
    console.log("producer msg::", msg);
    await channel.sendToQueue(queueResult.queue, Buffer.from(msg), {
      expiration: "10000",
    });
    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error(error);
  }
};

runProducer().catch(console.error);
