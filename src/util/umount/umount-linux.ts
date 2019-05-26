import * as execa from 'execa';

import { IUmount } from './interface';

async function umount(device: string) {
  return execa('fusermount', ['-u', device])
    .then(() => { });
}

async function isMounted(device: string) {
  return execa('findmnt', [device])
    .then(result => result.code === 0);
}

const api: IUmount = {
  umount,
  isMounted,
};

export = api;
