/// <reference types="node" />
import { Buffer } from 'buffer';

export type FetchType =
    | "json"
    | "buffer"
    | "text";

export type EleventyFetchOptions<TType extends FetchType = "buffer"> = {
    type?: TType;
    directory?: string;
    concurrency?: number;
    fetchOptions?: RequestInit;
    dryRun?: boolean;
    removeUrlQueryParams?: boolean;
    verbose?: boolean;
    hashLength?: number;
    duration?: string;
    formatUrlForDisplay?: (url: string) => string;
}

export function EleventyFetch(url: string, options?: EleventyFetchOptions<"buffer">): Buffer;
export function EleventyFetch<T>(url: string, options: EleventyFetchOptions<"json">): T;
export function EleventyFetch(url: string, options: EleventyFetchOptions<"text">): string;

export default EleventyFetch;
