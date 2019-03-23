import { ExecException } from 'child_process';

export function umount(
  device: string,
  callback: (
    error: ExecException | null,
    stdout: string,
    stderr: string,
  ) => void,
): void;

export function isMounted(
  device: string,
  callback: (
    error: ExecException | null,
    isMounted: boolean | null,
  ) => void,
): void;
