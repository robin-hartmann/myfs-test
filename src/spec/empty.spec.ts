import { initializeTest } from 'util/test';
import { validateRootAttrs, resolve } from 'util/fs';
import { readdirSync } from 'fs';

const test = initializeTest();

test('root directory has proper attributes', validateRootAttrs);

test('contains nothing', (t) => {
  const entries = readdirSync(resolve(t));

  t.is(entries.length, 0);
});
