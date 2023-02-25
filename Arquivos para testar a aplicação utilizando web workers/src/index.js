import { Controller } from './controller.js'
import { View } from './view.js'
import { Service } from './service.js'

// worker modules funcionam apenas em navegadores que suportam módulos
// Ou seja worker funciona, mas import/export não
const worker = new Worker('./src/worker.js', {
  type: 'module'
})

// worker.postMessage('Hello from worker thread')

// Aqui eu passo as deps do controller, inicializo a controller e retorno ela
Controller.init({ worker, view: new View() })
