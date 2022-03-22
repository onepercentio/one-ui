export function WaitTimeout(ml = 200) {
  return new Promise<void>((r) => {
    setTimeout(() => {
      r();
    }, ml);
    if (jest.isMockFunction(setTimeout)) jest.advanceTimersByTime(ml);
  });
}