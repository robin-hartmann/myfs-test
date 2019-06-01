import { openSync, writeSync, readFileSync, closeSync } from 'fs';

import { initializeTest, TypedExecutionContext } from 'util/test';
import { generateData } from 'util/data';
import { getPath, testEquality, remount } from 'util/fs';

const test = initializeTest();
const blockSize = 512;
const fileName = 'lorem-ipsum.txt';

function simpleWrite(byteCount: number) {
  return fragmentedWrite([{ byteCount, gapLength: 0 }]);
}

function fragmentedWrite(fragmentedByteCounts: { gapLength: number, byteCount: number }[]) {
  return async function (t: TypedExecutionContext) {
    const path = getPath(t, fileName);
    // open file for reading and writing
    // the file is created (if it does not exist) or it fails (if it exists)
    const fd = openSync(path, 'wx+');
    let entireData = Buffer.from('');
    let lastFragmentEnd = 0;

    for (const fragment of fragmentedByteCounts) {
      const data = generateData(fragment.byteCount);
      const zeroes = Buffer.alloc(fragment.gapLength);
      const position = lastFragmentEnd + fragment.gapLength;

      lastFragmentEnd = position + data.length;
      entireData = Buffer.concat([entireData, zeroes, data]);
      writeSync(fd, data, 0, data.length, position);
    }

    testEquality(t, readFileSync(fd), entireData, 'before remount');
    closeSync(fd);

    await remount(t);
    testEquality(t, readFileSync(path), entireData, 'after remount');
  };
}

test('entire first block', simpleWrite(blockSize));
test('entire first block - 1', simpleWrite(blockSize - 1));
test('entire first block + 1', simpleWrite(blockSize + 1));

test('entire first two blocks', simpleWrite(blockSize * 2));
test('entire first two blocks - 1', simpleWrite(blockSize * 2 - 1));
test('entire first two blocks + 1', simpleWrite(blockSize * 2 + 1));

test('entire first five blocks', simpleWrite(blockSize * 5));
test('entire first five blocks - 1', simpleWrite(blockSize * 5 - 1));
test('entire first five blocks + 1', simpleWrite(blockSize * 5 + 1));

test('first block and half of second', simpleWrite(blockSize * 1.5));
test('first block and half of fifth', simpleWrite(blockSize * 4.5));

test('only second block', fragmentedWrite([{
  gapLength: blockSize,
  byteCount: blockSize,
}]));
test('only third and fifth block', fragmentedWrite([
  {
    gapLength: blockSize * 2,
    byteCount: blockSize,
  },
  {
    gapLength: blockSize,
    byteCount: blockSize,
  },
]));
test('only sixth and seventh block and blocks ten to twelve', fragmentedWrite([
  {
    gapLength: blockSize * 5,
    byteCount: blockSize * 2,
  },
  {
    gapLength: blockSize * 2,
    byteCount: blockSize * 3,
  },
]));
test('only half of block four and five', fragmentedWrite([{
  gapLength: blockSize * 3.5,
  byteCount: blockSize * 2,
}]));
