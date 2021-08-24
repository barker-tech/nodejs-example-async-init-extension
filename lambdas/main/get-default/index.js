"use strict";
// Copyright Charles Barker. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const { connect } = require("net");

// IIFE that will initialize asynchronous operations.
(async () => {
  console.log("starting warming");
  // Force a 2 second delay to demonstrate the initialize phase completing.
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Notify extension layer that we are complete.
  const socketPath = "/tmp/wait-for-init.sock";
  const socket = connect(socketPath);
  socket.setTimeout(1000);
  const warmingCompleteNotification = new Promise((resolve, reject) => {
    socket.write("ready", () => {
      resolve("client sent data");
      socket.end();
    });
    socket.on("timeout", () => {
      reject("client timeout");
      socket.destroy();
    });
    socket.on("error", (err) => {
      reject(`client error: ${err}`);
      socket.destroy();
    });
  })
    .then((data) => console.log(data))
    .catch((err) => console.log(err));
})();

const handler = async (event, context) => {
  console.log("starting function");
  return {
    statusCode: 200,
    body: "Ok",
  };
};

module.exports = {
  handler,
};
