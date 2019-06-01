import ava, { ExecutionContext as GenericExecutionContext, TestInterface } from 'ava';
import { TMP_DIR, TMP_BASE_PREFIX, createFile, createDir, getName } from 'util/tmp';

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
  mkfsOutLogFile: string;
  mkfsErrLogFile: string;
  mountLogFile: string;
  mountDir: string;
  success: boolean;
}

export interface FileInfo {
  path: string;
  byteCount: number;
}

export type TypedExecutionContext = GenericExecutionContext<Context>;

const test = ava as TestInterface<Context>;

export function initializeTest(sharedContext: boolean = false, initFiles?: FileInfo[]) {
  const before = sharedContext
    ? test.serial.before
    : test.serial.beforeEach;

  const after = sharedContext
    ? test.serial.after
    : test.serial.afterEach;

  before('init', t => init(t, initFiles));

  const createContainerTitle = initFiles
    ? `creates container with ${initFiles.length} files`
    : 'creates empty container';

  before(createContainerTitle, mkfs);

  before('mounts', async (t) => {
    t.false(await isMounted(t));
    await mount(t);
    t.true(await isMounted(t));
  });

  after.always('unmounts', async (t) => {
    t.true(await isMounted(t));
    await unmount(t);
    t.false(await isMounted(t));
  });

  after('set success', setSuccess);
  after.always('cleanup', cleanup);

  return test;
}

function init(t: TypedExecutionContext, initFiles: FileInfo[] = []) {
  t.context.initFiles = initFiles;
  t.context.cleanupCbs = [];

  // required for mkfs
  t.context.containerPath = getName(t, 'container', '.bin');
  t.context.mkfsOutLogFile = createFile(t, 'mkfs-out-log', '.log');
  t.context.mkfsErrLogFile = createFile(t, 'mkfs-err-log', '.log');

  if (t.context.initFiles.length) {
    t.context.initFilesDir = createDir(t, 'init-files');
  }

  // required for mount
  t.context.mountLogFile = createFile(t, 'mount-log', '.log');
  t.context.mountDir = createDir(t, 'mount');
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

  const context = {
    containerFile: t.context.containerPath,
    initFilesCount: t.context.initFiles.length,
    initFilesDir: t.context.initFilesDir,
    mkfsOutLogFile: t.context.mkfsOutLogFile,
    mkfsErrLogFile: t.context.mkfsErrLogFile,
    mountLogFile: t.context.mountLogFile,
    mountDir: t.context.mountDir,
  };

  (Object.keys(context) as (keyof typeof context)[])
    .filter(key => !context[key])
    .forEach(key => delete context[key]);

  t.log("due to failure, created files won't be cleaned up automatically", context);
  // tslint:disable-next-line: max-line-length
  t.log(`to delete all files created by myfs-test, just run "rm -rf ${TMP_DIR}/${TMP_BASE_PREFIX}*"`);

  if (error) {
    throw error;
  }
}
