export async function useQueue(callbacks, timeout = 250) {
  return new Promise((resolve) => {
    if (callbacks.length) {
      setTimeout(() => {
        Promise.resolve(callbacks[0]()).then(() => {
          useQueue(callbacks.slice(1), timeout).then(() => {
            resolve();
          });
        });
      }, timeout);
    } else {
      resolve();
    }
  });
}
