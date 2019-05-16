import ava, { ExecutionContext as GenericExecutionContext, TestInterface } from 'ava';
import { SynchrounousResult as TmpResult } from 'tmp';
import { unlinkSync } from 'fs';

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

export const init = (t: ExecutionContext) => {
  t.context.initFiles = [];
  t.context.cleanupCbs = [];
};

export const addToCleanup = (t: ExecutionContext, ...files: (TmpResult | string)[]) => {
  files.forEach(file => addToCleanupInternal(t, file));
};

const addToCleanupInternal = (t: ExecutionContext, file: TmpResult | string) => {
  let cleanupCb: CleanupCb;

  if (typeof file === 'string') {
    cleanupCb = () => unlinkSync(file);
  } else {
    cleanupCb = file.removeCallback;
  }

  t.context.cleanupCbs.push(cleanupCb);
};

export const setSuccess = (t: ExecutionContext) => {
  t.context.success = true;
};

export const cleanup = (t: ExecutionContext) => {
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
  }
};
