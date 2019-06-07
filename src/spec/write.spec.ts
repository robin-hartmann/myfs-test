import { initializeTest } from 'util/test';
import {
  simpleWrite as genericSimpleWrite,
  fragmentedWrite as genericFragmentedWrite,
  FragmentedByteCount,
} from 'util/fs';

const test = initializeTest();
const blockSize = 512;
const fileName = 'lorem-ipsum.txt';
const shouldRemount = true;

const simpleWrite = (byteCount: number) =>
  genericSimpleWrite(fileName, byteCount, shouldRemount);
const fragmentedWrite = (fragmentedByteCounts: FragmentedByteCount[]) =>
  genericFragmentedWrite(fileName, fragmentedByteCounts, shouldRemount);

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
