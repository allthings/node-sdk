import { MethodHttpRequest } from './request'

export type PatchResult = Promise<any>

export type MethodHttpPatch = (
  method: string,
  body?: Record<string, any>,
  detailedResponseFormat?: boolean,
) => PatchResult

export default async function patch(
  request: MethodHttpRequest,
  method: string,
  body: Record<string, any>,
  returnRawResultObject?: boolean,
): PatchResult {
  return request('patch', method, { body }, returnRawResultObject)
}
