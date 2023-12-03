import { DeferAggregateError } from "./DeferAggregateError";
type Awaitable<T> = PromiseLike<T> | T;
type Action = () => Awaitable<void>;
type Defer = (clean: Action) => Awaitable<void>;

export { DeferAggregateError };
/**
 * @throws DeferAggregateError if ran into error
 */
export default async function withDefer(fn: (defer: Defer) => Awaitable<void>){
  const stack: Action[] = [];
  const errors: unknown[] = [];
  const defer: Defer = (clean) => {
    stack.unshift(clean);
  };

  try {
    return await fn(defer);
  } catch (e) {
    errors.push(e);
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
        "One or more exceptions caught while executing or deferred clean-up functions",
        errors
      );
  }
}

