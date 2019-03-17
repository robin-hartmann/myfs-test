import { exec as cbBasedExec } from 'child_process';
import { realpathSync, existsSync } from 'fs';
import { dirSync, fileSync, setGracefulCleanup } from 'tmp';
import { promisify } from 'util';

import { ExecutionContext } from 'util/test';
import { umount, isMounted as promiseBasedIsMounted } from 'util/umount/umount';

setGracefulCleanup();

const exec = promisify(cbBasedExec);

export const mount = async (t: ExecutionContext) => {
  const BIN_MOUNT = process.env.MYFS_BIN_MOUNT;

  if (!(BIN_MOUNT && existsSync(BIN_MOUNT))) {
    // tslint:disable-next-line max-line-length
    throw new Error("The location of the 'mount' executable wasn't specified or the specified file didn't exists. Please set the environment variable 'MYFS_BIN_MOUNT' to the location of the 'mount' executable.");
  }

  const logFile = fileSync({ prefix: 'myfs-log-', postfix: '.log' });
  const mountDir = dirSync({ prefix: 'myfs-mount-', unsafeCleanup: true });

  t.context.logFile = logFile.name;
  // required, because /tmp is just a link to /private/tmp
  // and umount doesn't seem to work when used on links
  // @todo find a better solution
  t.context.mountDir = realpathSync(mountDir.name);

  if (!t.context.containerFile) {
    throw new Error('Context is missing required attribute "containerFile"');
  }

  try {
    // tslint:disable-next-line: max-line-length
    await exec(`"${BIN_MOUNT}" "${t.context.containerFile}" "${t.context.logFile}" "${t.context.mountDir}"`);
  } catch (e) {
    throw new Error(`Error while mounting device\n${e}`);
  }
};

export const unmount = async (t: ExecutionContext) => {
  if (!t.context.mountDir) {
    throw new Error('Context is missing required attribute "mountDir"');
  }

  try {
    await umount(t.context.mountDir);
  } catch (e) {
    throw new Error(`Error while unmounting device\n${e}`);
  }
};

export const isMounted = async (t: ExecutionContext) => {
  if (!t.context.mountDir) {
    throw new Error('Context is missing required attribute "mountDir"');
  }

  try {
    return await promiseBasedIsMounted(t.context.mountDir);
  } catch (e) {
    throw new Error(`Error while checking if device is mounted\n${e}`);
  }
};
