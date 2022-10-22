import Customer from 'App/Models/Customer'
import Factory from '@ioc:Adonis/Lucid/Factory'

export default Factory.define(Customer, ({ faker }) => {
  return {
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    userId: faker.random.numeric(1),
  }
}).build()
