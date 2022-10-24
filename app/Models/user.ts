import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import Role from './role'
import Config from '@ioc:Adonis/Core/Config'
import Customer from './Customer'

/**
 * @swagger
 * components:
 *  schemas:
 *   User:
 *    type: object
 *    properties:
 *      id:
 *       type: integer
 *      email:
 *       type: string
 *      password:
 *       type: string
 *      role_id:
 *       type: string
 *      created_at:
 *       type: string
 *      updated_at:
 *       type: string
 */
export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken: string | null

  @column()
  public roleId: number

  @hasOne(() => Role)
  public role: HasOne<typeof Role>

  @hasOne(() => Customer)
  public customer: HasOne<typeof Customer>

  @column.dateTime({ autoCreate: true })
  public deletedAt: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }

    if (user.roleId === undefined) {
      const role = await Role.findBy('name', Config.get('roles.default'))

      if (role) {
        user.roleId = role.id
      }
    }
  }
}
