import { EnumCountryCode, IAllthingsRestClient } from '../types'

export enum EnumServiceProviderType {
  serviceProvider = 'property-manager',
  craftsPeople = 'crafstpeople',
}
export interface IServiceProvider {
  readonly address: Partial<{
    readonly city: string | null
    readonly country: EnumCountryCode | null
    readonly houseNumber: string | null
    readonly latitude: number | null
    readonly longitude: number | null
    readonly postalCode: string | null
    readonly street: string | null
    readonly type: string | null
  }>
  readonly email: string
  readonly externalId: string
  readonly id: string
  readonly name: string
  readonly parent: string
  readonly phoneNumber: string | null
  readonly type: EnumServiceProviderType
  readonly website: string | null
}

export type PartialServiceProvider = Partial<IServiceProvider>

export type ServiceProviderResult = Promise<IServiceProvider>

/*
  Create new property-manager
  https://api-doc.allthings.me/#/Property%20Manager/post_property_managers
*/

export type MethodServiceProviderCreate = (
  data: PartialServiceProvider & { readonly name: string },
) => ServiceProviderResult

export async function serviceProviderCreate(
  client: IAllthingsRestClient,
  data: PartialServiceProvider & { readonly name: string },
): ServiceProviderResult {
  return client.post('/v1/property-managers', data)
}

/*
  Get a property-manager by its ID
  https://api-doc.allthings.me/#/Property%20Manager/get_property_managers__serviceProviderID_
*/

export type MethodServiceProviderGetById = (
  propertyId: string,
) => ServiceProviderResult

export async function serviceProviderGetById(
  client: IAllthingsRestClient,
  serviceProviderId: string,
): ServiceProviderResult {
  return client.get(`/v1/property-managers/${serviceProviderId}`)
}

/*
  Update a property-manager by its ID
  https://api-doc.allthings.me/#/Property%20Manager/patch_property_managers__serviceProviderID_
*/

export type MethodServiceProviderUpdateById = (
  serviceProviderId: string,
  data: PartialServiceProvider,
) => ServiceProviderResult

export async function serviceProviderUpdateById(
  client: IAllthingsRestClient,
  serviceProviderId: string,
  data: PartialServiceProvider,
): ServiceProviderResult {
  return client.patch(`/v1/property-managers/${serviceProviderId}`, data)
}
