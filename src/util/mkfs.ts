import { exec as cbBasedExec } from 'child_process';
import { promisify } from 'util';
import { tmpNameSync, setGracefulCleanup, dirSync } from 'tmp';
import { unlinkSync, existsSync } from 'fs';
import { resolve } from 'path';

import { ExecutionContext, FileInfo } from 'util/test';
import { generateFile } from 'util/data';

setGracefulCleanup();

const exec = promisify(cbBasedExec);

export const mkfs = async (t: ExecutionContext, initFiles: FileInfo[] = []) => {
  const BIN_MKFS = process.env.MYFS_BIN_MKFS;

  if (!(BIN_MKFS && existsSync(BIN_MKFS))) {
    // tslint:disable-next-line max-line-length
    throw new Error("The location of the 'mkfs' executable wasn't specified or the specified file didn't exists. Please set the environment variable 'MYFS_BIN_MKFS' to the location of the 'mkfs' executable.");
  }

  const containerFile = tmpNameSync({ prefix: 'myfs-container-', postfix: '.bin' });

  t.context.containerFile = containerFile;
  t.context.cleanupCbs.push(() => unlinkSync(t.context.containerFile));

  let initFilesArg = '';

  if (initFiles.length) {
    const initFilesDir = dirSync({ prefix: 'myfs-init-files-', unsafeCleanup: true });

    t.context.initFilesDir = initFilesDir.name;
    t.context.initFiles = initFiles;

    initFiles.forEach((file) => {
      const filePathAbs = resolve(t.context.initFilesDir, file.path);

      generateFile(filePathAbs, file.byteCount);
      initFilesArg += ` "${filePathAbs}"`;
    });
  }

  try {
    // @todo pipe stdout and stderr into logfile
    await exec(`"${BIN_MKFS}" "${t.context.containerFile}" ${initFilesArg}`);
  } catch (e) {
    throw new Error(`Error while creating container\n${e}`);
  }
};
