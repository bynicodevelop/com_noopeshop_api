import Settings from 'App/Models/Setting'
import Factory from '@ioc:Adonis/Lucid/Factory'

export default Factory.define(Settings, ({ faker }) => {
  return {
    key: faker.lorem.word(),
    value: faker.lorem.word(),
  }
}).build()
