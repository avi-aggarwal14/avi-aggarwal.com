/** Exhaustiveness helper: a new union member fails loudly at runtime and compile time. */
export function assertUnreachable(value: never): never {
  throw new Error(`Didn't expect to get here: ${value}`);
}
