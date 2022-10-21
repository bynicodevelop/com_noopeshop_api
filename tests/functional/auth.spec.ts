import { test } from '@japa/runner'
import Role from 'App/Models/Role'
import UserFactory from 'Database/factories/UserFactory'
// import Config from '@ioc:Adonis/Core/Config'

test.group('Auth - Register', () => {
  test('Register user with success', async ({ client, assert }) => {
    const role = await Role.first()

    const user = {
      email: 'john@domain.tld',
      password: 'secret',
      role_id: role!.id,
    }

    const response = await client.post('/api/v1/register').form(user)

    response.assertStatus(201)

    assert.exists(response.body().id)
    assert.equal(response.body().email, user.email)
    assert.equal(response.body().role_id, user.role_id)
  })

  test('Register user with validation error', async ({ client, assert }) => {
    const user = {
      email: '',
      password: '',
    }

    const response = await client.post('/api/v1/register').form(user)

    response.assertStatus(400)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors.length, 2)
    assert.equal(response.body().errors[0].code, 'required')
    assert.equal(response.body().errors[0].field, 'email')
    assert.equal(response.body().errors[0].message, 'required validation failed')
    assert.equal(response.body().errors[1].code, 'required')
    assert.equal(response.body().errors[1].field, 'role_id')
    assert.equal(response.body().errors[1].message, 'required validation failed')
  })
})

test.group('Auth - Login', () => {
  test('Login user with success', async ({ client, assert }) => {
    const userFactory = await UserFactory.merge({
      email: 'johnny@domain.tld',
      password: 'secret',
    }).create()

    const user = {
      email: userFactory.email,
      password: 'secret',
    }

    const response = await client.post('/api/v1/login').form(user)

    response.assertStatus(200)

    assert.exists(response.body().credentials)
    assert.equal(response.body().credentials.type, 'bearer')
  })

  test('Login user with validation error', async ({ client, assert }) => {
    const user = {
      email: '',
      password: '',
    }

    const response = await client.post('/api/v1/login').form(user)

    response.assertStatus(422)

    assert.exists(response.body().errors)
  })

  test('Login user with invalid credentials', async ({ client, assert }) => {
    const user = {
      email: 'invalidJohn@domain.tld',
      password: 'invalidSecret',
    }

    const response = await client.post('/api/v1/login').form(user)

    response.assertStatus(401)

    assert.exists(response.body().message)
  })
})

test.group('Auth - Me', () => {
  test('Get user profile with success', async ({ client, assert }) => {
    const userFactory = await UserFactory.merge({
      email: 'newjohn@domain.tld',
      password: 'secret',
    }).create()

    const user = {
      email: userFactory.email,
      password: 'secret',
    }

    const loginResponse = await client.post('/api/v1/login').form(user)

    const response = await client
      .get('/api/v1/me')
      .header('Authorization', `Bearer ${loginResponse.body().credentials.token}`)
      .send()

    response.assertStatus(200)

    assert.exists(response.body().id)
    assert.equal(response.body().email, user.email)
    assert.notExists(response.body().password)
  })

  test('Get user profile with invalid token', async ({ client, assert }) => {
    const response = await client
      .get('/api/v1/me')
      .header('Authorization', 'Bearer invalidToken')
      .send()

    response.assertStatus(401)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors[0].message, 'E_UNAUTHORIZED_ACCESS: Unauthorized access')
  })
})
