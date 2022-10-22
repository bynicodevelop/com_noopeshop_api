import { rules, schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateCustomerValidator {
  constructor(protected ctx: HttpContextContract) {}

  /**
   * @swagger
   *   components:
   *     schemas:
   *       CreateCustomerValidator:
   *        type: object
   *        properties:
   *          email:
   *            type: string
   *            format: email
   *          first_name:
   *            type: string
   *          last_name:
   *            type: string
   */
  public schema = schema.create({
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.unique({ table: 'users', column: 'email' }),
    ]),
    first_name: schema.string({}, [rules.alpha()]),
    last_name: schema.string({}, [rules.alpha()]),
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
