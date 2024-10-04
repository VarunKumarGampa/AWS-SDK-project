import AWS from "aws-sdk";
import middy from "@middy/core";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import createError from "http-error"; // This package allows us to crate http error in a very declarative way, rather than returning status code

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuction(event, context) {
  let auction;
  const { id } = event.pathParameters;

  try {
    const result = await dynamodb
      .get({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
      })
      .promise();
    auction = result.Item;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  if (!auction) {
    throw new createError.NotFound(`Auction with this "${id}" is not found`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
}

export const handler = middy(getAuction)
  .use(httpJsonBodyParser()) //This middleware will automatically pass our string in event body, with that we dont have to do very time
  .use(httpEventNormalizer()) //This middleware will automatically adjust the API gateway event objects to prevent us from accidentally having non existing object when trying to access path parameters or query parameters(saving from error)
  .use(httpErrorHandler()); // for error handling
