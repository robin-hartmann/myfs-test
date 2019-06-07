import { resolve as pathResolve } from 'path';
import { userInfo as getUserInfo } from 'os';
import {
  readdirSync, statSync,
  constants as fsConstants,
} from 'fs';

import { TypedExecutionContext } from 'util/test';
import { unmount, isMounted, mount } from 'util/mount';

export function resolve(t: TypedExecutionContext, entryName: string = '.') {
  return pathResolve(t.context.mountDir, entryName);
}

export function getEntriesStats(t: TypedExecutionContext) {
  return readdirSync(t.context.mountDir)
    .map(entryName => statSync(resolve(t, entryName)));
}

export async function remount(t: TypedExecutionContext) {
  await unmount(t);
  t.false(await isMounted(t));
  await mount(t);
  t.true(await isMounted(t));
}

export function testEquality(t: TypedExecutionContext, a: Buffer, b: Buffer, message?: string) {
  t.is(a.length, b.length, message);
  t.is(a.toString(), b.toString(), message);
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

export function validateAllFileAttrs(t: TypedExecutionContext) {
  const userInfo = getUserInfo();
  const files = getEntriesStats(t)
    .filter(stats => stats.isFile());

  files.forEach((stats) => {
    t.is(stats.mode & fsConstants.S_IFMT, fsConstants.S_IFREG);
    t.is(stats.mode & ~fsConstants.S_IFMT, 0o644);
    t.is(stats.uid, userInfo.uid);
    t.is(stats.gid, userInfo.gid);
    t.is(stats.nlink, 1);
    // @todo check other attributes
  });
}
