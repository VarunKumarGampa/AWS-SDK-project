import AWS from "aws-sdk";
import middy from "@middy/core";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import createError from "http-errors"; // This package allows us to crate http error in a very declarative way, rather than returning status code

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
  let auctions;

  try {
    const results = await dynamodb
      .scan({
        TableName: process.env.AUCTIONS_TABLE_NAME,
      })
      .promise();

    auctions = results.Items;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
}

export const handler = middy(getAuctions)
  .use(httpJsonBodyParser()) //This middleware will automatically pass our string in event body, with that we dont have to do very time
  .use(httpEventNormalizer()) //This middleware will automatically adjust the API gateway event objects to prevent us from accidentally having non existing object when trying to access path parameters or query parameters(saving from error)
  .use(httpErrorHandler()); // for error handling
