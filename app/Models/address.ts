import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Customer from './Customer'

export default class Address extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public street1: string

  @column()
  public street2: string

  @column()
  public city: string

  @column()
  public zip: string

  @column()
  public country: string

  @column()
  public id_default: boolean

  @column()
  public customerId: number

  @belongsTo(() => Customer)
  public customer: BelongsTo<typeof Customer>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
