type Func = (...args: any[]) => string

/** @deprecated Preffer ./e2e.ts's test ids generator  */
export const preffixTestIds =
  (preffix: string) =>
  <
    const M extends {
      [k: string]: string | Func
    }
  >(
    testIds: M
  ) => {
    for (let key in testIds)
      if (typeof testIds[key] === 'function') {
        const originalFunction = testIds[key] as Func
        testIds[key] = ((...args: any[]) =>
          `${preffix}-${originalFunction(...args)}`) as any
      } else testIds[key] = `${preffix}-${testIds[key]}` as any
    return testIds
  }