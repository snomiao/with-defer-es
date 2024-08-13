import { expect, it } from "vitest";
import withDefer from "./index";

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

  expect(stdout.join("\n")).toEqual(
    `
create resource A
create resource B
release resource B
release resource A
`.trim()
  );
});

it("Returns value", async () => {
  const x = await withDefer((defer) => {
    return true;
  });

  expect(x).toEqual(true);
});
