import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import middy from "@middy/core";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import createError from "http-error"; // This package allows us to crate http error in a very declarative way, rather than returning status code

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  const { title } = event.body;

  const now = new Date();

  const auction = {
    id: uuid(),
    title,
    status: "open",
    createdAt: now.toISOString(),
  };
  try {
    await dynamodb
      .put({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Item: auction,
      })
      .promise();
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

export const handler = middy(createAuction)
  .use(httpJsonBodyParser()) //This middleware will automatically pass our string in event body, with that we dont have to do very time
  .use(httpEventNormalizer()) //This middleware will automatically adjust the API gateway event objects to prevent us from accidentally having non existing object when trying to access path parameters or query parameters(saving from error)
  .use(httpErrorHandler()); // for error handling
