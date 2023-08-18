export const mergeAny: <T>(arg1: T, arg2: any) => T = Object.assign

export type WatchValue = <T extends Record<string, any>>(proxy: T, callback: (p: T) => void) => void
