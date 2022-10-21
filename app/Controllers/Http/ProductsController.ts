import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Product from 'App/Models/Product'

export default class ProductsController {
  /**
   * @swagger
   * /products/:id?:
   *  get:
   *   parameters:
   *    - in: path
   *      description: ID of the product to return
   *      name: id
   *   responses:
   *     200:
   *      description: Login successful
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              data:
   *                type: array
   *                items:
   *                  $ref: '#/components/schemas/Product'
   *     404:
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
   *                    message:
   *                      type: string
   */
  public async index({ request, response }: HttpContextContract) {
    const { id } = request.params()

    if (id) {
      const product = await Product.find(id)

      if (product) {
        return response.status(200).send({ data: product })
      }

      return response.status(404).send({
        errors: [
          {
            code: 'not_found',
            message: 'Product not found',
          },
        ],
      })
    }

    const products = await Product.all()

    return response.status(200).send({ data: products })
  }
}
