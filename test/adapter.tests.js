/* eslint-env node, mocha */

"use strict";

const sinon = require("sinon");
const Assert = require("assert");
const { respondWithError } = require("../lib/adapter");

describe("adapter", function () {
  describe("respondWithError", () => {
    describe("when error has non-serializable properties", () => {
      // use bigint to force an exception
      class BigIntError extends Error {
        constructor(message) {
          super(message);
          this.num = BigInt("9007199254740991");
        }
      }
      const error = new BigIntError()
      it("should respond with generic error serialized", () => {
        const res = {
          writeHead: sinon.spy(),
          end: sinon.spy()
        };

        respondWithError(error, res);

        Assert.equal(res.writeHead.firstCall.args[0], 200);
        Assert.equal(res.end.calledOnce, true);
        
        const respContent = JSON.parse(res.end.firstCall.args[0])
        Assert.equal(
          respContent.data.message,
          "Error serializing error: Do not know how to serialize a BigInt"
        );
      });
    });
  });
});
