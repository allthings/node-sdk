import { MethodHttpRequest } from './request'

export type PostResult = Promise<any>

export type MethodHttpPost = (
  method: string,
  body?: Record<string, any>,
) => PostResult

export default async function post(
  request: MethodHttpRequest,
  method: string,
  body: Record<string, any>,
): PostResult {
  return request('post', method, { body })
}
