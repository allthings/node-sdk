import { EntityResultList, IAllthingsRestClient } from '../types'

export enum EnumUnitObjectType {
  adjoiningRoom = 'adjoining-room',
  advertisingSpace = 'advertising-space',
  aerial = 'aerial',
  apartmentBuilding = 'apartment-building',
  atm = 'atm',
  atmRoom = 'atm-room',
  attic = 'attic',
  atticFlat = 'attic-flat',
  bank = 'bank',
  basment = 'basment',
  bikeShed = 'bike-shed',
  buildingLaw = 'building-law',
  cafeteria = 'cafeteria',
  caretakerRoom = 'caretaker-room',
  carport = 'carport',
  cellar = 'cellar',
  commercialProperty = 'commercial-property',
  commonRoom = 'common-room',
  deliveryZone = 'delivery-zone',
  diverse = 'diverse',
  doubleParkingSpace = 'double-parking-space',
  engineeringRoom = 'engineering-room',
  entertainment = 'entertainment',
  environment = 'environment',
  estate = 'estate',
  fillingStation = 'filling-station',
  fitnessCenter = 'fitness-center',
  flat = 'flat',
  freeZone = 'free-zone',
  garage = 'garage',
  garden = 'garden',
  gardenFlat = 'garden-flat',
  heatingFacilities = 'heating-facilities',
  hotel = 'hotel',
  incidentalRentalExpenses = 'incidental-rental-expenses',
  industry = 'industry',
  kiosk = 'kiosk',
  kitchen = 'kitchen',
  loft = 'loft',
  machine = 'machine',
  maisonette = 'maisonette',
  medicalPractice = 'medical-practice',
  mopedShed = 'moped-shed',
  motorcycleParkingSpace = 'motorcycle-parking-space',
  office = 'office',
  oneFamilyHouse = 'one-family-house',
  parkingBox = 'parking-box',
  parkingGarage = 'parking-garage',
  parkingSpace = 'parking-space',
  parkingSpaces = 'parking-spaces',
  penthouse = 'penthouse',
  productionPlant = 'production-plant',
  pub = 'pub',
  publicArea = 'public-area',
  restaurant = 'restaurant',
  retirementHome = 'retirement-home',
  salesFloor = 'sales-floor',
  school = 'school',
  shelter = 'shelter',
  storage = 'storage',
  store = 'store',
  storeroom = 'storeroom',
  studio = 'studio',
  terrace = 'terrace',
  toilets = 'toilets',
  utilityRoom = 'utility-room',
  variableParkingSpace = 'variable-parking-space',
  variableRoom = 'variable-room',
  visitorParkingSpace = 'visitor-parking-space',
  workshop = 'workshop',
}

export enum EnumUnitType {
  rented = 'rented',
  owned = 'owned',
}

export interface IUnit {
  readonly externalId?: string
  readonly id: string
  readonly name: string
  readonly objectType?: EnumUnitObjectType
  readonly readOnly?: boolean
  readonly size?: number
  readonly stats?: {
    readonly invitationCount?: number
    readonly tenantCount?: number
  }
  readonly type: EnumUnitType
}

export type PartialUnit = Partial<IUnit>

export type UnitResult = Promise<IUnit>
export type UnitResultList = EntityResultList<IUnit>

/*
  Create new unit
*/

export type MethodUnitCreate = (
  groupId: string,
  data: PartialUnit & {
    readonly name: string
    readonly type: EnumUnitType
  },
) => UnitResult

export async function unitCreate(
  client: IAllthingsRestClient,
  groupId: string,
  data: PartialUnit & {
    readonly name: string
    readonly type: EnumUnitType
  },
): UnitResult {
  return client.post(`/v1/groups/${groupId}/units`, data)
}

/*
  Get a unit by its ID
*/

export type MethodUnitGetById = (id: string) => UnitResult

export async function unitGetById(
  client: IAllthingsRestClient,
  unitId: string,
): UnitResult {
  return client.get(`/v1/units/${unitId}`)
}

/*
  Update a unit by its ID
*/

export type MethodUnitUpdateById = (
  unitId: string,
  data: PartialUnit,
) => UnitResult

export async function unitUpdateById(
  client: IAllthingsRestClient,
  unitId: string,
  data: PartialUnit,
): UnitResult {
  return client.patch(`/v1/units/${unitId}`, data)
}

/*
  Get a list of units
*/

export type MethodGetUnits = (
  page?: number,
  limit?: number,
  filter?: IndexSignature,
) => UnitResultList

export async function getUnits(
  client: IAllthingsRestClient,
  page = 1,
  limit = -1,
  filter = {},
): UnitResultList {
  const {
    _embedded: { items: units },
    total,
  } = await client.get(
    `/v1/units?page=${page}&limit=${limit}&filter=${JSON.stringify(filter)}`,
  )

  return { _embedded: { items: units }, total }
}
