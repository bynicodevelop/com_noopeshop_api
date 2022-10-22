import { test } from '@japa/runner'
import Customer from 'App/Models/Customer'
import Role from 'App/Models/Role'
import User from 'App/Models/user'
import CustomerFactory from 'Database/factories/CustomerFactory'
import UserFactory from 'Database/factories/UserFactory'
import { DateTime } from 'luxon'
import execa from 'execa'

const getRoleAdmin = async () => {
  const role = await Role.findBy('name', 'admin')

  return role
}

const getRoleCustomer = async () => {
  const role = await Role.findBy('name', 'customer')

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

test.group('Customer - List', (group) => {
  group.each.setup(async () => {
    await execa.node('ace', ['migration:fresh', '--seed'], {})
  })

  test('Should return a list of customers', async ({ client, assert }) => {
    const token = await authenticatedUser(client)

    const role = await Role.findBy('name', 'customer')

    const users = await UserFactory.merge([
      {
        email: `johnuniquelist1@domain.tld`,
        roleId: role?.id,
      },
      {
        email: `johnuniquelist2@domain.tld`,
        roleId: role?.id,
      },
    ]).createMany(2)

    const customers = await Promise.all(
      users.map(async (user) => {
        const { id } = user

        const customer = await CustomerFactory.merge({
          userId: id,
        }).create()

        return customer
      }) || []
    )

    const response = await client
      .get('/api/v1/customers')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    assert.exists(response.body().data)
    assert.equal(response.body().data.length, customers.length)
  })

  test('Should return a customer by id', async ({ client, assert }) => {
    const token = await authenticatedUser(client)

    const role = await Role.findBy('name', 'customer')

    const users = await UserFactory.merge({
      roleId: role?.id,
    }).createMany(2)

    const customers = await Promise.all(
      users.map(async (user) => {
        const customer = await CustomerFactory.merge({
          userId: user.id,
        }).create()

        return customer
      }) || []
    )

    const response = await client
      .get(`/api/v1/customers/${customers[0].id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    assert.equal(response.body().data[0].id, customers[0].id)
  })
})

test.group('Customer - Create', () => {
  test('create customer with success', async ({ client, assert }) => {
    const customer = {
      email: 'johncustomer@domain.tld',
      first_name: 'John',
      last_name: 'Doe',
    }

    const response = await client.post('/api/v1/customers').form(customer)

    response.assertStatus(201)

    assert.exists(response.body().data[0].id)
    assert.equal(response.body().data[0].customer.first_name, customer.first_name)
    assert.equal(response.body().data[0].customer.last_name, customer.last_name)
    assert.equal(response.body().data[0].email, customer.email)
  })

  test('create customer with error - email is required', async ({ client, assert }) => {
    const customer = {
      first_name: 'John',
      last_name: 'Doe',
    }

    const response = await client.post('/api/v1/customers').form(customer)

    response.assertStatus(400)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors.length, 1)
    assert.equal(response.body().errors[0].code, 'required')
    assert.equal(response.body().errors[0].field, 'email')
    assert.equal(response.body().errors[0].message, 'required validation failed')
  })

  test('create customer with error - first name is required', async ({ client, assert }) => {
    const customer = {
      email: 'johnerror1@domain.tld',
      last_name: 'Doe',
    }

    const response = await client.post('/api/v1/customers').form(customer)

    response.assertStatus(400)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors.length, 1)
    assert.equal(response.body().errors[0].code, 'required')
    assert.equal(response.body().errors[0].field, 'first_name')
    assert.equal(response.body().errors[0].message, 'required validation failed')
  })

  test('create customer with error - last name is required', async ({ client, assert }) => {
    const customer = {
      email: 'johnerror2@domain.tld',
      first_name: 'John',
    }

    const response = await client.post('/api/v1/customers').form(customer)

    response.assertStatus(400)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors.length, 1)
    assert.equal(response.body().errors[0].code, 'required')
    assert.equal(response.body().errors[0].field, 'last_name')
    assert.equal(response.body().errors[0].message, 'required validation failed')
  })
})

test.group('Customer - Update', () => {
  test('update customer with success', async ({ client, assert }) => {
    const token = await authenticatedUser(client)
    const customerRole = await getRoleCustomer()

    const user = await UserFactory.merge({
      email: 'johnnyupdatecustomer@domain.tld',
      roleId: customerRole?.id,
    }).create()

    await CustomerFactory.merge({
      first_name: 'Johnny',
      last_name: 'Doe',
      userId: user.id,
    }).create()

    const newCustomer = {
      email: 'jeff@domain.tld',
      first_name: 'Jeff',
      last_name: 'Dy',
    }

    const response = await client
      .put(`/api/v1/customers/${user.id}`)
      .form(newCustomer)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    assert.equal(response.body().data[0].id, user.id)
    assert.equal(response.body().data[0].email, newCustomer.email)
    assert.equal(response.body().data[0].customer.first_name, newCustomer.first_name)
    assert.equal(response.body().data[0].customer.last_name, newCustomer.last_name)
  })

  test('update customer with error - customer not found', async ({ client, assert }) => {
    const token = await authenticatedUser(client)

    const response = await client
      .put('/api/v1/customers/404')
      .form({
        email: 'joe@domain.tld',
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors.length, 1)
    assert.equal(response.body().errors[0].code, 'not_found')
    assert.equal(response.body().errors[0].message, 'Customer not found')
  })

  test('update customer with error - email is required', async ({ client, assert }) => {
    const token = await authenticatedUser(client)

    const response = await client
      .put(`/api/v1/customers/1`)
      .form({
        first_name: 'John',
        last_name: 'Doe',
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(400)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors.length, 1)
    assert.equal(response.body().errors[0].code, 'required')
    assert.equal(response.body().errors[0].field, 'email')
    assert.equal(response.body().errors[0].message, 'required validation failed')
  })

  test('update customer with error - first name is required', async ({ client, assert }) => {
    const token = await authenticatedUser(client)

    const response = await client
      .put(`/api/v1/customers/1`)
      .form({
        email: 'jose@domain.tld',
        last_name: 'Doe',
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(400)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors.length, 1)
    assert.equal(response.body().errors[0].code, 'required')
    assert.equal(response.body().errors[0].field, 'first_name')
  })

  test('update customer with error - last name is required', async ({ client, assert }) => {
    const token = await authenticatedUser(client)

    const response = await client
      .put(`/api/v1/customers/1`)
      .form({
        email: 'jose@domain.tld',
        first_name: 'Jose',
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(400)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors.length, 1)
    assert.equal(response.body().errors[0].code, 'required')
    assert.equal(response.body().errors[0].field, 'last_name')
  })
})

test.group('Customer - Delete', () => {
  test('delete customer with success', async ({ client, assert }) => {
    const token = await authenticatedUser(client)
    const customerRole = await getRoleCustomer()

    const user = await UserFactory.merge({
      email: 'johnnydelete@domain.tld',
      roleId: customerRole?.id,
    }).create()

    await CustomerFactory.merge({
      first_name: 'Johnny',
      last_name: 'Doe',
      userId: user.id,
    }).create()

    const response = await client
      .delete(`/api/v1/customers/${user.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(204)

    const userDelete = await User.find(user.id)

    assert.isNotNull(userDelete?.deletedAt)
  })

  test('delete customer with error - customer not found', async ({ client, assert }) => {
    const token = await authenticatedUser(client)

    const response = await client
      .delete('/api/v1/customers/404')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors.length, 1)
    assert.equal(response.body().errors[0].code, 'not_found')
    assert.equal(response.body().errors[0].message, 'Customer not found')
  })
})
