import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import User from './user'
import Address from './Address'

/**
 * @swagger
 *  components:
 *    schemas:
 *      Customer:
 *        type: object
 *        properties:
 *          id:
 *            type: number
 *            description: The auto-generated id of the customer
 *          userId:
 *            type: number
 *            description: The id of the user
 *          first_name:
 *            type: string
 *            description: The first name of the customer
 *          last_name:
 *            type: string
 *            description: The last name of the customer
 *          createdAt:
 *            type: string
 *            description: The date of creation of the customer
 *          updatedAt:
 *            type: string
 *            description: The date of update of the customer
 */
export default class Customer extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public first_name: string

  @column()
  public last_name: string

  @column()
  public userId: number

  @hasOne(() => User)
  public user: HasOne<typeof User>

  @hasMany(() => Address)
  public addresses: HasMany<typeof Address>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
