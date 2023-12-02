# with-defer-es

Great thanks to  [James M. Lay](https://stackoverflow.com/a/59634819)

> Golang style
I have since found a paradigm that plays better with the way I personally use javascript. It's based on golang's defer statement. You simply wrap your code in a "scope" IIFE, and when that function is left for any reason, the deferred expressions are executed in reverse order, awaiting any promises.
by James M. Lay
https://stackoverflow.com/a/59634819

Usage:

```typescript
import withDefer from 'with-defer-es'

// or if you are still using commonjs
// const withDefer = await import( 'with-defer-es').then(e=>e.default)

withDefer(async (defer) => {
    const s = await openStream();
    defer(() => closeStream(s));

    const db = new DBConnection();
    defer(() => db.close());

    throw new Error("oh snap"); // could also be return

    // will call db.close() then closeStream(s)
});
```

index.spec.ts
```typescript

import withDefer from ".";
import {vi, it, expect } from "vitest";


it("calls releases in correctly order", async () => {
  const stdout = [] as string[];
  const stderr = [] as string[];

  console.log = (msg: string) => {
    stdout.push(String(msg));
    console.info(msg);
  };
  console.error = (msg: string) => {
    stderr.push(String(msg));
    console.warn(msg);
  };

await withDefer((defer) => {
    console.log("create resource A");
    defer(() => console.log("release resource A"));

    console.log("create resource B");
    defer(() => {
      console.log("release resource B");
      throw new Error("but got error on releasing resource B");
    });

    throw new Error("oops, something get error");

    console.log("create resource C");
    defer(() => console.log("release resource C"));
  }).catch((error) => {
    console.error(error);
  });

  expect(stdout.join("\n")).equal(
    `
create resource A
create resource B
release resource B
release resource A
`.trim()
  );
});

```

## Dev

```bash
pnpm install
pnpm test
pnpm build
```


## Reference

- [Javascript release resources automatically (like RAII) - Stack Overflow]( https://stackoverflow.com/questions/11693963/javascript-release-resources-automatically-like-raii )
- [with-defer - npm]( https://www.npmjs.com/package/with-defer )
