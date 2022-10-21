import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/user'
import LoginValidator from 'App/Validators/Auth/LoginValidator'
import StoreUserValidator from 'App/Validators/Auth/StoreUserValidator'

export default class AuthController {
  /**
   * @swagger
   * /register:
   *  post:
   *   tags:
   *    - Auth
   *   requestBody:
   *     content:
   *      application/json:
   *        schema:
   *          properties:
   *            email:
   *              type: string
   *              required: true
   *            password:
   *             type: string
   *             required: true
   *   responses:
   *     201:
   *      description: Registration successful
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              user:
   *                $ref: '#/components/schemas/User'
   *     400:
   *      description: Invalid credentials
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              errors:
   *                type: array
   *                items:
   *                  type: object
   *                  properties:
   *                    code:
   *                      type: string
   *                    field:
   *                      type: string
   *                    message:
   *                      type: string
   *
   */
  public async register({ request, response, logger }: HttpContextContract) {
    try {
      const payload = await request.validate(StoreUserValidator)

      logger.info(payload, 'Registering user')

      const user = await User.create({
        email: payload.email,
        password: payload.password,
        role_id: payload.role_id,
      })

      logger.info('User registered')

      return response.created(user)
    } catch (error) {
      logger.error(error.messages, 'Error registering user')

      return response.badRequest({
        errors: error.messages.errors.map((error: any) => ({
          code: error.rule,
          field: error.field,
          message: error.message,
        })),
      })
    }
  }

  /**
   * @swagger
   * /login:
   *  post:
   *   tags:
   *    - Auth
   *   requestBody:
   *     content:
   *      application/json:
   *        schema:
   *          properties:
   *            email:
   *              type: string
   *              required: true
   *            password:
   *             type: string
   *             required: true
   *   responses:
   *     200:
   *      description: Login successful
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              token:
   *                type: string
   *              user:
   *                $ref: '#/components/schemas/User'
   *     401:
   *      description: Invalid credentials
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              message:
   *                type: string
   */
  public async login({ auth, request, response }: HttpContextContract) {
    const { email, password } = await request.validate(LoginValidator)

    try {
      const token = await auth.attempt(email, password)
      const user = auth.user!

      return response.ok({
        credentials: token,
        user: user.serialize(),
      })
    } catch (error) {
      return response.unauthorized({ message: 'Invalid credentials' })
    }
  }

  /**
   * @swagger
   * /me:
   *   get:
   *    tags:
   *      - Auth
   *    security:
   *      type: http
   *      scheme: bearer
   *    responses:
   *      200:
   *        description: User details
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                user:
   *                  $ref: '#/components/schemas/User'
   *      401:
   *        description: Invalid credentials
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                errors:
   *                  type: array
   *                  items:
   *                    type: object
   *                    properties:
   *                      message:
   *                        type: string
   */
  public async me({ auth, response }: HttpContextContract) {
    return response.ok({
      ...auth.user!.serialize(),
    })
  }
}
