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
  Route.post('/products', 'ProductsController.store').middleware('auth')
  Route.put('/products/:id', 'ProductsController.update').middleware('auth')
  Route.delete('/products/:id', 'ProductsController.destroy').middleware('auth')
}).prefix('api/v1')
