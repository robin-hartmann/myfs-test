import { exec as cbBasedExec } from 'child_process';
import { existsSync } from 'fs';
import { promisify } from 'util';

import { TypedExecutionContext } from 'util/test';
import { umount, isMounted as promiseBasedIsMounted } from 'util/umount/umount';

const exec = promisify(cbBasedExec);

export const mount = async (t: TypedExecutionContext) => {
  const BIN_MOUNT = process.env.MYFS_BIN_MOUNT;

  if (!(BIN_MOUNT && existsSync(BIN_MOUNT))) {
    // tslint:disable-next-line max-line-length
    throw new Error("The location of the 'mount' executable wasn't specified or the specified file didn't exists. Please set the environment variable 'MYFS_BIN_MOUNT' to the location of the 'mount' executable.");
  }

  if (!t.context.containerPath) {
    throw new Error('Context is missing required attribute "containerFile"');
  }

  try {
    // tslint:disable-next-line: max-line-length
    await exec(`"${BIN_MOUNT}" "${t.context.containerPath}" "${t.context.logFile}" "${t.context.mountDir}"`);
  } catch (e) {
    throw new Error(`Error while mounting device\n${e}`);
  }
};

export const unmount = async (t: TypedExecutionContext) => {
  if (!t.context.mountDir) {
    throw new Error('Context is missing required attribute "mountDir"');
  }

  try {
    await umount(t.context.mountDir);
  } catch (e) {
    throw new Error(`Error while unmounting device\n${e}`);
  }
};

export const isMounted = async (t: TypedExecutionContext) => {
  if (!t.context.mountDir) {
    throw new Error('Context is missing required attribute "mountDir"');
  }

  try {
    return await promiseBasedIsMounted(t.context.mountDir);
  } catch (e) {
    throw new Error(`Error while checking if device is mounted\n${e}`);
  }
};
