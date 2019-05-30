import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { sync as getPkgRoot } from 'pkg-dir';

const LOREM_IPSUM_NAME = 'lorem-ipsum-1000.txt';
const PKG_ROOT = getPkgRoot(__dirname) as string;
const PKG_RES = resolve(PKG_ROOT, 'res');
const LOREM_IPSUM = readFileSync(resolve(PKG_RES, LOREM_IPSUM_NAME));

export const generateData = (byteCount: number) => {
  const data = Buffer.allocUnsafe(byteCount);
  let remainingBytes = byteCount;

  while (remainingBytes > 0) {
    remainingBytes -= LOREM_IPSUM.copy(
      data,
      byteCount - remainingBytes,
      0,
      Math.min(LOREM_IPSUM.byteLength, remainingBytes),
    );
  }

  if (remainingBytes) {
    throw new Error('remainingBytes must be 0');
  }

  return data;
};

export const generateFile = (path: string, byteCount: number) => {
  if (existsSync(path)) {
    throw new Error(`file "${path}" already exists`);
  }

  const dir = dirname(path);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(path, generateData(byteCount));
};
