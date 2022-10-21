import { test } from '@japa/runner'
import ProductFactory from 'Database/factories/ProductFactory'

test.group('Products', () => {
  test('Doit retourner une liste de produits (10)', async ({ client, assert }) => {
    await ProductFactory.createMany(10)

    const response = await client.get('api/v1/products')

    response.assertStatus(200)

    assert.exists(response.body().data)
    assert.isArray(response.body().data)
    assert.lengthOf(response.body().data, 10)
  })

  test('Doit retourner un produit', async ({ client, assert }) => {
    const product = await ProductFactory.create()

    const response = await client.get(`api/v1/products/${product.id}`)

    response.assertStatus(200)

    assert.exists(response.body().data)
    assert.equal(response.body().data.id, product.id)
  })

  test('Doit retourner une erreur 404 si le produit n\'existe pas', async ({ client, assert }) => {
    const response = await client.get('api/v1/products/404')

    response.assertStatus(404)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors[0].code, 'not_found')
    assert.equal(response.body().errors[0].message, 'Product not found')

  }
})
