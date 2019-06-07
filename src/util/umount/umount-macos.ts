import { umount as cbBasedUmount, isMounted as cbBasedIsMounted } from 'umount';

export async function umount(device: string) {
  return new Promise<void>((resolve, reject) =>
    cbBasedUmount(device, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    }));
}

export async function isMounted(device: string) {
  return new Promise<boolean>((resolve, reject) =>
    cbBasedIsMounted(device, (error, isMounted) => {
      if (error) {
        reject(error);
      } else {
        resolve(isMounted as boolean);
      }
    }));
}
