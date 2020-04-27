import { MethodHttpRequest } from './request'

export type GetResult = Promise<any>

export type MethodHttpGet = (
  method: string,
  query?: Record<string, any>,
  returnRawResultObject?: boolean,
) => GetResult

export default async function get(
  request: MethodHttpRequest,
  method: string,
  query: Record<string, any>,
  returnRawResultObject?: boolean,
): GetResult {
  return request('get', method, { query }, returnRawResultObject)
}
