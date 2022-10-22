import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Config from '@ioc:Adonis/Core/Config'
import Role from 'App/Models/Role'
import User from 'App/Models/user'
import CreateCustomerValidator from 'App/Validators/CreateCustomerValidator'
import { DateTime } from 'luxon'

export default class CustomersController {
  public async index({ request, response, logger }: HttpContextContract) {
    const { id } = request.params()

    if (id) {
      const user = await User.query().where('id', id).preload('customer').first()

      if (user) {
        return response.status(200).send({
          data: [user],
        })
      }

      return response.status(404).send({
        errors: [
          {
            message: 'Customer not found',
            code: 'not_found',
          },
        ],
      })
    }

    let role = await Role.findBy('name', Config.get('roles.list.customer'))

    await role?.load('users')

    const customers = await Promise.all(
      role?.users.map(async (user) => {
        await user.load('customer')

        return {
          ...user.toJSON(),
          customer: user.customer.toJSON(),
        }
      }) || []
    )

    return response.json({
      data: customers,
    })
  }

  public async store({ request, response, logger }: HttpContextContract) {
    try {
      const payload = await request.validate(CreateCustomerValidator)

      const role = await Role.findBy('name', Config.get('roles.list.customer'))

      const user = await User.create({
        email: payload.email,
        roleId: role?.id,
      })

      await user.related('customer').create({
        first_name: payload.first_name,
        last_name: payload.last_name,
      })

      await user.load('customer')

      return response.status(201).send({
        data: [{ ...user.toJSON(), customer: user.customer.toJSON() }],
      })
    } catch (error) {
      logger.error(error, 'Error creating customer')

      return response.status(400).send({
        errors: error.messages.errors.map((error: any) => ({
          code: error.rule,
          field: error.field,
          message: error.message,
        })),
      })
    }
  }

  public async update({ request, response, logger }: HttpContextContract) {
    const { id } = request.params()

    // Search for the user and load the customer relation
    const user = await User.query().where('id', id).preload('customer').first()

    if (!user) {
      return response.status(404).send({
        errors: [
          {
            code: 'not_found',
            message: 'Customer not found',
          },
        ],
      })
    }

    try {
      const payload = await request.validate(CreateCustomerValidator)

      logger.info(payload, 'Updating customer')

      await user.load('customer')

      user.email = payload.email

      await user.save()

      logger.info(user, 'Customer updated')

      await user.customer?.merge({
        first_name: payload.first_name,
        last_name: payload.last_name,
      })

      await user.customer?.save()

      return response
        .status(200)
        .send({ data: [{ ...user.toJSON(), customer: user.customer.toJSON() }] })
    } catch (error) {
      logger.error(error, 'Error updating customer')

      return response.status(400).send({
        errors: error.messages.errors.map((error: any) => ({
          code: error.rule,
          field: error.field,
          message: error.message,
        })),
      })
    }
  }

  public async delete({ request, response, logger }: HttpContextContract) {
    const { id } = request.params()

    const user = await User.find(id)

    if (!user) {
      return response.status(404).send({
        errors: [
          {
            code: 'not_found',
            message: 'Customer not found',
          },
        ],
      })
    }

    user.deletedAt = DateTime.now()

    await user.save()

    return response.status(204)
  }
}
