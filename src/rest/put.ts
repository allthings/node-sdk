import { MethodHttpRequest } from './request'

export type PutResult = Promise<any>

export type MethodHttpPut = (
  method: string,
  body?: Record<string, any>,
) => PutResult

export default async function put(
  request: MethodHttpRequest,
  method: string,
  body: Record<string, any>,
): PutResult {
  return request('put', method, { body })
}
