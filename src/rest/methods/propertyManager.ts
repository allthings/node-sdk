import { IAllthingsRestClient } from '../types'

export interface IPropertyManager {
  readonly externalId: string
  readonly id: string
  readonly name: string
}

export type PartialPropertyManager = Partial<IPropertyManager>

export type PropertManagerResult = Promise<IPropertyManager>

/*
  Create new property-manager
  https://api-doc.allthings.me/#/Property%20Manager/post_property_managers
*/

export type MethodPropertyManagerCreate = (
  data: PartialPropertyManager & { readonly name: string },
) => PropertManagerResult

export async function propertyManagerCreate(
  client: IAllthingsRestClient,
  data: PartialPropertyManager & { readonly name: string },
): PropertManagerResult {
  return client.post('/v1/property-managers', data)
}

/*
  Get a property-manager by its ID
  https://api-doc.allthings.me/#/Property%20Manager/get_property_managers__propertyManagerID_
*/

export type MethodPropertyManagerGetById = (
  propertyId: string,
) => PropertManagerResult

export async function propertyManagerGetById(
  client: IAllthingsRestClient,
  propertyManagerId: string,
): PropertManagerResult {
  return client.get(`/v1/property-managers/${propertyManagerId}`)
}

/*
  Update a property-manager by its ID
  https://api-doc.allthings.me/#/Property%20Manager/patch_property_managers__propertyManagerID_
*/

export type MethodPropertyManagerUpdateById = (
  propertyManagerId: string,
  data: PartialPropertyManager,
) => PropertManagerResult

export async function propertyManagerUpdateById(
  client: IAllthingsRestClient,
  propertyManagerId: string,
  data: PartialPropertyManager,
): PropertManagerResult {
  return client.patch(`/v1/property-managers/${propertyManagerId}`, data)
}
