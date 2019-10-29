import { upload } from '../../utils/upload'
import { IAllthingsRestClient } from '../types'
import { IMessage } from './conversation'
import { IFile } from './file'
import { IUser } from './user'

export enum ETicketStatus {
  CLOSED = 'closed',
  WAITING_FOR_AGENT = 'waiting-for-agent',
  WAITING_FOR_CUSTOMER = 'waiting-for-customer',
  WAITING_FOR_EXTERNAL = 'waiting-for-external',
}

export enum ETrafficLightColor {
  GREEN = 'green',
  RED = 'red',
  YELLOW = 'yellow',
}

export enum Permission {
  ASSIGN_ALL_ROLES = 'assign-all-roles',
  ASSIGN_APP_ADMIN_ROLE = 'assign-app-admin-role',
  ASSIGN_ARTICLES_AGENT_ROLE = 'assign-articles-agent-role',
  ASSIGN_BOOKABLE_ASSET_AGENT_ROLE = 'assign-bookable-asset-agent-role',
  ASSIGN_BOOKING_AGENT_ROLE = 'assign-booking-agent-role',
  ASSIGN_COCKPIT_MANAGER_ROLE = 'assign-cockpit-manager-role',
  ASSIGN_ORG_ADMIN_ROLE = 'assign-org-admin-role',
  ASSIGN_ORG_TEAM_MANAGER_ROLE = 'assign-org-team-manager-role',
  ASSIGN_ORGANIZATION_ORG_TEAM_MANAGER_ROLE = 'assign-organization-org-team-manager-role',
  ASSIGN_PINBOARD_AGENT_ROLE = 'assign-pinboard-agent-role',
  ASSIGN_PROPERTY_DATA_ADMIN_ROLE = 'assign-property-data-admin-role',
  ASSIGN_SERVICE_CENTER_AGENT_ROLE = 'assign-service-centre-agent-role',
  ASSIGN_SERVICE_CENTER_MANAGER_ROLE = 'assign-service-centre-manager-role',
  ASSIGN_TENANT_MANAGER_ROLE = 'assign-tenant-manager-role',
  ASSIGN_TICKET = 'assign-ticket',
  CREATE_APP = 'create-app',
  CREATE_ARTICLE = 'create-article',
  CREATE_BOOKABLE_ASSET = 'create-bookable-asset',
  CREATE_DATA_CONNECTOR_SOURCES = 'create-data-connector-sources',
  CREATE_GROUP = 'create-group',
  CREATE_ID_LOOKUP = 'create-id-lookup',
  CREATE_ORGANIZATION = 'create-organization',
  CREATE_ORGANIZATION_TEAM = 'create-organization-team',
  CREATE_PINBOARD_POST = 'create-pinboard-post',
  CREATE_PROPERTY = 'create-property',
  CREATE_PROPERTY_MANAGER = 'create-property-manager',
  CREATE_REGISTRATION_INVITES = 'create-registration-invites',
  CREATE_TEAM_MEMBER = 'create-team-member',
  CREATE_TICKET = 'create-ticket',
  CREATE_TICKET_MESSAGE = 'create-ticket-message',
  CREATE_UNIT = 'create-unit',
  CREATE_UTILISATION_PERIOD = 'create-utilisation-period',
  CREATE_VISITOR_INVITE = 'create-visitor-invite',
  DELETE_APP = 'delete-app',
  DELETE_ARTICLE = 'delete-article',
  DELETE_BOOKABLE_ASSET = 'delete-bookable-asset',
  DELETE_DATA_CONNECTOR_SOURCES = 'delete-data-connector-sources',
  DELETE_GROUP = 'delete-group',
  DELETE_ORGANIZATION = 'delete-organization',
  DELETE_ORGANIZATION_TEAM = 'delete-organization-team',
  DELETE_PINBOARD_POST = 'delete-pinboard-post',
  DELETE_PROPERTY = 'delete-property',
  DELETE_PROPERTY_MANAGER = 'delete-property-manager',
  DELETE_TEAM_MEMBER = 'delete-team-member',
  DELETE_UNIT = 'delete-unit',
  DELETE_UTILISATION_PERIOD = 'delete-utilisation-period',
  EDIT_APP = 'edit-app',
  EDIT_ARTICLE = 'edit-article',
  EDIT_BOOKABLE_ASSET = 'edit-bookable-asset',
  EDIT_DATA_CONNECTOR_SOURCES = 'edit-data-connector-sources',
  EDIT_GROUP = 'edit-group',
  EDIT_ORGANIZATION = 'edit-organization',
  EDIT_ORGANIZATION_TEAM = 'edit-organization-team',
  EDIT_PINBOARD_POST = 'edit-pinboard-post',
  EDIT_PROPERTY = 'edit-property',
  EDIT_PROPERTY_MANAGER = 'edit-property-manager',
  EDIT_TEAM_MEMBER = 'edit-team-member',
  EDIT_TICKET = 'edit-ticket',
  EDIT_TICKET_EXTERNAL_AGENT = 'edit-ticket-external-agent',
  EDIT_UNIT = 'edit-unit',
  EDIT_UTILISATION_PERIOD = 'edit-utilisation-period',
  IMPERSONATE_ANY_USER = 'impersonate-any-user',
  INVITE_TEAM_MEMBERS = 'invite-team-members',
  LIST_APP = 'list-app',
  LIST_ARTICLES = 'list-articles',
  LIST_BOOKABLE_ASSETS = 'list-bookable-assets',
  LIST_BOOKINGS = 'list-bookings',
  LIST_DATA_CONNECTOR_SOURCES = 'list-data-connector-sources',
  LIST_GROUPS = 'list-groups',
  LIST_ORGANIZATION_TEAMS = 'list-organization-teams',
  LIST_ORGANIZATIONS = 'list-organizations',
  LIST_PINBOARD_POSTS = 'list-pinboard-posts',
  LIST_PROPERTIES = 'list-properties',
  LIST_PROPERTY_MANAGERS = 'list-property-managers',
  LIST_TEAM_MEMBERS = 'list-team-members',
  LIST_TICKETS = 'list-tickets',
  LIST_UNITS = 'list-units',
  LIST_UTILISATION_PERIODS = 'list-utilisation-periods',
  MODERATE_PINBOARD_POSTS = 'moderate-pinboard-posts',
  REMOVE_EXTERNAL_AGENT = 'remove-external-agent',
  UPDATE_APP = 'update-app',
  UPDATE_BOOKING = 'update-booking',
  VIEW_APP = 'view-app',
  VIEW_ARTICLE = 'view-article',
  VIEW_BOOKABLE_ASSET = 'view-bookable-asset',
  VIEW_BOOKING = 'view-booking',
  VIEW_DATA_CONNECTOR_SOURCES = 'view-data-connector-sources',
  VIEW_GROUP = 'view-group',
  VIEW_ORGANIZATION = 'view-organization',
  VIEW_ORGANIZATION_TEAM = 'view-organization-team',
  VIEW_PINBOARD_POST = 'view-pinboard-post',
  VIEW_PROPERTY = 'view-property',
  VIEW_PROPERTY_MANAGER = 'view-property-manager',
  VIEW_REGISTRATION_INVITES = 'view-registration-invites',
  VIEW_TEAM_MEMBER = 'view-team-member',
  VIEW_TICKET = 'view-ticket',
  VIEW_TICKET_COMMENTS = 'view-ticket-comments',
  VIEW_UNIT = 'view-unit',
  VIEW_UTILISATION_PERIOD = 'view-utilisation-period',
}

export interface ITicketLabel {
  readonly id: string
  readonly key: string
  readonly name: IMessage
}

export interface ITicketCreatePayload {
  readonly files?: ReadonlyArray<{
    readonly content: Buffer
    readonly filename: string
  }>
  readonly category: string
  readonly description: string
  readonly title: string
}

interface ITicketParticipant extends IUser {
  readonly roles: ReadonlyArray<Permission>
}

export interface ITicket {
  readonly _embedded: {
    readonly assignedTo: IUser
    readonly category: { readonly id: string; readonly name: IMessage }
    readonly conversations: ReadonlyArray<{
      readonly id: string
      readonly _embedded: {
        readonly participants: ReadonlyArray<ITicketParticipant>
      }
    }>
    readonly createdBy: IUser
    readonly files: ReadonlyArray<IFile>
    readonly group: { readonly address: object }
    readonly labels: ReadonlyArray<ITicketLabel>
    readonly property: {
      readonly id: string
      readonly name: string
    }
    readonly unit: { readonly name: string }
  }
  readonly category: string
  readonly channels: ReadonlyArray<string>
  readonly commentCount: number
  readonly createdAt: string
  readonly customerWaitingSinceIndicator: ETrafficLightColor
  readonly description: string
  readonly id: string
  readonly incrementID: string
  readonly labels: ReadonlyArray<string>
  readonly lastStatusUpdate: string
  readonly phoneNumber: string
  readonly read: boolean
  readonly sortHash: string
  readonly status: ETicketStatus
  readonly tags: ReadonlyArray<string>
  readonly title: string
  readonly unreadAdminMessages: number
  readonly unreadUserMessages: number
  readonly updatedAt: string
}

export type TicketResult = Promise<ITicket>

/*
  Get a ticket by its ID
*/

export type MethodTicketGetById = (ticketId: string) => TicketResult

export async function ticketGetById(
  client: IAllthingsRestClient,
  ticketId: string,
): TicketResult {
  return client.get(`/v1/tickets/${ticketId}`)
}

/*
  Create a ticket
 */

export type MethodTicketCreate = (
  userId: string,
  utilisationPeriodId: string,
  payload: ITicketCreatePayload,
) => TicketResult

export async function ticketCreate(
  client: IAllthingsRestClient,
  userId: string,
  utilisationPeriodId: string,
  payload: ITicketCreatePayload,
): TicketResult {
  return client.post(`/v1/users/${userId}/tickets`, {
    ...payload,
    files: payload.files ? await upload(payload.files, client) : [],
    utilisationPeriod: utilisationPeriodId,
  })
}
