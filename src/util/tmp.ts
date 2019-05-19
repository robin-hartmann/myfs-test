import { FileResult, DirResult, tmpNameSync, fileSync, dirSync } from 'tmp';
import { unlinkSync, realpathSync } from 'fs';
import { ENOENT } from 'constants';

import { TypedExecutionContext, CleanupCb } from 'util/test';

export { tmpdir as TMP_DIR } from 'tmp';

// @todo find better solution to patch typings
declare module 'tmp' {
  export const tmpdir: string;
}

type TmpResult = FileResult | DirResult;
type TmpRef = TmpResult | string;

export const TMP_BASE_PREFIX = 'myfs';

export function getName(t: TypedExecutionContext, purpose: string, extension?: string) {
  const name = tmpNameSync({ prefix: getFullPrefix(purpose), postfix: extension });
  const realName = resolvePath(name);
  addToCleanup(t, realName);
  return realName;
}

export function createFile(t: TypedExecutionContext, purpose: string, extension?: string) {
  const file = fileSync({ prefix: getFullPrefix(purpose), postfix: extension, keep: true });
  addToCleanup(t, file);
  return resolvePath(file.name);
}

export function createDir(t: TypedExecutionContext, purpose: string) {
  const dir = dirSync({ prefix: getFullPrefix(purpose), unsafeCleanup: true, keep: true });
  addToCleanup(t, dir);
  return resolvePath(dir.name);
}

function getFullPrefix(purpose: string) {
  return `${TMP_BASE_PREFIX}-${purpose}-`;
}

function addToCleanup(t: TypedExecutionContext, tmpRef: TmpRef) {
  let cleanupCb: CleanupCb;

  if (typeof tmpRef === 'string') {
    cleanupCb = () => unlinkSync(tmpRef);
  } else {
    cleanupCb = tmpRef.removeCallback;
  }

  t.context.cleanupCbs.push(cleanupCb);
}

// required, because /tmp is just a link to /private/tmp
// and umount doesn't seem to work when used on links
// @todo find a better solution
function resolvePath(path: string) {
  try {
    return realpathSync(path);
  } catch (e) {
    if (e.errno === -ENOENT && typeof e.path === 'string') {
      return e.path;
    }

    throw e;
  }
}
