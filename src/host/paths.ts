import { homedir } from 'node:os'
import path from 'node:path'

/** Keep plugin data under the Harness home without loading a versioned host package. */
export function resumeStoragePath(...segments: string[]): string {
  const configured = process.env.DSH_HOME?.trim()
  const home = configured
    ? configured === '~' ? homedir() : configured.startsWith('~/') || configured.startsWith('~\\')
      ? path.join(homedir(), configured.slice(2)) : configured
    : path.join(homedir(), '.dsh')
  return path.join(path.resolve(home), 'storages', ...segments)
}
