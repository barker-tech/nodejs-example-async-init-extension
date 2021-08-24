#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { NodeJsAsyncInitStack } from "../lib/nodejs-example-stack";

const app = new cdk.App();
new NodeJsAsyncInitStack(app, "NodeJsAsyncInitStack", {});
