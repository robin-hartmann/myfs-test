import ava, { ExecutionContext as GenericExecutionContext, TestInterface } from 'ava';
import { TMP_DIR, TMP_BASE_PREFIX } from 'util/tmp';

export interface CleanupCb {
  (): void;
}

export interface Context {
  cleanupCbs: CleanupCb[];
  containerPath: string;
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

export type TypedExecutionContext = GenericExecutionContext<Context>;

export const test = ava as TestInterface<Context>;

export function init(t: TypedExecutionContext) {
  t.context.initFiles = [];
  t.context.cleanupCbs = [];
}

export function setSuccess(t: TypedExecutionContext) {
  t.context.success = true;
}

export function cleanup(t: TypedExecutionContext) {
  t.log('the following context was used:', {
    containerFile: t.context.containerPath,
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
    // tslint:disable-next-line: max-line-length
    t.log(`to delete all files created by myfs-test, just run "rm -rf ${TMP_DIR}/${TMP_BASE_PREFIX}*"`);
  }
}
