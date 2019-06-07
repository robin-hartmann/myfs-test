import * as execa from 'execa';

export async function umount(device: string) {
  return execa('fusermount', ['-u', device])
    .then(() => { });
}

export async function isMounted(device: string) {
  return new Promise<boolean>((resolve, reject) => {
    execa('findmnt', [device])
      .on('error', reject)
      .on('exit', code => resolve(code === 0));
  });
}
