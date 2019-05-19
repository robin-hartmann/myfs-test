import { exec as cbBasedExec } from 'child_process';
import { promisify } from 'util';

import { IUmount, IsMountedResult } from './interface';

const exec = promisify(cbBasedExec);

async function umount(device: string) {
  return exec(`fusermount -u "${device}"`).then(() => { });
}

async function isMounted(device: string) {
  return new Promise<IsMountedResult>((resolve, reject) => {
    cbBasedExec(`findmnt ${device}`)
      .on('error', reject)
      .on('exit', code => resolve(code === 0));
  });
}

const api: IUmount = {
  umount,
  isMounted,
};

export = api;
