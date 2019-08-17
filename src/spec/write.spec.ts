import { initializeTest } from 'util/test';
import {
  simpleWrite as genericSimpleWrite,
  fragmentedWrite as genericFragmentedWrite,
  FragmentedByteCount,
} from 'util/fs';
import { BLOCK_SIZE } from 'util/const';

const test = initializeTest();
const fileName = 'lorem-ipsum.txt';
const shouldRemount = true;

const simpleWrite = (byteCount: number) =>
  genericSimpleWrite(fileName, byteCount, shouldRemount);
const fragmentedWrite = (fragmentedByteCounts: FragmentedByteCount[]) =>
  genericFragmentedWrite(fileName, fragmentedByteCounts, shouldRemount);

test('entire first block', simpleWrite(BLOCK_SIZE));
test('entire first block - 1', simpleWrite(BLOCK_SIZE - 1));
test('entire first block + 1', simpleWrite(BLOCK_SIZE + 1));

test('entire first two blocks', simpleWrite(BLOCK_SIZE * 2));
test('entire first two blocks - 1', simpleWrite(BLOCK_SIZE * 2 - 1));
test('entire first two blocks + 1', simpleWrite(BLOCK_SIZE * 2 + 1));

test('entire first five blocks', simpleWrite(BLOCK_SIZE * 5));
test('entire first five blocks - 1', simpleWrite(BLOCK_SIZE * 5 - 1));
test('entire first five blocks + 1', simpleWrite(BLOCK_SIZE * 5 + 1));

test('first block to half of second', simpleWrite(BLOCK_SIZE * 1.5));
test('first block to half of fifth', simpleWrite(BLOCK_SIZE * 4.5));

test('only second block', fragmentedWrite([{
  gapLength: BLOCK_SIZE,
  byteCount: BLOCK_SIZE,
}]));
test('only third and fifth block', fragmentedWrite([
  {
    gapLength: BLOCK_SIZE * 2,
    byteCount: BLOCK_SIZE,
  },
  {
    gapLength: BLOCK_SIZE,
    byteCount: BLOCK_SIZE,
  },
]));
test('only sixth and seventh block and blocks ten to twelve', fragmentedWrite([
  {
    gapLength: BLOCK_SIZE * 5,
    byteCount: BLOCK_SIZE * 2,
  },
  {
    gapLength: BLOCK_SIZE * 2,
    byteCount: BLOCK_SIZE * 3,
  },
]));
test('only half of block four and five', fragmentedWrite([{
  gapLength: BLOCK_SIZE * 3.5,
  byteCount: BLOCK_SIZE * 2,
}]));
