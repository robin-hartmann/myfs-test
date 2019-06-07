import { initializeTest } from 'util/test';
import { validateRootAttrs, resolve } from 'util/fs';
import { readdirSync } from 'fs';

const test = initializeTest();

// @todo
// test.serial.todo('allows to open a maximum of 64 files');

test('root directory has proper attributes', validateRootAttrs);

test('contains nothing', (t) => {
  const entries = readdirSync(resolve(t));

  t.is(entries.length, 0);
});
