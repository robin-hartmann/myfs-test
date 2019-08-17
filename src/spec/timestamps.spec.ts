import { initializeTest } from 'util/test';
import { validateTimes, resolve, Times } from 'util/fs';
import { statSync, writeFileSync, readFileSync, appendFileSync } from 'fs';

const test = initializeTest(true);
const fileName = 'test';
let fileTimes: Times;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function flooredNow() {
  // fs times only have a resolution of seconds
  return Math.floor(Date.now() / 1000) * 1000;
}

test.serial('atime, ctime and mtime are initialized when a file is created', (t) => {
  const path = resolve(t, fileName);
  const now = flooredNow();

  fileTimes = {
    atimeMs: now,
    ctimeMs: now,
    mtimeMs: now,
  };

  writeFileSync(path, '');
  validateTimes(t, statSync(path), fileTimes);
});

test.serial.skip('(only) atime is updated when file is read', async (t) => {
  await sleep(2000);

  const path = resolve(t, fileName);

  fileTimes.atimeMs = flooredNow();

  // does not trigger a call to fuseRead, so atime can't be updated
  readFileSync(path);
  validateTimes(t, statSync(path), fileTimes);
});

test.serial('(only) ctime and mtime are updated when file content is modified', async (t) => {
  await sleep(2000);

  const path = resolve(t, fileName);

  fileTimes.ctimeMs = fileTimes.mtimeMs = flooredNow();

  appendFileSync(path, 'test');
  validateTimes(t, statSync(path), fileTimes);
});
