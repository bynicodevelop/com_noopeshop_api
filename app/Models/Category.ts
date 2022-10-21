import { DateTime } from 'luxon'
import { BaseModel, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Product from './Product'

/**
 * @swagger
 * components:
 *  schemas:
 *   Category:
 *    type: object
 *    properties:
 *      id:
 *       type: integer
 *      name:
 *       type: string
 *      description:
 *       type: string
 *      created_at:
 *       type: string
 *      updated_at:
 *       type: string
 */
export default class Category extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public description: string

  @manyToMany(() => Product)
  public products: ManyToMany<typeof Product>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
