import ava, { ExecutionContext as GenericExecutionContext, TestInterface } from 'ava';
import { TMP_DIR, TMP_BASE_PREFIX } from 'util/tmp';

import { mount, unmount, isMounted } from 'util/mount';
import { mkfs } from 'util/mkfs';

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

const test = ava as TestInterface<Context>;

export function initializeTest(initFiles?: FileInfo[]) {
  test.serial.beforeEach('init', init);

  const createContainerTitle = initFiles
    ? `creates container with ${initFiles.length} files`
    : 'creates empty container';

  test.serial.beforeEach(createContainerTitle, async (t) => {
    await mkfs(t, initFiles);
  });

  test.serial.beforeEach('mounts', async (t) => {
    await mount(t);
    t.true(await isMounted(t));
  });

  test.serial.afterEach.always('unmounts', async (t) => {
    await unmount(t);
    t.false(await isMounted(t));
  });

  test.serial.afterEach('set success', setSuccess);
  test.serial.afterEach.always('cleanup', cleanup);

  return test;
}

function init(t: TypedExecutionContext) {
  t.context.initFiles = [];
  t.context.cleanupCbs = [];
}

function setSuccess(t: TypedExecutionContext) {
  t.context.success = true;
}

function cleanup(t: TypedExecutionContext) {
  let error;

  if (t.context.success) {
    try {
      t.context.cleanupCbs.forEach(cleanupCb => cleanupCb());
      return;
    } catch (e) {
      error = e;
    }
  }

  t.log("due to failure, the created files won't be cleaned up automatically:", {
    containerFile: t.context.containerPath,
    initFilesCount: t.context.initFiles.length,
    initFilesDir: t.context.initFilesDir,
    logFile: t.context.logFile,
    mountDir: t.context.mountDir,
  });
  // tslint:disable-next-line: max-line-length
  t.log(`to delete all files created by myfs-test, just run "rm -rf ${TMP_DIR}/${TMP_BASE_PREFIX}*"`);

  if (error) {
    throw error;
  }
}
