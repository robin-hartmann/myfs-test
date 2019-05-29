import * as execa from 'execa';

import { IUmount, IsMountedResult } from './interface';

async function umount(device: string) {
  return execa('fusermount', ['-u', device])
    .then(() => { });
}

async function isMounted(device: string) {
  return new Promise<IsMountedResult>((resolve, reject) => {
    execa('findmnt', [device])
      .on('error', reject)
      .on('exit', code => resolve(code === 0));
  });
}

const api: IUmount = {
  umount,
  isMounted,
};

export = api;
