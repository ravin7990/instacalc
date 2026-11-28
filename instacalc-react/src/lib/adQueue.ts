/**
 * Sequential queue for `window.atOptions`-based ad scripts.
 *
 * Multiple banner units (e.g. 468x60 and 160x600) read the global `atOptions`
 * object when their script executes. Running them in series prevents one unit
 * from overwriting `atOptions` before another finishes downloading.
 */

let queue: Promise<void> = Promise.resolve();

export function enqueueAdTask(task: () => Promise<void>): Promise<void> {
  const next = queue.then(task, task);
  queue = next.catch(() => {});
  return next;
}
