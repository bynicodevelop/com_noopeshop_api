import { test } from '@japa/runner'
import Role from 'App/Models/Role'
import SettingFactory from 'Database/factories/SettingFactory'
import UserFactory from 'Database/factories/UserFactory'

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

test.group('Settings - Index', () => {
  test('Doit lister tous les paramètres', async ({ client, assert }) => {
    const token = await authenticatedUser(client)

    const settings = await SettingFactory.createMany(5)

    const response = await client.get('api/v1/settings').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    assert.exists(response.body().data)
    assert.equal(response.body().data.length, settings.length)
  })

  test('Doit retourner un paramètre par son ID', async ({ client, assert }) => {
    const token = await authenticatedUser(client)

    const setting = await SettingFactory.create()

    const response = await client
      .get(`api/v1/settings/${setting.key}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    assert.equal(response.body().key, setting.key)
  })
})

test.group('Settings - create', () => {
  test('Doit créer un paramètre', async ({ client, assert }) => {
    const token = await authenticatedUser(client)

    const response = await client
      .post('api/v1/settings')
      .header('Authorization', `Bearer ${token}`)
      .form({
        key: 'test',
        value: 'test',
      })

    response.assertStatus(200)

    assert.exists(response.body().key)
  })

  test('Doit retourner une erreur si la key existe déjà', async ({ client, assert }) => {
    const token = await authenticatedUser(client)

    const setting = await SettingFactory.create()

    const response = await client
      .post('api/v1/settings')
      .header('Authorization', `Bearer ${token}`)
      .form({
        key: setting.key,
        value: 'test',
      })

    response.assertStatus(400)

    assert.exists(response.body().errors)
  })
})

test.group('Settings - Update', () => {
  test('Doit mettre à jour un paramètre', async ({ client, assert }) => {
    const token = await authenticatedUser(client)

    const setting = await SettingFactory.merge({
      key: 'key-unique-value-1',
    }).create()

    const response = await client
      .put('api/v1/settings')
      .header('Authorization', `Bearer ${token}`)
      .form({
        key: setting.key,
        value: 'test',
      })

    response.assertStatus(200)

    assert.equal(response.body().key, setting.key)
  })

  test("Doit retourner une erreur si la key n'existe pas", async ({ client, assert }) => {
    const token = await authenticatedUser(client)

    const response = await client
      .put('api/v1/settings')
      .header('Authorization', `Bearer ${token}`)
      .form({
        key: 'key-unique-value-2',
        value: 'unique-value-2',
      })

    response.assertStatus(404)

    assert.exists(response.body().errors)
  })
})

test.group('Settings - Delete', () => {
  test('Doit supprimer un paramètre', async ({ client }) => {
    const token = await authenticatedUser(client)

    const setting = await SettingFactory.create()

    const response = await client
      .delete(`api/v1/settings/${setting.key}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(204)
  })

  test("Doit retourner une erreur si le paramètre n'existe pas", async ({ client }) => {
    const token = await authenticatedUser(client)

    const response = await client
      .delete('api/v1/settings/unknown')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
  })
})
