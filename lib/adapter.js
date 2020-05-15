"use strict";

module.exports = {
  respondWithError,
  wrap,
};

function respondWithError(error, res) {
  if (!(error instanceof Error)) {
    error = new Error(error.message || String(error) || "Unknown error");
  }

  const payload = {
    status: "error",
    data: {},
  };

  Object.getOwnPropertyNames(error).forEach((key) => {
    payload.data[key] = error[key];
  })
  
  let json;

  try {
    json = JSON.stringify(payload)
  } catch (e) {
    const error = new Error("Error serializing error: " + e.message);

    return respondWithError(error, res);
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(json);
}

function wrap(webtaskFn, payloadAdapter) {
  if (!payloadAdapter) {
    // The default payload adapter is an identity function
    payloadAdapter = (payload) => payload;
  }

  let parseBody;
  const bodylessMethods = ["GET", "HEAD", "OPTIONS"];

  return handler;

  function handler(ctx, req, res) {
    // There will be no body to parse.
    if (bodylessMethods.indexOf(req.method) !== -1) {
      return webtaskFn(ctx, buildResponse);
    }

    // The body has already been parsed before control is handed over to the compiler.
    // This means that the platform already did the parsing.
    if (ctx.body) {
      return webtaskFn(ctx, buildResponse);
    }

    if (!parseBody) {
      // Defer loading wreck until needed
      const Wreck = require("wreck");

      parseBody = Wreck.read.bind(Wreck);
    }

    // The body has yet to be parsed. Delegate this logic to wreck.
    return parseBody(req, { json: true }, (error, body) => {
      if (error) {
        return buildResponse(error);
      }

      ctx.body = body;

      return webtaskFn(ctx, buildResponse);
    });

    function buildResponse(error /*, arg1, arg2, ...*/) {
      if (error) {
        return respondWithError(error, res);
      }

      const response = {
        statusCode: 200,
        headers: {},
        status: 'success',
        // Marshall the non-error callback arguments into the wire format
        // that the extension <--> auth0-server protocol expects
        data: payloadAdapter.apply(
          null,
          Array.prototype.slice.call(arguments, 1)
        ),
      };

      // Currently the respond function assumes json as the only format that
      // will be sent over the wire. In the future we could inspect the request
      // and do applicable content negotiation.
      let json;

      try {
        json = JSON.stringify(response);
      } catch (e) {
        return respondWithError(
          new Error(
            "Error when JSON serializing the result of the extension point"
          ),
          res
        );
      }

      response.headers["Content-Type"] = "application/json";

      res.writeHead(response.statusCode, response.headers);
      res.end(json);

      return;
    }
  }
}
