import { BaseCommand, flags } from '@adonisjs/core/build/standalone'

export default class CreateUser extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'create:user'

  @flags.string({ description: 'Email to connect' })
  public email: string

  @flags.string({ description: 'Password to connect' })
  public password: string

  @flags.string({ description: 'Role' })
  public role: string

  /**
   * Command description is displayed in the "help" output
   */
  public static description = ''

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    // stayAlive: false,
  }

  public async run() {
    const { default: Role } = await import('App/Models/role')
    const { default: User } = await import('App/Models/User')

    if (!this.email || !this.password) {
      this.logger.error('Email and password are required')
      return
    }

    let roleName = 'customer'

    if (this.role) {
      roleName = this.role
    }

    const role = await Role.findByOrFail('name', roleName)

    console.log(role.id)

    const user = await User.create({ email: this.email, password: this.password, roleId: role.id })
    this.logger.success(`User ${user.email} created`)
  }
}
