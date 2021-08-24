import { Stack, StackProps, Construct } from "@aws-cdk/core";
import { LambdaRestApi, LambdaIntegration } from "@aws-cdk/aws-apigateway";
import { Function, Code, Runtime, LayerVersion } from "@aws-cdk/aws-lambda";

export class NodeJsAsyncInitStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const waitForInitLayerName = "wait-for-init-layer-extension";
    const waitForInitLayerPath = `./lambdas/layers/${waitForInitLayerName}`;
    const waitForInitLayer = new LayerVersion(this, waitForInitLayerName, {
      compatibleRuntimes: [Runtime.NODEJS_14_X],
      code: Code.fromAsset(waitForInitLayerPath, {
        bundling: {
          image: Runtime.NODEJS_14_X.bundlingImage,
          // Permissions are not set correctly by default bundling.
          command: [
            "bash",
            "-c",
            `cp -R /asset-input/* /asset-output && chmod +x /asset-output/extensions/${waitForInitLayerName} && chmod +x /asset-output/${waitForInitLayerName}/index.js`,
          ],
        },
      }),
    });

    // Setup AwsTemplateApiGateway
    const getDefaultFunction = new Function(this, "getDefault", {
      runtime: Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: Code.fromAsset("./lambdas/main/get-default"),
      layers: [waitForInitLayer],
      environment: {
        // Sets the minimum time that the extenion layer will wait for a notification from the function.
        WARMING_TIMEOUT: "3000",
      },
    });

    const api = new LambdaRestApi(this, "AwsTemplateApiGateway", {
      handler: getDefaultFunction,
      proxy: false,
      deployOptions: {
        stageName: "v1",
        methodOptions: {
          "/*/*": {
            throttlingRateLimit: 2,
            throttlingBurstLimit: 5,
          },
        },
        tracingEnabled: true,
      },
    });

    // PATH: /v1
    const getDefaultFunctionIntegration = new LambdaIntegration(
      getDefaultFunction
    );
    api.root.addMethod("GET", getDefaultFunctionIntegration);

    // PATH: /v1/default
    const defaultResource = api.root.addResource("default");
    defaultResource.addMethod("GET", getDefaultFunctionIntegration);
  }
}
