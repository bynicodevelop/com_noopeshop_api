import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Config from '@ioc:Adonis/Core/Config'
import Role from 'App/Models/Role'

export default class extends BaseSeeder {
  public async run() {
    // Make list of roles
    const roles = Config.get('roles.list')

    // Loop through roles and create them
    const roleKeys = Object.keys(roles)

    for (const roleKey of roleKeys) {
      await Role.create({
        name: roles[roleKey],
      })
    }
  }
}
