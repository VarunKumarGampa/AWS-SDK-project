import middy from "@middy/core";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";

export default (handler) =>
  middy(handler).use([
    httpJsonBodyParser(),
    httpEventNormalizer(),
    httpErrorHandler(),
  ]);

//This middleware will automatically pass our string in event body, with that we dont have to do very time
//This middleware will automatically adjust the API gateway event objects to prevent us from accidentally having non existing object when trying to access path parameters or query parameters(saving from error)
// for error handling
