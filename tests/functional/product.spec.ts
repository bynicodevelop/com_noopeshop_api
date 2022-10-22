import { test } from '@japa/runner'
import Role from 'App/Models/Role'
import CategoryFactory from 'Database/factories/CategoryFactory'
import ProductFactory from 'Database/factories/ProductFactory'
import UserFactory from 'Database/factories/UserFactory'

const getRoleAdmin = async () => {
  const role = await Role.findBy('name', 'admin')

  return role
}

const authenticatedUser = async (client) => {
  const role = await getRoleAdmin()

  const user = await UserFactory.merge({
    password: 'secret',
    roleId: role?.id,
  }).create()

  const loginResponse = await client.post('api/v1/login').form({
    email: user.email,
    password: 'secret',
  })

  return loginResponse.body().credentials.token
}

test.group('Products - Index', () => {
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

  test("Doit retourner une erreur 404 si le produit n'existe pas", async ({ client, assert }) => {
    const response = await client.get('api/v1/products/404')

    response.assertStatus(404)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors[0].code, 'not_found')
    assert.equal(response.body().errors[0].message, 'Product not found')
  })
})

test.group('Product - Store', (): void => {
  test("Doit permettre la création d'un produit avec succes", async ({ client, assert }) => {
    const token = await authenticatedUser(client)

    const product = {
      name: 'Product 1',
      description: 'Description 1',
    }

    const response = await client
      .post('api/v1/products')
      .header('Authorization', `Bearer ${token}`)
      .form(product)

    response.assertStatus(201)

    assert.exists(response.body().data)
    assert.equal(response.body().data[0].name, product.name)
    assert.equal(response.body().data[0].description, product.description)
  })

  test("Doit retourner une erreur 400 si le nom n'est pas fourni", async ({ client, assert }) => {
    const token = await authenticatedUser(client)

    const product = {
      description: 'Description 1',
    }

    const response = await client
      .post('api/v1/products')
      .header('Authorization', `Bearer ${token}`)
      .form(product)

    response.assertStatus(400)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors[0].code, 'required')
    assert.equal(response.body().errors[0].field, 'name')
    assert.equal(response.body().errors[0].message, 'required validation failed')
  })

  test("Doit retourner une erreur 400 si la description n'est pas fournie", async ({
    client,
    assert,
  }) => {
    const token = await authenticatedUser(client)

    const product = {
      name: 'Product 1',
    }

    const response = await client
      .post('api/v1/products')
      .header('Authorization', `Bearer ${token}`)
      .form(product)

    response.assertStatus(400)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors[0].code, 'required')
    assert.equal(response.body().errors[0].field, 'description')
    assert.equal(response.body().errors[0].message, 'required validation failed')
  })
})

test.group('Product - Update', (): void => {
  test("Doit permettre la mise à jour d'un produit avec succes", async ({ client, assert }) => {
    const token = await authenticatedUser(client)

    const product = await ProductFactory.create()

    const response = await client
      .put(`api/v1/products/${product.id}`)
      .header('Authorization', `Bearer ${token}`)
      .form({
        name: 'Product 1',
        description: 'Description 1',
      })

    response.assertStatus(200)

    assert.exists(response.body().data)
    assert.equal(response.body().data[0].name, 'Product 1')
    assert.equal(response.body().data[0].description, 'Description 1')
  })

  test("Doit retourner une erreur 404 si le produit n'existe pas", async ({ client, assert }) => {
    const token = await authenticatedUser(client)

    const response = await client
      .put('api/v1/products/404')
      .header('Authorization', `Bearer ${token}`)
      .form({
        name: 'Product 1',
        description: 'Description 1',
      })

    response.assertStatus(404)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors[0].code, 'not_found')
    assert.equal(response.body().errors[0].message, 'Product not found')
  })

  test("Doit retourner une erreur 400 si le nom n'est pas fourni", async ({ client, assert }) => {
    const token = await authenticatedUser(client)

    const product = await ProductFactory.create()

    const response = await client
      .put(`api/v1/products/${product.id}`)
      .header('Authorization', `Bearer ${token}`)
      .form({
        description: 'Description 1',
      })

    response.assertStatus(400)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors[0].code, 'required')
    assert.equal(response.body().errors[0].field, 'name')
    assert.equal(response.body().errors[0].message, 'required validation failed')
  })

  test("Doit retourner une erreur 400 si la description n'est pas fournie", async ({
    client,
    assert,
  }) => {
    const token = await authenticatedUser(client)

    const product = await ProductFactory.create()

    const response = await client
      .put(`api/v1/products/${product.id}`)
      .header('Authorization', `Bearer ${token}`)
      .form({
        name: 'Product 1',
      })

    response.assertStatus(400)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors[0].code, 'required')
    assert.equal(response.body().errors[0].field, 'description')
    assert.equal(response.body().errors[0].message, 'required validation failed')
  })
})

test.group('Product - Delete', (): void => {
  test("Doit permettre la suppression d'un produit avec succes", async ({ client }) => {
    const token = await authenticatedUser(client)

    const product = await ProductFactory.create()

    const response = await client
      .delete(`api/v1/products/${product.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(204)
  })

  test("Doit retourner une erreur 404 si le produit n'existe pas", async ({ client, assert }) => {
    const token = await authenticatedUser(client)

    const response = await client
      .delete('api/v1/products/404')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors[0].code, 'not_found')
    assert.equal(response.body().errors[0].message, 'Product not found')
  })
})

test.group('Product - Categories', (): void => {
  test("Doit retourner la liste des categories d'un produit avec succes", async ({
    client,
    assert,
  }) => {
    const product = await ProductFactory.create()

    const category = await CategoryFactory.create()

    await product.related('categories').attach([category.id])

    const response = await client.get(`api/v1/products/${product.id}/categories`)

    response.assertStatus(200)

    assert.exists(response.body().data)
    assert.equal(response.body().data[0].id, product.id)
    assert.equal(response.body().data[0].categories[0].id, category.id)
  })

  test("Doit retourner une erreur 404 si le produit n'existe pas", async ({ client, assert }) => {
    const response = await client.get('api/v1/products/404/categories')

    response.assertStatus(404)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors[0].code, 'not_found')
    assert.equal(response.body().errors[0].message, 'Product not found')
  })
})
