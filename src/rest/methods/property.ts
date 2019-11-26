import { EntityResultList, IAllthingsRestClient } from '../types'

export interface IProperty {
  readonly externalId: string
  readonly id: string
  readonly label: string
  readonly name: string
  readonly timezone: string
  readonly readOnly: boolean
  readonly _embedded: any
}

export type PartialProperty = Partial<IProperty>

export type PropertyResult = Promise<IProperty>
export type PropertyResultList = EntityResultList<IProperty>

/*
  Create new property
  https://api-doc.allthings.me/#!/Property/post_apps_appID_properties
*/

export type MethodPropertyCreate = (
  appId: string,
  data: PartialProperty & { readonly name: string; readonly timezone: string },
) => PropertyResult

export async function propertyCreate(
  client: IAllthingsRestClient,
  appId: string,
  data: PartialProperty & { readonly name: string; readonly timezone: string },
): PropertyResult {
  return client.post(`/v1/apps/${appId}/properties`, data)
}

/*
  Get a property by its ID
  https://api-doc.allthings.me/#!/Property/get_properties_propertyID
*/

export type MethodPropertyGetById = (propertyId: string) => PropertyResult

export async function propertyGetById(
  client: IAllthingsRestClient,
  propertyId: string,
): PropertyResult {
  return client.get(`/v1/properties/${propertyId}`)
}

/*
  Update a property by its ID
  https://api-doc.allthings.me/#!/Property/patch_properties_propertyID
*/

export type MethodPropertyUpdateById = (
  propertyId: string,
  data: PartialProperty,
) => PropertyResult

export async function propertyUpdateById(
  client: IAllthingsRestClient,
  propertyId: string,
  data: PartialProperty,
): PropertyResult {
  return client.patch(`/v1/properties/${propertyId}`, data)
}

/*
  Get a list of properties
*/

export type MethodGetProperties = (
  page?: number,
  limit?: number,
  filter?: Record<string, any>,
) => PropertyResultList

export async function getProperties(
  client: IAllthingsRestClient,
  page = 1,
  limit = -1,
  filter = {},
): PropertyResultList {
  const {
    _embedded: { items: properties },
    total,
  } = await client.get('/v1/properties', {
    filter: JSON.stringify(filter),
    limit,
    page,
  })

  return { _embedded: { items: properties }, total }
}
