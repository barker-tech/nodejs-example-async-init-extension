# Asynchronous Initialization Extension Layer for NodeJs

## The Asynchronous Initialization Problem

Normally, delayed asynchronous operations cannot complete during the initialization phase on AWS Lambda NodeJs functions. On AWS Lambda NodeJs 14.X and lower, asynchronous operations such as warming database connections are completed during subsequent requests. Depending the length of the operation, completion may be delayed until multiple requests later.

Before provisioned concurrency, this was not an issue. With provisioned concurrency, we are able to warm AWS Lambda functions during a provisioning phase to offload initilization tasks. This means that we can perform asynchronous operations before the first user request to our AWS Lambda function. However, since asynchronous operations do not complete during the AWS Lambda NodeJs operation before the container enters a paused state, this does not work for NodeJs Lambda functions. It will work for all other AWS Lambda supported languages.

This extension layer allows asynchronous AWS Lambda NodeJs operations to complete during the function initialization phase. This works because the extension layer holds the container online until the asynchronous operations complete.

A WARMING_TIMEOUT environment variable must be passed into the Lambda function, if it needs to wait for function initialization. This prevents the extension layer from hanging indefinitely during initialization. If it is not passed in, the extension layer will not keep the container online. In this case, the Lambda exits immediately. It is used to set a maximum time to wait for to receive a notification from the extension layer. This prevents unintentional long wait times if the layer is added to an AWS Lambda function but the function does not notify the layer when initialization completes.

## AWS CDK Deployment

This sample can be deployed with AWS CDK via the commands in the package.json file. From within the nodejs-example-async-init-extension folder, run the following code to deploy. Several commands are setup.

### Deploy

```bash
npm ci
npm run deploy-sample
```

### Destroy

To uninstall, run below:

```
npm run destory-sample
```

### Deploy Local

In addition, the sample can be executed locally with the sam cli. The sam cli must be installed to run locally (https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html).

```bash
npm ci
npm run deploy-local
```

## Example Paths

### ./lambda/layers/wait-for-init-layer-extension

This path contains the extension layer specific code.

### lambda/main/get-default

This path contains a sample function for initailization.

