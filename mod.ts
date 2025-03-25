// deno-lint-ignore-file no-explicit-any
const optionInternalSymbol = Symbol("OptionInternal");

export class Option<T> {
  static {
    Object.defineProperty(this, "name", {
      value: "Option",
      writable: false,
      enumerable: false,
      configurable: true,
    });
  }
  static readonly universalNominality = "jsr.io/@luma-dev/option-ts/Option";

  readonly #isSome: boolean;
  readonly #value: T;

  /**
   * Do not use this directly. This constructor is marked as public only just for type information purposes, like for InstanceType<>.
   * Use one of Option.none, Option.from, Option.fromNullish instead.
   * Less motivated, but also, Option.fromNullable and Option.fromOptional is also defined.
   */
  constructor(
    _doNotUseThisConstructor: typeof optionInternalSymbol,
    isSome: boolean,
    value?: T,
  ) {
    // Not checking if the symbol provided is really the symbol for the performance.
    this.#isSome = isSome;
    // Actually, this could be undefined and T doesn't accept it.
    this.#value = value!;
  }

  // Only 2 static functions following are allowed to use the constructor.
  static none<T>(): Option<T> {
    return new Option(optionInternalSymbol, false);
  }
  static from<T>(value: T): Option<T> {
    return new Option(optionInternalSymbol, true, value);
  }

  isSome(): boolean {
    return this.#isSome;
  }
  isNone(): boolean {
    return !this.#isSome;
  }
  static isOption<T>(value: unknown): value is Option<T> {
    if (value === null || typeof value !== "object") {
      return false;
    }
    const constructor = value.constructor;
    if (typeof constructor !== "function") {
      return false;
    }
    if (!Object.prototype.hasOwnProperty.call(value, "universalNominality")) {
      return false;
    }
    const universalNominality = (value as any).universalNominality;
    if (typeof universalNominality !== "string") {
      return false;
    }
    if (universalNominality !== "jsr.io/@luma-dev/option-ts/Option") {
      return false;
    }
    return true;
  }
  map<U>(mapFn: (value: T) => U): Option<U> {
    if (this.isSome()) {
      return Option.from(mapFn(this.#value));
    }
    return Option.none();
  }
  async mapAsync<U>(
    mapFn: (value: T) => U,
  ): Promise<Option<Awaited<U>>> {
    if (this.isSome()) {
      return Option.from(await mapFn(this.#value));
    }
    return Option.none();
  }

  flatten(): T extends Option<infer I> ? Option<I> : Option<T> {
    if (this.isSome() && Option.isOption(this.#value)) {
      return this.#value as any;
    }
    return this as any;
  }
  and(other: Option<T>): Option<T> {
    if (this.isSome()) {
      return other;
    }
    return Option.none();
  }
  or(other: Option<T>): Option<T> {
    if (this.isSome()) {
      return this;
    }
    return other;
  }
  andThen<U>(andThenFn: (value: T) => Option<U>): Option<U> {
    if (this.isSome()) {
      return andThenFn(this.#value);
    }
    return Option.none();
  }
  async andThenAsync<U>(
    andThenFn: (value: T) => Option<U> | Promise<Option<U>>,
  ): Promise<Option<U>> {
    if (this.isSome()) {
      return await andThenFn(this.#value);
    }
    return Option.none();
  }
  orElse(orElseFn: () => Option<T>): Option<T> {
    if (this.isSome()) {
      return this;
    }
    return orElseFn();
  }
  async orElseAsync(
    orElseFn: () => Option<T> | Promise<Option<T>>,
  ): Promise<Option<T>> {
    if (this.isSome()) {
      return this;
    }
    return await orElseFn();
  }
  filter<P extends T>(
    predicate: (value: T) => value is P,
  ): Option<P>;
  filter(
    predicate: (value: T) => boolean,
  ): Option<T>;
  filter(
    predicate: (value: T) => boolean,
  ): Option<T> {
    if (this.isSome() && predicate(this.#value)) {
      return Option.from(this.#value);
    }
    return Option.none();
  }
  async filterAsync(
    predicate: (value: T) => boolean | Promise<boolean>,
  ): Promise<Option<T>> {
    if (this.isSome() && await predicate(this.#value)) {
      return Option.from(this.#value);
    }
    return Option.none();
  }
  filterMap<U>(filterMapFn: (value: T) => Option<U>): Option<U> {
    if (this.isSome()) {
      return filterMapFn(this.#value);
    }
    return Option.none();
  }
  async filterMapAsync<U>(
    filterMapFn: (value: T) => Option<U> | Promise<Option<U>>,
  ): Promise<Option<U>> {
    if (this.isSome()) {
      return await filterMapFn(this.#value);
    }
    return Option.none();
  }
  is<P extends T>(predicate: (value: T) => value is P): this is Option<P> {
    return this.isNone() || predicate(this.#value);
  }
  static zip<T, U>(
    first: Option<T>,
    second: Option<U>,
  ): Option<readonly [T, U]> {
    if (first.isSome() && second.isSome()) {
      return Option.from([first.#value, second.#value]);
    }
    return Option.none();
  }
  zip<U>(other: Option<U>): Option<readonly [T, U]> {
    return Option.zip(this, other);
  }
  unwrapOr<U>(defaultValue: U): T | U {
    if (this.isSome()) {
      return this.#value;
    }
    return defaultValue;
  }
  unwrapOrElse<U>(elseFn: () => U): T | U {
    if (this.isSome()) {
      return this.#value;
    }
    return elseFn();
  }
  async unwrapOrElseAsync<U>(elseFn: () => U): Promise<T | Awaited<U>> {
    if (this.isSome()) {
      return this.#value;
    }
    return await elseFn();
  }
  unwrap(this: Option<T>): T {
    if (this.isSome()) {
      return this.#value;
    }
    throw new OptionUnwrapOnNoneError(
      "called `Option#unwrap()` on a `None` value",
      { isUserMessage: false },
    );
  }
  expect(message: string): T {
    if (this.isSome()) {
      return this.#value;
    }
    throw new OptionUnwrapOnNoneError(message);
  }
  static fromNullish<T>(value: T | null | undefined): Option<T> {
    if (value === null || value === undefined) {
      return Option.none();
    }
    return Option.from(value);
  }
  static fromNullable<T>(value: T | null): Option<T> {
    if (value === null) {
      return Option.none();
    }
    return Option.from(value);
  }
  static fromOptional<T>(value: T | undefined): Option<T> {
    if (value === undefined) {
      return Option.none();
    }
    return Option.from(value);
  }
  unwrapOrNull(): T | null {
    if (this.isSome()) {
      return this.#value;
    }
    return null;
  }
  unwrapOrUndefined(): T | undefined {
    if (this.isSome()) {
      return this.#value;
    }
    return undefined;
  }
  match<R>(someFn: (value: T) => R, noneFn: () => R): R {
    if (this.isSome()) {
      return someFn(this.#value);
    }
    return noneFn();
  }
  async awaited(): Promise<Option<Awaited<T>>> {
    if (this.isSome()) {
      return Option.from(await this.#value);
    }
    return Option.none();
  }
}

export interface OptionUnwrapOnNoneErrorOptions extends ErrorOptions {
  isUserMessage?: boolean;
}
export class OptionUnwrapOnNoneError extends Error {
  static {
    Object.defineProperty(this, "name", {
      value: "OptionUnwrapOnNoneError",
      writable: false,
      enumerable: false,
      configurable: true,
    });
    this.prototype.name = "OptionUnwrapOnNoneError";
  }
  readonly #isUserMessage: boolean;
  constructor(
    message = "",
    { isUserMessage = true, ...options }: OptionUnwrapOnNoneErrorOptions = {},
  ) {
    super(message, options);
    this.#isUserMessage = isUserMessage;
  }
  get isUserMessage(): boolean {
    return this.#isUserMessage;
  }
}
