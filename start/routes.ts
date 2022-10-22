/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/register', 'AuthController.register')
  Route.post('/login', 'AuthController.login')

  Route.get('/me', 'AuthController.me').middleware('auth')

  Route.get('/products/:id?', 'ProductsController.index')
  Route.get('/products/:id/categories', 'ProductsController.productCategories')

  Route.get('/categories/:id?', 'CategoriesController.index')

  Route.post('/customers', 'CustomersController.store')

  Route.group(() => {
    Route.post('/products', 'ProductsController.store')
    Route.put('/products/:id', 'ProductsController.update')
    Route.delete('/products/:id', 'ProductsController.destroy')

    Route.post('/categories', 'CategoriesController.store')
    Route.put('/categories/:id', 'CategoriesController.update')
    Route.delete('/categories/:id', 'CategoriesController.delete')

    Route.get('/settings/:key?', 'SettingsController.index')
    Route.post('/settings', 'SettingsController.store')
    Route.put('/settings', 'SettingsController.update')
    Route.delete('/settings/:key', 'SettingsController.delete')

    Route.get('/customers/:id?', 'CustomersController.index')
    Route.put('/customers/:id', 'CustomersController.update')
    Route.delete('/customers/:id', 'CustomersController.delete')
  }).middleware('auth')
}).prefix('api/v1')
