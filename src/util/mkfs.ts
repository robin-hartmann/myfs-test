import { existsSync, createWriteStream } from 'fs';
import { resolve } from 'path';
import * as execa from 'execa';

import { TypedExecutionContext } from 'util/test';
import { generateFile } from 'util/data';

export const mkfs = async (t: TypedExecutionContext) => {
  const BIN_MKFS = process.env.MYFS_BIN_MKFS;

  if (!(BIN_MKFS && existsSync(BIN_MKFS))) {
    // tslint:disable-next-line max-line-length
    throw new Error("The location of the 'mkfs' executable wasn't specified or the specified file didn't exists. Please set the environment variable 'MYFS_BIN_MKFS' to the location of the 'mkfs' executable.");
  }

  const args = [t.context.containerPath];

  t.context.initFiles.forEach((file) => {
    const filePathAbs = resolve(t.context.initFilesDir, file.path);

    generateFile(filePathAbs, file.byteCount);
    args.push(filePathAbs);
  });

  const outStream = createWriteStream(t.context.mkfsOutLogFile, { flags: 'a' });
  const errStream = createWriteStream(t.context.mkfsErrLogFile, { flags: 'a' });

  try {
    const childProcess = execa(BIN_MKFS, args);

    childProcess.stdout.pipe(outStream);
    childProcess.stderr.pipe(errStream);

    await childProcess;
  } catch (e) {
    throw new Error(`Error while creating container\n${e}`);
  }
};
