import { exec as cbBasedExec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { resolve } from 'path';

import { ExecutionContext, FileInfo, getTmpName, getTmpDir } from 'util/test';
import { generateFile } from 'util/data';

const exec = promisify(cbBasedExec);

export const mkfs = async (t: ExecutionContext, initFiles: FileInfo[] = []) => {
  const BIN_MKFS = process.env.MYFS_BIN_MKFS;

  if (!(BIN_MKFS && existsSync(BIN_MKFS))) {
    // tslint:disable-next-line max-line-length
    throw new Error("The location of the 'mkfs' executable wasn't specified or the specified file didn't exists. Please set the environment variable 'MYFS_BIN_MKFS' to the location of the 'mkfs' executable.");
  }

  const containerFile = getTmpName(t, 'container', '.bin');

  t.context.containerFile = containerFile;

  let initFilesArg = '';

  if (initFiles.length) {
    const initFilesDir = getTmpDir(t, 'init-files');

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
