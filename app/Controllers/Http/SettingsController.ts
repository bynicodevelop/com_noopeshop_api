import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ResponseErrorHelper from 'App/Helpers/ResponseErrorHelper'
import Setting from 'App/Models/Setting'
import CreateSettingValidator from 'App/Validators/CreateSettingValidator'
import UpdateSettingValidator from 'App/Validators/UpdateSettingValidator'

export default class SettingsController {
  /**
   * @swagger
   * /settings:
   *  get:
   *    tags:
   *      - Settings
   *    summary: Get all settings
   *    responses:
   *      200:
   *        description: Returns all settings
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                data:
   *                  type: array
   *                  items:
   *                    $ref: '#/components/schemas/Setting'
   *      404:
   *        description: Setting not found
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/ResponseErrorHelper'
   */
  public async index({ request, response }: HttpContextContract) {
    const { key } = request.params()

    if (key) {
      const setting = await Setting.find(key)

      if (setting) {
        return response.json(setting)
      }

      return response.status(404).send(
        ResponseErrorHelper.error({
          messages: {
            errors: [
              {
                code: 'not_found',
                message: 'Setting not found',
              },
            ],
          },
        })
      )
    }

    const settings = await Setting.all()

    return response.json({
      data: settings,
    })
  }

  /**
   * @swagger
   * /settings:
   *  post:
   *    tags:
   *      - Settings
   *    summary: Create a setting
   *    security:
   *      type: http
   *      scheme: bearer
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              key:
   *                type: string
   *              value:
   *                type: string
   *    responses:
   *      201:
   *        description: Returns the created setting
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                data:
   *                  $ref: '#/components/schemas/Setting'
   *      400:
   *        description: Bad request
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/ResponseErrorHelper'
   */
  public async store({ request, response, logger }: HttpContextContract) {
    try {
      const payload = await request.validate(CreateSettingValidator)

      logger.info(payload, 'Creating setting')

      const setting = await Setting.create(payload)

      return response.json(setting)
    } catch (error) {
      logger.error(error, 'Error creating setting')

      return response.status(400).send(ResponseErrorHelper.error(error))
    }
  }

  /**
   * @swagger
   * /settings/:key:
   *  put:
   *    tags:
   *      - Settings
   *    summary: Update a setting
   *    security:
   *      type: http
   *      scheme: bearer
   *    parameters:
   *      - in: path
   *        name: key
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              value:
   *                type: string
   *                required: true
   *    responses:
   *      200:
   *        description: Returns the updated setting
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                data:
   *                  $ref: '#/components/schemas/Setting'
   *      404:
   *        description: Setting not found
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/ResponseErrorHelper'
   *      400:
   *        description: Bad request
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/ResponseErrorHelper'
   */
  public async update({ request, response, logger }: HttpContextContract) {
    try {
      const payload = await request.validate(UpdateSettingValidator)

      logger.info(payload, 'Updating setting')

      const setting = await Setting.find(payload.key)

      if (setting) {
        setting.value = payload.value

        await setting.save()

        return response.json(setting)
      }

      return response.status(404).send(
        ResponseErrorHelper.error({
          messages: {
            errors: [
              {
                code: 'not_found',
                message: 'Product not found',
              },
            ],
          },
        })
      )
    } catch (error) {
      logger.error(error, 'Error updating setting')

      return response.status(400).send(
        ResponseErrorHelper.error({
          messages: {
            errors: [
              {
                code: 'invalid_data',
                message: 'Invalid data',
              },
            ],
          },
        })
      )
    }
  }

  /**
   * @swagger
   * /settings/:key:
   *   delete:
   *    tags:
   *     - Settings
   *    summary: Delete a setting
   *    security:
   *      type: http
   *      scheme: bearer
   *    parameters:
   *      - in: path
   *        name: key
   *    responses:
   *      204:
   *        description: Product deleted
   *      404:
   *        description: Setting not found
   */
  public async delete({ request, response, logger }: HttpContextContract) {
    const { key } = request.params()

    logger.info({ key }, 'Deleting setting')

    const setting = await Setting.find(key)

    if (setting) {
      await setting.delete()

      return response.status(204)
    }

    return response.status(404)
  }
}
