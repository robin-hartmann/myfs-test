import { platform } from 'os';

import * as umountLinux from './umount-linux';
import * as umountMacOS from './umount-macos';

let umount: {
  umount(device: string): Promise<void>;
  isMounted(device: string): Promise<boolean>;
};

switch (platform()) {
  case 'darwin':
    umount = umountMacOS;
    break;

  case 'linux':
    umount = umountLinux;
    break;

  default:
    throw new Error('Unsupported platform');
}

export = umount;
