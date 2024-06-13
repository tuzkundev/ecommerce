const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "shopdev",
  database: "shopDEV",
});

const batchSize = 10; // adjust batch size
const totalSize = 1000; // adjust total size

let currentId = 1;

const insertBatch = async () => {
  const values = [];
  for (let i = 0; i < batchSize && currentId < totalSize; i++) {
    const name = `name-${currentId}`;
    const age = currentId;
    const address = `address-${currentId}`;
    values.push([currentId, name, age, address]);
    currentId++;
  }
  if (!values.length) {
    pool.end((err) => {
      if (err) {
        console.log(`error occurred while running batch`);
      } else {
        console.log(`Connection pool close successfully`);
      }
    });
    return;
  }

  const sql = `INSERT INTO test_table (id, name, age, address) VALUES ?`;

  pool.query(sql, values, async function (err, results) {
    if (err) throw err;
    console.log(`Inserted ${results.affectedRows} records`);
    await insertBatch();
  });
};

insertBatch().catch((err) => console.log(err));

// pool.query('SELECT * from users', function (err, results) {
//     if(err) throw err

//     console.log(`query result::`, results);

//     pool.end(err => {
//         if(err) throw err
//         console.log(`connection closed::`)
//     })
// })
