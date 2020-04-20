import { MethodHttpRequest } from './request'

export type PostResult = Promise<any>

export type MethodHttpPost = (
  method: string,
  body?: Record<string, any>,
  returnRawResultObject?: boolean,
) => PostResult

export default async function post(
  request: MethodHttpRequest,
  method: string,
  body: Record<string, any>,
  returnRawResultObject?: boolean,
): PostResult {
  return request('post', method, { body }, returnRawResultObject)
}
