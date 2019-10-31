import { IAllthingsRestClient } from '../types'

export interface IRegistrationCodeTenant {
  readonly email?: string
  readonly phone?: string
  readonly name?: string
}

export interface IRegistrationCodeOptions {
  readonly expiresAt?: string | null
  readonly externalId?: string
  readonly permanent?: boolean
  readonly tenant?: IRegistrationCodeTenant
  readonly readOnly?: boolean
  readonly instantTenantInviteActive?: boolean
}

export interface IRegistrationCode extends Required<IRegistrationCodeOptions> {
  readonly code: string
  readonly createdAt: string
  readonly email: string
  readonly externalId: string
  readonly id: string
  readonly invitationSent: boolean
  readonly utilisationPeriods: ReadonlyArray<string>
}

export type PartialRegistrationCode = Partial<IRegistrationCode>

export type RegistrationCodeResult = Promise<IRegistrationCode>

export const remapRegistationCodeResult = (registrationCode: any) => {
  const { tenantID: externalId, ...result } = registrationCode

  return { ...result, externalId }
}

/*
  Create new registration code
  https://api-doc.allthings.me/#!/Registration32Code/post_registration_codes
*/

export type MethodRegistrationCodeCreate = (
  code: string,
  utilisationPeriods: string | ReadonlyArray<string>,
  options?: IRegistrationCodeOptions,
) => RegistrationCodeResult

export async function registrationCodeCreate(
  client: IAllthingsRestClient,
  code: string,
  utilisationPeriods: string | ReadonlyArray<string>,
  options: IRegistrationCodeOptions = { permanent: false },
): RegistrationCodeResult {
  const { externalId, ...moreOptions } = options

  return remapRegistationCodeResult(
    await client.post('/v1/registration-codes', {
      code,
      utilisationPeriods:
        typeof utilisationPeriods === 'string'
          ? [utilisationPeriods]
          : utilisationPeriods,
      ...(externalId ? { tenantID: externalId } : {}),
      ...moreOptions,
    }),
  )
}

/*
  update a registration code by id
*/
export type MethodRegistrationCodeUpdateById = (
  registrationCodeId: string,
  data: PartialRegistrationCode,
) => RegistrationCodeResult

export async function registrationCodeUpdateById(
  client: IAllthingsRestClient,
  registrationCodeId: string,
  data: PartialRegistrationCode,
): RegistrationCodeResult {
  return remapRegistationCodeResult(
    await client.patch(`/v1/registration-codes/${registrationCodeId}`, data),
  )
}

/*
  find a registration code by id
*/

export type MethodRegistrationCodeGetById = (
  registrationCodeId: string,
) => RegistrationCodeResult

export async function registrationCodeGetById(
  client: IAllthingsRestClient,
  registrationCodeId: string,
): RegistrationCodeResult {
  return remapRegistationCodeResult(
    await client.get(`/v1/invitations/${registrationCodeId}`),
  )
}

/*
  Delete registration code by id
*/
export type MethodRegistrationCodeDelete = (
  registrationCodeId: string,
) => RegistrationCodeResult

export async function registrationCodeDelete(
  client: IAllthingsRestClient,
  registrationCodeId: string,
): Promise<boolean> {
  return (await client.delete(`/v1/invitations/${registrationCodeId}`)) === ''
}
