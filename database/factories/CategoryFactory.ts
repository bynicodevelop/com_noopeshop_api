import Category from 'App/Models/category'
import Factory from '@ioc:Adonis/Lucid/Factory'

export default Factory.define(Category, ({ faker }) => {
  return {
    name: faker.commerce.productName(),
    description: faker.lorem.paragraph(),
  }
}).build()
