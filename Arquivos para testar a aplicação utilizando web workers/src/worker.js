import { Service } from './service.js'
console.log(`I'm a worker!`)
const service = new Service()

// Envia uma mensagem para o worker thread. Enviar uma mensagem quem invocou ele
// postMessage('Hello from worker')

// No momento que ele inicializa, ele envia uma mensagem alive, estou pronto pra ser usado e se quiser pode usar valor para o que quiser
postMessage({ eventType: 'alive' })

// Recebe uma mensagem do worker thread, ele aguarda uma mensagem e processa elas quando chega em segundo plano. Apos processar, ele envia as outras demais mensagens
onmessage = ({ data }) => {
  // Quando ele recebe a mensagem, meio que o worker fala que realmente o cliente esta tentando processar algo
  const { file, query } = data
  service.processFile({
    file,
    query,
    // Toda vez que encontrar uma nova pesquisa, mandar uma mensagem que bate na nossa controller
    // Passamos todos os args da service para a controller
    onOcurrenceUpdate: args => {
      postMessage({ eventType: 'ocurrenceUpdate', ...args })
    },
    // Toda vez que tiver um progresso, mandar uma mensagem que bate na nossa controller
    // Passamos somente o total da service para a controller
    onProgress: total => {
      // Quando conseguimos ler pelo menos 10% do arquivo, a gente emite o evento progress etc
      postMessage({ eventType: 'progress', total })
    }
  })

  // console.log('Ola sou o worker, mensagem recebida do worker thread: ', data)
}
