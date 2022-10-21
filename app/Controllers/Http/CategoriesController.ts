import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Category from 'App/Models/category'
import CreateCategoryValidator from 'App/Validators/CreateCategoryValidator'

export default class CategoriesController {
  /**
   * @swagger
   * /categories/:id?:
   *  get:
   *   parameters:
   *    - in: path
   *      description: ID of the category to return
   *      name: id
   *   responses:
   *     200:
   *      description: Category found
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              data:
   *                type: array
   *                items:
   *                  $ref: '#/components/schemas/Category'
   *     404:
   *      description: Category not found
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
  public async index({ request, response, logger }: HttpContextContract) {
    const id = request.param('id')

    if (id) {
      const category = await Category.find(id)

      if (category) {
        return response.status(200).send({ data: category })
      }

      return response.status(404).json({
        errors: [
          {
            code: 'not_found',
            message: 'Category not found',
          },
        ],
      })
    }

    const categories = await Category.all()

    logger.info(
      {
        count: categories.length,
      },
      'Categories found'
    )

    return response.status(200).send({ data: categories })
  }

  /**
   * @swagger
   * /categories:
   *  post:
   *    security:
   *      type: http
   *      scheme: bearer
   *    requestBody:
   *      content:
   *        application/json:
   *          schema:
   *            properties:
   *            $ref: '#/components/schemas/Category'
   *    responses:
   *      201:
   *        description: Category created
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                data:
   *                  type: array
   *                  items:
   *                    $ref: '#/components/schemas/Category'
   */
  public async store({ request, response, logger }: HttpContextContract) {
    try {
      const payload = await request.validate(CreateCategoryValidator)

      logger.info(payload, 'Category product')

      const category = await Category.create(payload)

      logger.info(category, 'Category created')

      return response.status(201).send({ data: [category] })
    } catch (error) {
      logger.error(error, 'Error creating category')

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
   * /categories/:id:
   *  put:
   *    security:
   *      type: http
   *      scheme: bearer
   *    parameters:
   *      - in: path
   *        description: ID of the Category to return
   *        name: id
   *    requestBody:
   *     content:
   *       application/json:
   *        schema:
   *          properties:
   *          $ref: '#/components/schemas/Category'
   *    responses:
   *      200:
   *        description: Category updated
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                data:
   *                  type: array
   *                  items:
   *                    $ref: '#/components/schemas/Category'
   *      404:
   *        description: Category not found
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
  public async update({ request, response, logger }: HttpContextContract) {
    const { id } = request.params()

    const category = await Category.find(id)

    if (!category) {
      return response.status(404).send({
        errors: [
          {
            code: 'not_found',
            message: 'Category not found',
          },
        ],
      })
    }

    try {
      const payload = await request.validate(CreateCategoryValidator)

      category.merge(payload)

      await category.save()

      return response.status(200).send({ data: [category] })
    } catch (error) {
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
   * /categories/:id:
   *  delete:
   *    security:
   *      type: http
   *      scheme: bearer
   *    parameters:
   *      - in: path
   *        description: ID of the category to return
   *        name: id
   *    responses:
   *      204:
   *        description: Category deleted
   *      404:
   *        description: Category not found
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
  public async delete({ request, response, logger }: HttpContextContract) {
    const { id } = request.params()

    const category = await Category.find(id)

    if (!category) {
      return response.status(404).send({
        errors: [
          {
            code: 'not_found',
            message: 'Category not found',
          },
        ],
      })
    }

    await category.delete()

    return response.status(204).send()
  }
}
