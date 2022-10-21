import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Product from 'App/Models/Product'
import CreateProductValidator from 'App/Validators/CreateProductValidator'

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

  /**
   * @swagger
   * /products:
   *  post:
   *    security:
   *      type: http
   *      scheme: bearer
   *    requestBody:
   *      content:
   *        application/json:
   *          schema:
   *            properties:
   *            $ref: '#/components/schemas/Product'
   *    responses:
   *      201:
   *        description: Product created
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                data:
   *                  type: array
   *                  items:
   *                    $ref: '#/components/schemas/Product'
   */
  public async store({ request, response, logger }: HttpContextContract) {
    try {
      const payload = await request.validate(CreateProductValidator)

      logger.info(payload, 'Creating product')

      const product = await Product.create({
        name: payload.name,
        description: payload.description,
      })

      logger.info(product, 'Product created')

      return response.status(201).send({ data: [product] })
    } catch (error) {
      logger.error(error, 'Error creating product')

      return response.status(400).send({
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
   * /products/:id:
   *  put:
   *    security:
   *      type: http
   *      scheme: bearer
   *    parameters:
   *      - in: path
   *        description: ID of the product to return
   *        name: id
   *    requestBody:
   *     content:
   *       application/json:
   *        schema:
   *          properties:
   *          $ref: '#/components/schemas/Product'
   *    responses:
   *      200:
   *        description: Product updated
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                data:
   *                  type: array
   *                  items:
   *                    $ref: '#/components/schemas/Product'
   *      404:
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
   *                      code:
   *                        type: string
   *                      message:
   *                        type: string
   */
  public async update({ request, response, logger }) {
    const { id } = request.params()

    const product = await Product.find(id)

    if (!product) {
      return response.status(404).send({
        errors: [
          {
            code: 'not_found',
            message: 'Product not found',
          },
        ],
      })
    }

    try {
      const payload = await request.validate(CreateProductValidator)

      logger.info(payload, 'Updating product')

      product.name = payload.name
      product.description = payload.description

      await product.save()

      logger.info(product, 'Product updated')

      return response.status(200).send({ data: [product] })
    } catch (error) {
      logger.error(error, 'Error updating product')

      return response.status(400).send({
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
   * /products/:id:
   *  delete:
   *    security:
   *      type: http
   *      scheme: bearer
   *    parameters:
   *      - in: path
   *        description: ID of the product to return
   *        name: id
   *    responses:
   *      204:
   *        description: Product deleted
   *      404:
   *        description: Product not found
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
   *                      code:
   *                        type: string
   *                      message:
   *                        type: string
   */
  public async destroy({ request, response, logger }) {
    const { id } = request.params()

    const product = await Product.find(id)

    if (!product) {
      return response.status(404).send({
        errors: [
          {
            code: 'not_found',
            message: 'Product not found',
          },
        ],
      })
    }

    logger.info(product, 'Deleting product')

    await product.delete()

    logger.info(product, 'Product deleted')

    return response.status(204).send()
  }
}
