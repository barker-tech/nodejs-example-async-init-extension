const { existsSync, unlinkSync } = require("fs");
const { createServer } = require("net");

async function waitForInitNotification(socketPath) {
  if (existsSync(socketPath)) {
    unlinkSync(socketPath);
  }

  const server = createServer();
  server.listen(socketPath);

  const clientWarmedPromise = new Promise((resolve, reject) => {
    server.on("connection", (s) => {
      const onData = (data) => {
        resolve(data);
        s.end();
      };
      const onTimeout = () => {
        reject("timeout occurred");
        s.destroy();
      };
      const onError = (err) => {
        reject(`error occurred: ${err}`);
        s.destroy();
      };
      s.on("data", onData);
      s.on("error", onError);
      s.on("timeout", onTimeout);
    });
  })
    .then((data) => console.log("client warmed"))
    .catch((err) => console.log(err));

  await clientWarmedPromise;
  server.removeAllListeners();
  server.close();
}

module.exports = {
  waitForInitNotification,
};
