import { resolve as pathResolve } from 'path';
import { userInfo as getUserInfo } from 'os';
import {
  readdirSync, statSync,
  constants as fsConstants,
  openSync,
  writeSync,
  readFileSync,
  closeSync,
  Stats,
} from 'fs';

import { TypedExecutionContext } from 'util/test';
import { unmount, isMounted, mount } from 'util/mount';
import { generateData } from 'util/data';

export interface Times {
  atimeMs: number;
  ctimeMs: number;
  mtimeMs: number;
}

export interface FragmentedByteCount {
  gapLength: number;
  byteCount: number;
}

function isSameOrShortlyAfter(expected: number, actual: number) {
  return actual >= expected && actual <= expected + 1000;
}

export async function remount(t: TypedExecutionContext) {
  await unmount(t);
  t.false(await isMounted(t));
  await mount(t);
  t.true(await isMounted(t));
}

export function resolve(t: TypedExecutionContext, entryName: string = '.') {
  return pathResolve(t.context.mountDir, entryName);
}

export function getEntriesStats(t: TypedExecutionContext) {
  return readdirSync(t.context.mountDir)
    .map(entryName => statSync(resolve(t, entryName)));
}

export function getFiles(t: TypedExecutionContext, expectedFileCount?: number) {
  const files = getEntriesStats(t)
    .filter(stats => stats.isFile());

  if (expectedFileCount !== undefined) {
    t.is(files.length, expectedFileCount);
  }

  return files;
}

export function isEqual(t: TypedExecutionContext, a: Buffer, b: Buffer, message?: string) {
  t.is(a.length, b.length, message);
  t.is(a.toString(), b.toString(), message);
}

export function simpleWrite(fileName: string, byteCount: number, shouldRemount: boolean = false) {
  return fragmentedWrite(fileName, [{ byteCount, gapLength: 0 }], shouldRemount);
}

export function fragmentedWrite(
  fileName: string,
  fragmentedByteCounts: FragmentedByteCount[],
  shouldRemount: boolean = false,
) {
  return async function (t: TypedExecutionContext) {
    const path = resolve(t, fileName);
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

    isEqual(t, readFileSync(fd), entireData, 'before remount');
    closeSync(fd);

    if (!shouldRemount) {
      return;
    }

    await remount(t);
    isEqual(t, readFileSync(path), entireData, 'after remount');
  };
}

export function validateTimes(t: TypedExecutionContext, stats: Stats, expectedTimes?: Times) {
  if (!expectedTimes) {
    return;
  }

  const acEqual = expectedTimes.atimeMs === expectedTimes.ctimeMs;
  const amEqual = expectedTimes.atimeMs === expectedTimes.mtimeMs;
  const cmEqual = expectedTimes.ctimeMs === expectedTimes.mtimeMs;

  if (acEqual && amEqual) {
    t.is(stats.atimeMs, stats.ctimeMs);
    t.is(stats.atimeMs, stats.mtimeMs);
    t.true(isSameOrShortlyAfter(expectedTimes.atimeMs, stats.atimeMs));
  } else if (acEqual) {
    t.is(stats.atimeMs, stats.ctimeMs);
    t.not(stats.atimeMs, stats.mtimeMs);
    t.true(isSameOrShortlyAfter(expectedTimes.atimeMs, stats.atimeMs));
    t.true(isSameOrShortlyAfter(expectedTimes.mtimeMs, stats.mtimeMs));
  } else if (amEqual) {
    t.not(stats.atimeMs, stats.ctimeMs);
    t.is(stats.atimeMs, stats.mtimeMs);
    t.true(isSameOrShortlyAfter(expectedTimes.atimeMs, stats.atimeMs));
    t.true(isSameOrShortlyAfter(expectedTimes.ctimeMs, stats.ctimeMs));
  } else if (cmEqual) {
    t.not(stats.atimeMs, stats.ctimeMs);
    t.is(stats.ctimeMs, stats.mtimeMs);
    t.true(isSameOrShortlyAfter(expectedTimes.atimeMs, stats.atimeMs));
    t.true(isSameOrShortlyAfter(expectedTimes.ctimeMs, stats.ctimeMs));
  } else {
    t.not(stats.atimeMs, stats.ctimeMs);
    t.not(stats.atimeMs, stats.mtimeMs);
    t.not(stats.ctimeMs, stats.mtimeMs);
    t.true(isSameOrShortlyAfter(expectedTimes.atimeMs, stats.atimeMs));
    t.true(isSameOrShortlyAfter(expectedTimes.ctimeMs, stats.ctimeMs));
    t.true(isSameOrShortlyAfter(expectedTimes.mtimeMs, stats.mtimeMs));
  }
}

export function validateRootAttrs(t: TypedExecutionContext) {
  const stats = statSync(resolve(t));
  const userInfo = getUserInfo();

  t.true(stats.isDirectory());
  t.is(stats.mode & fsConstants.S_IFMT, fsConstants.S_IFDIR);
  t.is(stats.mode & ~fsConstants.S_IFMT, 0o755);
  t.is(stats.uid, userInfo.uid);
  t.is(stats.gid, userInfo.gid);
  t.is(stats.nlink, 2);
}

export function validateFilesAttrs(t: TypedExecutionContext, expectedFileCount?: number) {
  const userInfo = getUserInfo();
  const files = getFiles(t, expectedFileCount);

  files.forEach((stats) => {
    t.is(stats.mode & fsConstants.S_IFMT, fsConstants.S_IFREG);
    t.is(stats.mode & ~fsConstants.S_IFMT, 0o644);
    t.is(stats.uid, userInfo.uid);
    t.is(stats.gid, userInfo.gid);
    t.is(stats.nlink, 1);
  });
}
