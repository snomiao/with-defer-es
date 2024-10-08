import { DeferAggregateError } from "./DeferAggregateError";
type Awaitable<T> = PromiseLike<T> | T;
type Action = () => Awaitable<void>;
type Defer = (clean: Action) => Awaitable<void>;

export { DeferAggregateError };

/**
 * @throws DeferAggregateError if ran into error
 */
export default async function withDefer<T>(
  fn: (defer: Defer) => Awaitable<T>
): Promise<T> {
  const stack: Action[] = [];
  const errors: unknown[] = [];
  const defer: Defer = (clean) => {
    stack.unshift(clean);
  };

  try {
    return await fn(defer);
  } catch (e) {
    errors.push(e);
    return new Promise<never>(() => {}); // make ts happy
  } finally {
    for await (const clean of stack) {
      try {
        await clean();
      } catch (e) {
        errors.push(e);
      }
    }
    if (errors.length)
      throw new DeferAggregateError(
        "Two or more exceptions caught while executing or deferred clean-up functions",
        errors
      );
  }
}
