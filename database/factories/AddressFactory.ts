import Address from 'App/Models/address'
import Factory from '@ioc:Adonis/Lucid/Factory'

export default Factory.define(Address, ({ faker }) => {
  return {
    street1: faker.address.streetAddress(),
    street2: faker.address.secondaryAddress(),
    city: faker.address.city(),
    zip: faker.address.zipCode(),
    country: faker.address.country(),
    id_default: true,
    customerId: 1,
  }
}).build()
