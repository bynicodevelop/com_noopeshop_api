import { test } from '@japa/runner'
import Role from 'App/Models/Role'
import Config from '@ioc:Adonis/Core/Config'
import UserFactory from 'Database/factories/UserFactory'
import CustomerFactory from 'Database/factories/CustomerFactory'
import AddressFactory from 'Database/factories/AddressFactory'
import execa from 'execa'
import Address from 'App/Models/Address'

const authenticatedUser = async ({ client, user }) => {
  const loginResponse = await client.post('api/v1/login').form({
    email: user.email,
    password: 'secret',
  })

  return loginResponse.body().credentials.token
}

test.group('Address - List', () => {
  test("Doit retourner les adresses d'un utilisateur", async ({ client, assert }) => {
    const role = await Role.findByOrFail('name', Config.get('roles.list.customer'))
    const user = await UserFactory.merge({ roleId: role.id, password: 'secret' }).create()
    const customer = await CustomerFactory.merge({ userId: user.id }).create()
    const address = await AddressFactory.merge({
      customerId: customer.id,
    }).create()

    const token = await authenticatedUser({ client, user })

    const response = await client
      .get(`api/v1/customers/${customer.id}/addresses`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    assert.equal(response.body().data.length, 1)

    assert.equal(response.body().data[0].id, address.id)
  })

  test('Doit retourner une adresse par son ID', async ({ client, assert }) => {
    const role = await Role.findByOrFail('name', Config.get('roles.list.customer'))
    const user = await UserFactory.merge({ roleId: role.id, password: 'secret' }).create()
    const customer = await CustomerFactory.merge({ userId: user.id }).create()
    const address = await AddressFactory.merge([
      {
        customerId: customer.id,
      },
      {
        customerId: customer.id,
      },
    ]).createMany(2)

    const token = await authenticatedUser({ client, user })

    const response = await client
      .get(`api/v1/customers/${customer.id}/addresses/${address[0].id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    assert.equal(response.body().data.length, 1)
    assert.equal(response.body().data[0].id, address[0].id)
  })

  test("Doit retourner une erreur 401 si un utilisateur essaye d'accéder à une adresse qui ne lui appartient pas", async ({
    client,
    assert,
  }) => {
    const role = await Role.findByOrFail('name', Config.get('roles.list.customer'))
    const user = await UserFactory.merge({ roleId: role.id, password: 'secret' }).create()
    const customer = await CustomerFactory.merge({ userId: user.id }).create()

    const user2 = await UserFactory.merge({ roleId: role.id, password: 'secret' }).create()
    const customer2 = await CustomerFactory.merge({ userId: user2.id }).create()
    const address = await AddressFactory.merge({
      customerId: customer2.id,
    }).create()

    const token = await authenticatedUser({ client, user })

    const response = await client
      .get(`api/v1/customers/${customer.id}/addresses/${address.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(401)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors[0].code, 'unauthorized')
    assert.equal(response.body().errors[0].message, 'Unauthorized')
  })
})

test.group('Address - Create', (group) => {
  group.each.setup(async () => {
    await execa.node('ace', ['migration:fresh', '--seed'], {})
  })

  test('Doit permettre à un customer de rensigner une adresse par default', async ({
    client,
    assert,
  }) => {
    const role = await Role.findByOrFail('name', Config.get('roles.list.customer'))
    const user = await UserFactory.merge({ roleId: role.id, password: 'secret' }).create()
    const customer = await CustomerFactory.merge({ userId: user.id }).create()

    const token = await authenticatedUser({ client, user })

    const response = await client
      .post(`api/v1/customers/${customer.id}/addresses`)
      .header('Authorization', `Bearer ${token}`)
      .form({
        street1: 'rue de la paix',
        street2: 'rue de la joie',
        city: 'Paris',
        zip: '75000',
        country: 'France',
      })

    response.assertStatus(201)

    assert.equal(response.body().data.length, 1)
    assert.equal(response.body().data[0].id_default, true)
  })

  test("Doit permettre à un customer d'ajouter une adresse (non par defaut)", async ({
    client,
    assert,
  }) => {
    const role = await Role.findByOrFail('name', Config.get('roles.list.customer'))
    const user = await UserFactory.merge({ roleId: role.id, password: 'secret' }).create()
    const customer = await CustomerFactory.merge({ userId: user.id }).create()
    const address = await AddressFactory.merge({
      customerId: customer.id,
      id_default: true,
    }).create()

    const token = await authenticatedUser({ client, user })

    const response = await client
      .post(`api/v1/customers/${customer.id}/addresses`)
      .header('Authorization', `Bearer ${token}`)
      .form({
        street1: 'rue de la paix',
        street2: 'rue de la joie',
        city: 'Paris',
        zip: '75000',
        country: 'France',
      })

    response.assertStatus(201)

    const addresses = await Address.all()

    assert.equal(addresses.length, 2)
    assert.equal(addresses.filter((a) => a.id_default === true).length, 1)
    assert.isFalse(addresses.filter((a) => a.id !== address.id)[0].id_default)
  })

  test('Doit retourner une erreur 400 si les champs principaux ne sont pas rensignées', async ({
    client,
    assert,
  }) => {
    const role = await Role.findByOrFail('name', Config.get('roles.list.customer'))
    const user = await UserFactory.merge({ roleId: role.id, password: 'secret' }).create()
    const customer = await CustomerFactory.merge({ userId: user.id }).create()

    const token = await authenticatedUser({ client, user })

    const response = await client
      .post(`api/v1/customers/${customer.id}/addresses`)
      .header('Authorization', `Bearer ${token}`)
      .form({})

    response.assertStatus(400)

    assert.exists(response.body().errors)
    assert.equal(response.body().errors[0].code, 'required')
    assert.equal(response.body().errors[0].field, 'street1')
    assert.equal(response.body().errors[0].message, 'required validation failed')

    assert.equal(response.body().errors[1].code, 'required')
    assert.equal(response.body().errors[1].field, 'city')
    assert.equal(response.body().errors[1].message, 'required validation failed')

    assert.equal(response.body().errors[2].code, 'required')
    assert.equal(response.body().errors[2].field, 'zip')
    assert.equal(response.body().errors[2].message, 'required validation failed')

    assert.equal(response.body().errors[3].code, 'required')
    assert.equal(response.body().errors[3].field, 'country')
    assert.equal(response.body().errors[3].message, 'required validation failed')
  })
})

test.group('Address - update', (group) => {
  group.each.setup(async () => {
    await execa.node('ace', ['migration:fresh', '--seed'], {})
  })

  test('Doit permettre à un customer de modifier une adresse', async ({ client, assert }) => {
    const role = await Role.findByOrFail('name', Config.get('roles.list.customer'))
    const user = await UserFactory.merge({ roleId: role.id, password: 'secret' }).create()
    const customer = await CustomerFactory.merge({ userId: user.id }).create()
    const address = await AddressFactory.merge({
      customerId: customer.id,
      id_default: true,
    }).create()

    const token = await authenticatedUser({ client, user })

    const response = await client
      .put(`api/v1/customers/${customer.id}/addresses/${address.id}`)
      .header('Authorization', `Bearer ${token}`)
      .form({
        street1: 'rue de la paix',
        street2: 'rue de la joie',
        city: 'Paris',
        zip: '75000',
        country: 'France',
      })

    response.assertStatus(200)

    assert.equal(response.body().data.length, 1)
    assert.equal(response.body().data[0].id_default, true)
    assert.equal(response.body().data[0].street1, 'rue de la paix')
    assert.equal(response.body().data[0].street2, 'rue de la joie')
    assert.equal(response.body().data[0].city, 'Paris')
    assert.equal(response.body().data[0].zip, '75000')
    assert.equal(response.body().data[0].country, 'France')
  })

  test('Doit permettre à un customer de modifier une adresse par default', async ({
    client,
    assert,
  }) => {
    const role = await Role.findByOrFail('name', Config.get('roles.list.customer'))
    const user = await UserFactory.merge({ roleId: role.id, password: 'secret' }).create()
    const customer = await CustomerFactory.merge({ userId: user.id }).create()
    const addresses = await AddressFactory.merge([
      {
        customerId: customer.id,
        id_default: false,
      },
      {
        customerId: customer.id,
        id_default: true,
      },
    ]).createMany(2)

    const token = await authenticatedUser({ client, user })

    const response = await client
      .put(`api/v1/customers/${customer.id}/addresses/${addresses[0].id}`)
      .header('Authorization', `Bearer ${token}`)
      .form({
        street1: 'rue de la paix',
        street2: 'rue de la joie',
        city: 'Paris',
        zip: '75000',
        country: 'France',
        id_default: true,
      })

    response.assertStatus(200)

    const results = await Address.all()

    assert.equal(results.length, 2)
    assert.equal(results.filter((a) => a.id_default === true).length, 1)
    assert.isTrue(results.filter((a) => a.id === addresses[0].id)[0].id_default)
    assert.isFalse(results.filter((a) => a.id === addresses[1].id)[0].id_default)
  })
})

test.group('Address - Delete', () => {
  test('Doit permettre à un customer de supprimer une adresse', async ({ client, assert }) => {
    const role = await Role.findByOrFail('name', Config.get('roles.list.customer'))
    const user = await UserFactory.merge({ roleId: role.id, password: 'secret' }).create()
    const customer = await CustomerFactory.merge({ userId: user.id }).create()
    const address = await AddressFactory.merge({
      customerId: customer.id,
      id_default: false,
    }).create()

    const token = await authenticatedUser({ client, user })

    const response = await client
      .delete(`api/v1/customers/${customer.id}/addresses/${address.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(204)
  })

  test("Doit retourner une erreur 404 si l'adresse n'existe pas", async ({ client, assert }) => {
    const role = await Role.findByOrFail('name', Config.get('roles.list.customer'))
    const user = await UserFactory.merge({ roleId: role.id, password: 'secret' }).create()
    const customer = await CustomerFactory.merge({ userId: user.id }).create()

    const token = await authenticatedUser({ client, user })

    const response = await client
      .delete(`api/v1/customers/${customer.id}/addresses/999`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
  })

  test("Doit retourner une erreur si l'utilisateur veux supprimer son adresse par default", async ({
    client,
    assert,
  }) => {
    const role = await Role.findByOrFail('name', Config.get('roles.list.customer'))
    const user = await UserFactory.merge({ roleId: role.id, password: 'secret' }).create()
    const customer = await CustomerFactory.merge({ userId: user.id }).create()
    const address = await AddressFactory.merge({
      customerId: customer.id,
      id_default: true,
    }).create()

    const token = await authenticatedUser({ client, user })

    const response = await client
      .delete(`api/v1/customers/${customer.id}/addresses/${address.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(400)

    assert.equal(response.body().errors[0].code, 'default_address')
    assert.equal(response.body().errors[0].field, 'id_default')
    assert.equal(response.body().errors[0].message, 'You can not delete your default address')
  })
})
