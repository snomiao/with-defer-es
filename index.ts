// - [Javascript release resources automatically (like RAII) - Stack Overflow]( https://stackoverflow.com/questions/11693963/javascript-release-resources-automatically-like-raii )
type Awaitable<T> = PromiseLike<T> | T;
type Action = () => Awaitable<void>;
type Defer = (action: Action) => Awaitable<void>;

export default async function withDefer(fn: (defer: Defer) => Awaitable<void>) {
  const stack = [] as Action[];
  const defer: Defer = (action) => {
    stack.push(action);
  };
  const errors: unknown[] = [];

  try {
    return await fn(defer);
  } catch (e) {
    errors.push(e);
  } finally {
    while (stack.length) {
      try {
        const action = stack.pop()!;
        await action();
      } catch (e) {
        errors.push(e);
      }
    }
    // for (const e of errors.slice(1)) {
    // await error("error in deferred action: " + e);
    // }
    if (errors.length) {
      const WithDeferError = Object.assign(new Error("WithDefer Errors"), {
        errors,
      });
      throw WithDeferError;
    }
  }
}
