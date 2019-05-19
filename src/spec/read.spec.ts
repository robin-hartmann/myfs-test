import {
  readdirSync, constants as fsConstants, statSync,
} from 'fs';
import { userInfo as getUserInfo } from 'os';

import { initializeTest } from 'util/test';
import { getPath } from 'util/fs';

const test = initializeTest();

test.serial.todo('allows to open a maximum of 64 files');

test('root directory has proper attributes', (t) => {
  const stats = statSync(getPath(t, '.'));
  const userInfo = getUserInfo();

  t.is(stats.mode & fsConstants.S_IFMT, fsConstants.S_IFDIR);
  t.is(stats.mode & ~fsConstants.S_IFMT, 0o755);
  t.is(stats.nlink, 2);
  t.is(stats.uid, userInfo.uid);
  t.is(stats.gid, userInfo.gid);
});

test('contains no files and no directories', (t) => {
  const statsArray = readdirSync(t.context.mountDir)
    .map(entryName => statSync(getPath(t, entryName)));
  const dirCount = statsArray.filter(stats => stats.isDirectory()).length;
  const fileCount = statsArray.filter(stats => stats.isFile()).length;

  t.is(dirCount, 0);
  t.is(fileCount, 0);
});

test.skip('all files have proper attributes', (t) => {
  const userInfo = getUserInfo();
  const files = readdirSync(t.context.mountDir)
    .map(entryName => ({
      entryName,
      stats: statSync(getPath(t, entryName)),
    }))
    .filter(entryInfo => entryInfo.stats.isFile());

  files.forEach((fileInfo) => {
    const stats = fileInfo.stats;

    t.is(stats.uid, userInfo.uid);
    t.is(stats.gid, userInfo.gid);
    t.is(stats.mode & fsConstants.S_IFMT, fsConstants.S_IFREG);
    t.is(stats.mode & ~fsConstants.S_IFMT, 0o644);
    t.is(stats.nlink, 1);
    // @todo check other attributes and content
  });
});
