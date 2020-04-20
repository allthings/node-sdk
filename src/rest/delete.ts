import { MethodHttpRequest } from './request'

export type DeleteResult = Promise<any>

export type MethodHttpDelete = (
  method: string,
  body?: Record<string, any>,
  detailedResponseFormat?: boolean,
) => DeleteResult

export default async function del(
  request: MethodHttpRequest,
  method: string,
  body: Record<string, any>,
  returnRawResultObject?: boolean,
): DeleteResult {
  return request('delete', method, { body }, returnRawResultObject)
}
