const _defaultDelay = 5

const asynchronous = <T = void>(fn: () => T, delay = _defaultDelay) =>
  (new Promise((resolve, reject) =>
    setTimeout(() => {
      try {
        resolve(fn())
      } catch (err) {
        reject(err)
      }
    }, delay)
  ) as unknown) as Promise<T extends Promise<infer P> ? P : T>

const asynchronousFn = <T = void>(fn: () => T, delay = _defaultDelay) => () =>
  asynchronous(fn, delay)

const asynchronousVal = <T = unknown>(val: T, delay = _defaultDelay) =>
  (new Promise((resolve, reject) =>
    setTimeout(() => {
      try {
        resolve(val)
      } catch (err) {
        reject(err)
      }
    }, delay)
  ) as unknown) as Promise<T extends Promise<infer P> ? P : T>

export { asynchronous, asynchronousFn, asynchronousVal }
