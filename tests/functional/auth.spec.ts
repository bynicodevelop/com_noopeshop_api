import { test } from '@japa/runner'
import UserFactory from 'Database/factories/UserFactory'

test.group('Auth - Register', () => {
  test('Register user with success', async ({ client, assert }) => {
    const user = {
      email: 'john@domain.tld',
      password: 'secret',
    }

    const response = await client.post('/api/v1/register').form(user)

    response.assertStatus(201)

    assert.exists(response.body().id)
    assert.equal(response.body().email, user.email)
  })

  test('Register user with validation error', async ({ client, assert }) => {
    const user = {
      email: '',
      password: '',
    }

    const response = await client.post('/api/v1/register').form(user)

    response.assertStatus(400)

    assert.exists(response.body().errors)
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
