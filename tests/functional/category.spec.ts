import { test } from '@japa/runner'
import CategoryFactory from 'Database/factories/CategoryFactory'
import UserFactory from 'Database/factories/UserFactory'
import Role from 'App/Models/role'

const getRoleAdmin = async () => {
  const role = await Role.findBy('name', 'admin')

  return role
}

const authenticatedUser = async (client) => {
  const role = await getRoleAdmin()

  const user = await UserFactory.merge({
    password: 'secret',
    role_id: role?.id,
  }).create()

  const loginResponse = await client.post('api/v1/login').form({
    email: user.email,
    password: 'secret',
  })

  return loginResponse.body().credentials.token
}

test.group('Category - Index', (): void => {
  test('Doit retourner une liste de catégories', async ({ client, assert }): Promise<void> => {
    await CategoryFactory.createMany(10)

    const response = await client.get('/api/v1/categories')

    response.assertStatus(200)

    assert.exists(response.body().data)
    assert.isArray(response.body().data)
    assert.lengthOf(response.body().data, 10)
  })

  test('Doit retourner une catégorie', async ({ client, assert }): Promise<void> => {
    const category = await CategoryFactory.create()

    const response = await client.get(`/api/v1/categories/${category.id}`)

    response.assertStatus(200)

    assert.exists(response.body().data)
    assert.equal(response.body().data.id, category.id)
  })

  test("Doit retourner une erreur 404 si la catégorie n'existe pas", async ({
    client,
    assert,
  }): Promise<void> => {
    const response = await client.get('/api/v1/categories/404')

    response.assertStatus(404)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors[0].code, 'not_found')
    assert.equal(response.body().errors[0].message, 'Category not found')
  })
})

test.group('Category - Store', (): void => {
  test('Doit créer une catégorie', async ({ client, assert }): Promise<void> => {
    const token = await authenticatedUser(client)

    const response = await client
      .post('/api/v1/categories')
      .header('Authorization', `Bearer ${token}`)
      .form({
        name: 'Test',
        description: 'Test',
      })

    response.assertStatus(201)

    assert.exists(response.body().data)
    assert.equal(response.body().data[0].name, 'Test')
    assert.equal(response.body().data[0].description, 'Test')
  })

  test('Doit retourner une erreur 400 si le nom est manquant', async ({
    client,
    assert,
  }): Promise<void> => {
    const token = await authenticatedUser(client)

    const response = await client
      .post('/api/v1/categories')
      .header('Authorization', `Bearer ${token}`)
      .form({
        description: 'Test',
      })

    response.assertStatus(400)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors[0].code, 'required')
    assert.equal(response.body().errors[0].message, 'required validation failed')
  })

  test('Doit retourner une erreur 400 si la description est manquante', async ({
    client,
    assert,
  }): Promise<void> => {
    const token = await authenticatedUser(client)

    const response = await client
      .post('/api/v1/categories')
      .header('Authorization', `Bearer ${token}`)
      .form({
        name: 'Test',
      })

    response.assertStatus(400)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors[0].code, 'required')
    assert.equal(response.body().errors[0].message, 'required validation failed')
  })
})

test.group('Category - Update', (): void => {
  test('Doit mettre à jour une catégorie', async ({ client, assert }): Promise<void> => {
    const token = await authenticatedUser(client)
    const category = await CategoryFactory.create()

    const response = await client
      .put(`/api/v1/categories/${category.id}`)
      .header('Authorization', `Bearer ${token}`)
      .form({
        name: 'Test',
        description: 'Test',
      })

    response.assertStatus(200)

    assert.exists(response.body().data)
    assert.equal(response.body().data[0].name, 'Test')
    assert.equal(response.body().data[0].description, 'Test')
  })

  test("Doit retourner une erreuru 404 si la catégorie n'existe pas", async ({
    client,
    assert,
  }): Promise<void> => {
    const token = await authenticatedUser(client)

    const response = await client
      .put('/api/v1/categories/404')
      .header('Authorization', `Bearer ${token}`)
      .form({
        name: 'Test',
        description: 'Test',
      })

    response.assertStatus(404)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors[0].code, 'not_found')
    assert.equal(response.body().errors[0].message, 'Category not found')
  })

  test('Doit retourner une erreur 400 si le nom est manquant', async ({
    client,
    assert,
  }): Promise<void> => {
    const token = await authenticatedUser(client)
    const category = await CategoryFactory.create()

    const response = await client
      .put(`/api/v1/categories/${category.id}`)
      .header('Authorization', `Bearer ${token}`)
      .form({
        description: 'Test',
      })

    response.assertStatus(400)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors[0].code, 'required')
    assert.equal(response.body().errors[0].message, 'required validation failed')
  })

  test('Doit retourner une erreur 400 si la description est manquante', async ({
    client,
    assert,
  }): Promise<void> => {
    const token = await authenticatedUser(client)
    const category = await CategoryFactory.create()

    const response = await client
      .put(`/api/v1/categories/${category.id}`)
      .header('Authorization', `Bearer ${token}`)
      .form({
        name: 'Test',
      })

    response.assertStatus(400)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors[0].code, 'required')
    assert.equal(response.body().errors[0].message, 'required validation failed')
  })
})

test.group('Category - Delete', (): void => {
  test('Doit supprimer une catégorie', async ({ client }): Promise<void> => {
    const token = await authenticatedUser(client)
    const category = await CategoryFactory.create()

    const response = await client
      .delete(`/api/v1/categories/${category.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(204)
  })

  test("Doit retourner une erreur 404 si la catégorie n'existe pas", async ({
    client,
    assert,
  }): Promise<void> => {
    const token = await authenticatedUser(client)

    const response = await client
      .delete('/api/v1/categories/404')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors[0].code, 'not_found')
    assert.equal(response.body().errors[0].message, 'Category not found')
  })
})
