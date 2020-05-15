module.exports = class ExtensibilityUserError extends Error {
  constructor(message) {
    super(message);
    // This `name` property should be the main piece of data that consumers
    // outside of auth0-ext will use to determine what error was thrown
    this.name = this.constructor.name;
  }
}
