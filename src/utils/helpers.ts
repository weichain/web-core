// `assert` does not work with arrow functions
export function invariant<T extends unknown>(condition: T, error: string): asserts condition {
  if (condition) {
    return
  }

  throw new Error(error)
}
