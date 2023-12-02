"use strict";
export default async function withDefer(fn) {
  const stack = [];
  const defer = (action) => {
    stack.push(action);
  };
  const errors = [];
  try {
    return await fn(defer);
  } catch (e) {
    errors.push(e);
  } finally {
    while (stack.length) {
      try {
        const action = stack.pop();
        await action();
      } catch (e) {
        errors.push(e);
      }
    }
    if (errors.length) {
      const WithDeferError = Object.assign(new Error("WithDefer Errors"), {
        errors
      });
      throw WithDeferError;
    }
  }
}
