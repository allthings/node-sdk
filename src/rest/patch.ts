import { MethodHttpRequest } from './request'

export type PatchResult = Promise<any>

export type MethodHttpPatch = (
  method: string,
  body?: Record<string, any>,
) => PatchResult

export default async function patch(
  request: MethodHttpRequest,
  method: string,
  body: Record<string, any>,
): PatchResult {
  return request('patch', method, { body })
}
