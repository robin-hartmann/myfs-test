import {
  readdirSync, statSync,
} from 'fs';

import { initializeTest } from 'util/test';
import { getPath, validateRootAttrs } from 'util/fs';

const test = initializeTest();

// @todo
// test.serial.todo('allows to open a maximum of 64 files');

test('root directory has proper attributes', validateRootAttrs);

test('contains no files and no directories', (t) => {
  const statsArray = readdirSync(t.context.mountDir)
    .map(entryName => statSync(getPath(t, entryName)));
  const dirCount = statsArray.filter(stats => stats.isDirectory()).length;
  const fileCount = statsArray.filter(stats => stats.isFile()).length;

  t.is(dirCount, 0);
  t.is(fileCount, 0);
});
