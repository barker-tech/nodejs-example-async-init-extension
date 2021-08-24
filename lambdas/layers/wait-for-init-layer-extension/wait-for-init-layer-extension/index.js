#!/usr/bin/env node
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const { register, next } = require("./extensions-api");
const { waitForInitNotification } = require("./wait-for-init");

const { WARMING_TIMEOUT } = process.env;
const warmingTimeout = parseInt(WARMING_TIMEOUT, 10);
const warmingTimeoutMs = warmingTimeout ? warmingTimeout : 0;

const socketPath = "/tmp/wait-for-init.sock";

const EventType = {
  INVOKE: "INVOKE",
  SHUTDOWN: "SHUTDOWN",
};

function handleShutdown(event) {
  console.log("shutting down", { event });
  process.exit(0);
}

function handleInvoke(event) {
  console.log("invoke");
}

(async function main() {
  process.on("SIGINT", () => handleShutdown("SIGINT"));
  process.on("SIGTERM", () => handleShutdown("SIGTERM"));

  console.log("registering extension");
  const extensionId = await register();
  console.log("extensionId", extensionId);

  const timeout = new Promise((resolve) =>
    setTimeout(resolve, warmingTimeoutMs)
  );
  const noticeWait = waitForInitNotification(socketPath);

  await Promise.race([timeout, noticeWait]);

  while (true) {
    const event = await next(extensionId);
    switch (event.eventType) {
      case EventType.SHUTDOWN:
        handleShutdown(event);
        break;
      case EventType.INVOKE:
        handleInvoke(event);
        break;
      default:
        throw new Error("unknown event: " + event.eventType);
    }
  }
})();
