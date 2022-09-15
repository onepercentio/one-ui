// This file has been created to optimize module bundling and ignore development utility
// when on production by unused imports

import { AsyncQueueErrors } from "./AsyncProcessQueue";

/** This count how many registrations have been made */
let amountOfRestorationThatShouldBeNeeded = 0;

/**
 * Binds to the promise and checks if a restore has been registered when finishing
 * @param promise
 */
export function securePromise<T>(promise: Promise<T>) {
  function validate() {
    if (amountOfRestorationThatShouldBeNeeded === 0) {
      throw new Error(AsyncQueueErrors.RECOVERY_IS_NOT_BEING_CALLED);
    }
  }
  return promise
    .then((e) => {
      validate();
      return e;
    })
    .catch((e) => {
      validate();
      return Promise.reject(e);
    })
    .finally(() =>
      amountOfRestorationThatShouldBeNeeded > 0
        ? amountOfRestorationThatShouldBeNeeded--
        : 0
    );
}

/** This registers that a registration has been made an this will be recoverable */
export function countRegistration() {
  amountOfRestorationThatShouldBeNeeded++;
}
