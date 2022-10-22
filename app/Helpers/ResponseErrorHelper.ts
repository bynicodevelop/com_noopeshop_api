/**
 * @swagger
 *  components:
 *    schemas:
 *      ResponseErrorHelper:
 *        type: object
 *        properties:
 *          errors:
 *              type: array
 *              items:
 *                  type: object
 *                  properties:
 *                      code:
 *                          type: string
 *                      field:
 *                          type: string
 *                      message:
 *                          type: string
 */
export default class ResponseErrorHelper {
  public static error(error: any) {
    return {
      errors: error.messages.errors.map((error: any) => ({
        code: error.rule || error.code,
        field: error.field,
        message: error.message,
      })),
    }
  }
}
