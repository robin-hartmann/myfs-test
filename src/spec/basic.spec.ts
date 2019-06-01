import {
  existsSync,
  closeSync,
  openSync,
  readFileSync,
  writeFileSync,
  appendFileSync,
  unlinkSync,
} from 'fs';

import { initializeTest } from 'util/test';
import { getPath, validateAllFileAttrs, remount } from 'util/fs';

const test = initializeTest(true);
const fileName1 = 'neuedatei1.txt';
const fileName2 = 'neuedatei2.txt';
const content1 = 'Hello World';
const content2 = 'Hello World 2';

test.serial('can create file without content', (t) => {
  const path = getPath(t, fileName1);

  closeSync(openSync(path, 'w'));
  t.is(readFileSync(path).toString(), '');
});

test.serial('can create file with content', (t) => {
  const path = getPath(t, fileName2);

  writeFileSync(path, content1);
  t.is(readFileSync(path).toString(), content1);
});

test.serial('can overwritte files', (t) => {
  const path1 = getPath(t, fileName1);
  const path2 = getPath(t, fileName2);

  t.true(existsSync(path1));
  t.true(existsSync(path2));
  writeFileSync(path1, content1);
  writeFileSync(path2, content2);
  t.is(readFileSync(path1).toString(), content1);
  t.is(readFileSync(path2).toString(), content2);
});

test.serial('can append to file', (t) => {
  const path = getPath(t, fileName1);

  t.true(existsSync(path));
  appendFileSync(path, content2);
  t.is(readFileSync(path).toString(), content1 + content2);
});

test.serial('all files have proper attributes', validateAllFileAttrs);

test.serial('can delete file', (t) => {
  const path = getPath(t, fileName1);

  unlinkSync(path);
  t.false(existsSync(path));
});

test.serial('changes are persisted', async (t) => {
  await remount(t);

  const path1 = getPath(t, fileName1);
  const path2 = getPath(t, fileName2);

  t.false(existsSync(path1));
  t.is(readFileSync(path2).toString(), content2);

  validateAllFileAttrs(t);
});
