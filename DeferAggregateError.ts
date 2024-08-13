export class DeferAggregateError extends Error {
  public readonly errors: unknown[];
  public readonly name = "DeferAggregateError";

  constructor(readonly message: string = "", errors: unknown[]) {
    super(message, { cause: { errors } });
    this.errors = [...errors];
  }
}
