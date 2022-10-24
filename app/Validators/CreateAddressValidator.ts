import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateAddressValidator {
  constructor(protected ctx: HttpContextContract) {}

  /**
   * @swagger
   *  components:
   *    schemas:
   *      CreateAddressValidator:
   *        type: object
   *        properties:
   *          street1:
   *            type: string
   *          street2:
   *            type: string
   *          city:
   *            type: string
   *          zip:
   *            type: number
   *          country:
   *            type: string
   */
  public schema = schema.create({
    street1: schema.string(),
    street2: schema.string.optional(),
    city: schema.string(),
    zip: schema.string(),
    country: schema.string(),
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages: CustomMessages = {}
}
