export type EventHandler<T = unknown> = (data: T) => void;

export type Nullable<T> = T | null;

export type MaybePromise<T> = T | Promise<T>;
