import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ResponseErrorHelper from 'App/Helpers/ResponseErrorHelper'
import CreateAddressValidator from 'App/Validators/CreateAddressValidator'

export default class AddressesController {
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
