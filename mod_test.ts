import { assertEquals, assertThrows } from "@std/assert";
import { assertType, type IsExact } from "@std/testing/types";
import { Option, OptionUnwrapOnNoneError } from "./mod.ts";

// TODO: Not enough test.
Deno.test({
  name: "Option",
  fn() {
    const some = Option.from(1);
    const none = Option.none<number>();
    assertEquals(some.isSome(), true);
    assertEquals(none.isSome(), false);
    assertEquals(some.isNone(), false);
    assertEquals(none.isNone(), true);
    assertEquals(some.unwrap(), 1);
    assertThrows(() => none.unwrap(), OptionUnwrapOnNoneError);
    assertEquals(some.unwrapOr(2), 1);
    assertEquals(none.unwrapOr(2), 2);
    assertEquals(some.unwrapOrElse(() => 2), 1);
    assertEquals(none.unwrapOrElse(() => 2), 2);
    assertEquals(some.map((v) => v + 1).unwrap(), 2);
    assertEquals(none.map((v) => v + 1).isNone(), true);
    assertEquals(some.flatten().unwrap(), 1);
    assertEquals(none.flatten().isNone(), true);
    assertEquals(some.and(Option.from(2)).unwrap(), 2);
    assertEquals(none.and(Option.from(2)).isNone(), true);
    assertEquals(some.or(Option.from(2)).unwrap(), 1);
    assertEquals(none.or(Option.from(2)).unwrap(), 2);
    assertEquals(some.andThen((v) => Option.from(v + 1)).unwrap(), 2);
    assertEquals(none.andThen((v) => Option.from(v + 1)).isNone(), true);
    assertEquals(some.orElse(() => Option.from(2)).unwrap(), 1);
    assertEquals(none.orElse(() => Option.from(2)).unwrap(), 2);
    assertEquals(some.filter((v): v is 1 => v === 1).unwrap(), 1);
    assertEquals(none.filter((v): v is 1 => v === 1).isNone(), true);
    assertEquals(some.filterMap((v) => Option.from(v + 1)).unwrap(), 2);
    assertEquals(none.filterMap((v) => Option.from(v + 1)).isNone(), true);
    assertEquals(some.is((v) => v === 1), true);
    assertEquals(some.is((v) => v === 2), false);
    assertEquals(none.is((v) => v === 123), true);
  },
});

Deno.test({
  name: "Option#unwrapOr",
  fn() {
    const v = Option.from(1).unwrapOr(null);
    assertType<IsExact<typeof v, number | null>>(true);
  },
});

Deno.test({
  name: "Option#filter",
  fn() {
    {
      const v = Option.fromNullish("abc").filter((e) => e.length > 0);
      assertEquals(v.unwrap(), "abc");
      assertType<IsExact<typeof v, Option<string>>>(true);
    }
    {
      const v = Option.fromNullish("abc").filter((e) => e === "xyz");
      assertEquals(v.isNone(), true);
      assertType<IsExact<typeof v, Option<"xyz">>>(true);
    }
  },
});
