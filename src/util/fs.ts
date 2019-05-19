import { resolve } from 'path';

import { TypedExecutionContext } from 'util/test';

export const getPath = (t: TypedExecutionContext, entryName: string) =>
  resolve(t.context.mountDir, entryName);
