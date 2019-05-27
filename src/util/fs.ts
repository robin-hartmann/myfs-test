import { resolve } from 'path';
import { userInfo as getUserInfo } from 'os';
import {
  readdirSync, statSync,
  constants as fsConstants,
} from 'fs';

import { TypedExecutionContext } from 'util/test';

export function getPath(t: TypedExecutionContext, entryName: string) {
  return resolve(t.context.mountDir, entryName);
}

export function validateRootAttrs(t: TypedExecutionContext) {
  const stats = statSync(getPath(t, '.'));
  const userInfo = getUserInfo();

  t.is(stats.mode & fsConstants.S_IFMT, fsConstants.S_IFDIR);
  t.is(stats.mode & ~fsConstants.S_IFMT, 0o755);
  t.is(stats.nlink, 2);
  t.is(stats.uid, userInfo.uid);
  t.is(stats.gid, userInfo.gid);
}

export function validateAllFileAttrs(t: TypedExecutionContext) {
  const userInfo = getUserInfo();
  const files = readdirSync(t.context.mountDir)
    .map(entryName => statSync(getPath(t, entryName)))
    .filter(stats => stats.isFile());

  files.forEach((stats) => {
    t.is(stats.uid, userInfo.uid);
    t.is(stats.gid, userInfo.gid);
    t.is(stats.mode & fsConstants.S_IFMT, fsConstants.S_IFREG);
    t.is(stats.mode & ~fsConstants.S_IFMT, 0o644);
    t.is(stats.nlink, 1);
    // @todo check other attributes and content
  });
}
