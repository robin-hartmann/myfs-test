import ava, { ExecutionContext as GenericExecutionContext, TestInterface } from 'ava';
import { unlinkSync } from 'fs';
import { FileResult, DirResult, tmpNameSync, fileSync, dirSync, tmpdir } from 'tmp';

// @todo find better solution to patch typings
declare module 'tmp' {
  export const tmpdir: string;
}

type TmpResult = FileResult | DirResult;

interface CleanupCb {
  (): void;
}

interface Context {
  cleanupCbs: CleanupCb[];
  containerFile: string;
  initFiles: FileInfo[];
  initFilesDir: string;
  logFile: string;
  mountDir: string;
  success: boolean;
}

export interface FileInfo {
  path: string;
  byteCount: number;
}

export type ExecutionContext = GenericExecutionContext<Context>;

export const test = ava as TestInterface<Context>;

const TMP_PREFIX = 'myfs';

export function getTmpName(t: ExecutionContext, purpose: string, extension?: string) {
  const name = tmpNameSync({ prefix: getTmpPrefix(purpose), postfix: extension });
  addToCleanup(t, name);
  return name;
}

export function getTmpFile(t: ExecutionContext, purpose: string, extension?: string) {
  const file = fileSync({ prefix: getTmpPrefix(purpose), postfix: extension, keep: true });
  addToCleanup(t, file);
  return file;
}

export function getTmpDir(t: ExecutionContext, purpose: string) {
  const dir = dirSync({ prefix: getTmpPrefix(purpose), unsafeCleanup: true, keep: true });
  addToCleanup(t, dir);
  return dir;
}

export function init(t: ExecutionContext) {
  t.context.initFiles = [];
  t.context.cleanupCbs = [];
}

export function setSuccess(t: ExecutionContext) {
  t.context.success = true;
}

export function cleanup(t: ExecutionContext) {
  t.log('the following context was used:', {
    containerFile: t.context.containerFile,
    initFilesCount: t.context.initFiles.length,
    initFilesDir: t.context.initFilesDir,
    logFile: t.context.logFile,
    mountDir: t.context.mountDir,
  });

  if (t.context.success) {
    t.context.cleanupCbs.forEach(cleanupCb => cleanupCb());
    t.log('created files have been cleaned up');
  } else {
    t.log("due to failure, the created files won't be cleaned up automatically");
    t.log(`to delete all files created by myfs-test, just run "rm -rf ${tmpdir}/${TMP_PREFIX}*"`);
  }
}

function getTmpPrefix(purpose: string) {
  return `${TMP_PREFIX}-${purpose}-`;
}

function addToCleanup(t: ExecutionContext, tmpRef: TmpResult | string) {
  let cleanupCb: CleanupCb;

  if (typeof tmpRef === 'string') {
    cleanupCb = () => unlinkSync(tmpRef);
  } else {
    cleanupCb = tmpRef.removeCallback;
  }

  t.context.cleanupCbs.push(cleanupCb);
}
