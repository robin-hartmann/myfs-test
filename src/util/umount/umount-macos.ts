import { umount as cbBasedUmount, isMounted as cbBasedIsMounted } from 'umount';

import { IUmount, IsMountedResult } from './interface';

async function umount(device: string) {
  return new Promise<void>((resolve, reject) =>
    cbBasedUmount(device, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    }));
}

async function isMounted(device: string) {
  return new Promise<IsMountedResult>((resolve, reject) =>
    cbBasedIsMounted(device, (error, isMounted) => {
      if (error) {
        reject(error);
      } else {
        resolve(isMounted as boolean);
      }
    }));
}

const api: IUmount = {
  umount,
  isMounted,
};

export = api;
