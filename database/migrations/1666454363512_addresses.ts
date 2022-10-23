import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'addresses'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('street1').notNullable()
      table.string('street2')
      table.string('city').notNullable()
      table.string('zip').notNullable()
      table.string('country').notNullable()
      table.boolean('id_default').notNullable().defaultTo(false)

      table.integer('customer_id').unsigned().references('id').inTable('customers')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
