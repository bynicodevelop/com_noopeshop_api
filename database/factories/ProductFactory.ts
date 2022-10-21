import Product from 'App/Models/product'
import Factory from '@ioc:Adonis/Lucid/Factory'

export default Factory.define(Product, ({ faker }) => {
  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
  }
}).build()
