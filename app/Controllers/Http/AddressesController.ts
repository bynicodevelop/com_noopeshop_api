import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ResponseErrorHelper from 'App/Helpers/ResponseErrorHelper'
import CreateAddressValidator from 'App/Validators/CreateAddressValidator'

export default class AddressesController {
  /**
   * @swagger
   *  /customers/{customerId}/addresses:
   *    get:
   *      tags:
   *        - Addresses
   *      summary: List all addresses
   *      security:
   *        type: http
   *        scheme: bearer
   *      parameters:
   *        - in: path
   *          name: customerId
   *          schema:
   *            type: integer
   *          required: true
   *          description: Customer ID
   *      responses:
   *        200:
   *          description: List of addresses
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  data:
   *                    type: array
   *                    items:
   *                      $ref: '#/components/schemas/Address'
   *        401:
   *          description: Unauthorized
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/ResponseErrorHelper'
   */
  public async index({ request, response, auth }: HttpContextContract) {
    const { customerId, addressId } = request.params()

    if (!addressId) {
      const user = auth.user
      const addresses = await user?.related('customer').query().preload('addresses')

      return response.json({
        data: addresses,
      })
    }

    const customer = await auth.user?.related('customer').query().where('id', customerId).first()

    if (!customer) {
      return response.status(401).send(
        ResponseErrorHelper.error({
          messages: {
            errors: [
              {
                code: 'unauthorized',
                message: 'Unauthorized',
              },
            ],
          },
        })
      )
    }

    const address = await customer.related('addresses').query().where('id', addressId)

    if (address.length > 0) {
      return response.ok({
        data: address,
      })
    }

    return response.status(401).send(
      ResponseErrorHelper.error({
        messages: {
          errors: [
            {
              code: 'unauthorized',
              message: 'Unauthorized',
            },
          ],
        },
      })
    )
  }

  /**
   * @swagger
   *  /customers/{customerId}/addresses:
   *    post:
   *      tags:
   *        - Addresses
   *      summary: Create a new address
   *      security:
   *        type: http
   *        scheme: bearer
   *      parameters:
   *        - in: path
   *          name: customerId
   *          schema:
   *            type: integer
   *          required: true
   *          description: Customer ID
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/CreateAddressValidator'
   *      responses:
   *        200:
   *          description: Address created
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  data:
   *                    type: array
   *                    items:
   *                      $ref: '#/components/schemas/Address'
   *        400:
   *          description: Bad request
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/ResponseErrorHelper'
   *        401:
   *          description: Unauthorized
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/ResponseErrorHelper'
   */
  public async store({ request, response, auth, logger }: HttpContextContract) {
    try {
      const payload = await request.validate(CreateAddressValidator)

      const user = auth.user
      const customer = await user?.related('customer').query().first()

      if (!customer) {
        return response.status(401).send(
          ResponseErrorHelper.error({
            messages: {
              errors: [
                {
                  code: 'unauthorized',
                  message: 'Unauthorized',
                },
              ],
            },
          })
        )
      }

      const defaultAddress = await customer
        .related('addresses')
        .query()
        .where('id_default', true)
        .first()

      let isDefaultAddress = true

      if (defaultAddress) {
        isDefaultAddress = false
      }

      const address = await customer
        .related('addresses')
        .create({ ...payload, id_default: isDefaultAddress })

      return response.created({
        data: [address],
      })
    } catch (error) {
      logger.error(error, 'AddressController.store')

      return response.status(400).send(ResponseErrorHelper.error(error))
    }
  }

  /**
   * @swagger
   *  /customers/{customerId}/addresses/{addressId}:
   *    put:
   *      tags:
   *        - Addresses
   *      summary: Update an address
   *      security:
   *        type: http
   *        scheme: bearer
   *      parameters:
   *        - in: path
   *          name: customerId
   *          schema:
   *            type: integer
   *          required: true
   *          description: Customer ID
   *        - in: path
   *          name: addressId
   *          schema:
   *            type: integer
   *          required: true
   *          description: Address ID
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/CreateAddressValidator'
   *      responses:
   *        200:
   *          description: Address updated
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  data:
   *                    type: array
   *                    items:
   *                      $ref: '#/components/schemas/Address'
   *        400:
   *          description: Bad request
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/ResponseErrorHelper'
   *        401:
   *          description: Unauthorized
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/ResponseErrorHelper'
   */
  public async update({ request, response, auth, logger }: HttpContextContract) {
    try {
      const payload = await request.validate(CreateAddressValidator)

      const { customerId, addressId } = request.params()

      const user = auth.user
      const customer = await user?.related('customer').query().where('id', customerId).first()

      if (!customer) {
        return response.status(401).send(
          ResponseErrorHelper.error({
            messages: {
              errors: [
                {
                  code: 'unauthorized',
                  message: 'Unauthorized',
                },
              ],
            },
          })
        )
      }

      const addresses = await customer.related('addresses').query()

      for (const address of addresses) {
        if (address.id === Number(addressId)) {
          address.merge({ ...payload, id_default: true })
          await address.save()
        } else {
          await address.merge({ id_default: false }).save()
        }
      }

      return response.ok({
        data: addresses,
      })
    } catch (error) {
      logger.error(error, 'AddressController.update')

      return response.status(400).send(ResponseErrorHelper.error(error))
    }
  }

  /**
   * @swagger
   *  /customers/{customerId}/addresses/{addressId}:
   *    delete:
   *      tags:
   *        - Addresses
   *      summary: Delete an address
   *      security:
   *        type: http
   *        scheme: bearer
   *      parameters:
   *        - in: path
   *          name: customerId
   *          schema:
   *            type: integer
   *          required: true
   *          description: Customer ID
   *        - in: path
   *          name: addressId
   *          schema:
   *            type: integer
   *          required: true
   *          description: Address ID
   *      responses:
   *        204:
   *          description: Address deleted
   *        400:
   *          description: Bad request
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/ResponseErrorHelper'
   *        401:
   *          description: Unauthorized
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/ResponseErrorHelper'
   *        404:
   *          description: Not found
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/ResponseErrorHelper'
   */
  public async delete({ request, response, auth, logger }: HttpContextContract) {
    try {
      const { customerId, addressId } = request.params()

      const user = auth.user
      const customer = await user?.related('customer').query().where('id', customerId).first()

      if (!customer) {
        return response.status(401).send(
          ResponseErrorHelper.error({
            messages: {
              errors: [
                {
                  code: 'unauthorized',
                  message: 'Unauthorized',
                },
              ],
            },
          })
        )
      }

      const address = await customer.related('addresses').query().where('id', addressId).first()

      if (address?.id_default) {
        return response.status(400).send(
          ResponseErrorHelper.error({
            messages: {
              errors: [
                {
                  code: 'default_address',
                  field: 'id_default',
                  message: 'You can not delete your default address',
                },
              ],
            },
          })
        )
      }

      if (!address) {
        return response.status(404).send(
          ResponseErrorHelper.error({
            messages: {
              errors: [
                {
                  code: 'unauthorized',
                  message: 'Unauthorized',
                },
              ],
            },
          })
        )
      }

      await address.delete()

      return response.noContent()
    } catch (error) {
      logger.error(error, 'AddressController.delete')

      return response.status(400).send(ResponseErrorHelper.error(error))
    }
  }
}
