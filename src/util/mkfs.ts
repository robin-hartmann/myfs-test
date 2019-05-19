import { exec as cbBasedExec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { resolve } from 'path';

import { TypedExecutionContext, FileInfo } from 'util/test';
import { generateFile } from 'util/data';
import { getName, createDir } from 'util/tmp';

const exec = promisify(cbBasedExec);

export const mkfs = async (t: TypedExecutionContext, initFiles: FileInfo[] = []) => {
  const BIN_MKFS = process.env.MYFS_BIN_MKFS;

  if (!(BIN_MKFS && existsSync(BIN_MKFS))) {
    // tslint:disable-next-line max-line-length
    throw new Error("The location of the 'mkfs' executable wasn't specified or the specified file didn't exists. Please set the environment variable 'MYFS_BIN_MKFS' to the location of the 'mkfs' executable.");
  }

  t.context.containerPath = getName(t, 'container', '.bin');

  let initFilesArg = '';

  if (initFiles.length) {
    t.context.initFilesDir = createDir(t, 'init-files');
    t.context.initFiles = initFiles;

    initFiles.forEach((file) => {
      const filePathAbs = resolve(t.context.initFilesDir, file.path);

      generateFile(filePathAbs, file.byteCount);
      initFilesArg += ` "${filePathAbs}"`;
    });
  }

  try {
    // @todo pipe stdout and stderr into logfile
    await exec(`"${BIN_MKFS}" "${t.context.containerPath}" ${initFilesArg}`);
  } catch (e) {
    throw new Error(`Error while creating container\n${e}`);
  }
};
