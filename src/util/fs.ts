import { resolve } from 'path';
import { userInfo as getUserInfo } from 'os';
import {
  readdirSync, statSync,
  constants as fsConstants,
} from 'fs';

import { TypedExecutionContext } from 'util/test';
import { unmount, isMounted, mount } from 'util/mount';

export function getPath(t: TypedExecutionContext, entryName: string) {
  return resolve(t.context.mountDir, entryName);
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
  const stats = statSync(getPath(t, '.'));
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
  const files = readdirSync(t.context.mountDir)
    .map(entryName => statSync(getPath(t, entryName)))
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
