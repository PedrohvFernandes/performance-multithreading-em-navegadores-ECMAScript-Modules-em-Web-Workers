export class Controller {
  // Atributos/metodos privados da classe, tipo o private do TS ou do proprio Java, delegando que esse atributo/metodo só pode ser acessado dentro da classe
  #worker
  #view
  #service
  #events = {
    alive: () => {},
    progress: ({ total }) => {
      this.#view.updateProgress(total)
      // console.log('progress')
    },
    ocurrenceUpdate: ({ found, linesLength, elapsed }) => {
      const [[key, value]] = Object.entries(found)
      this.#view.updateDebugLog(
        `Found ${key}: ${value} ocurrencies - over ${linesLength} lines - time: ${elapsed}`
      )
    }
  }
  // Padrão utilizado - recebendo as dependências por parâmetro na controller
  constructor({ worker, view, service }) {
    // this.#worker = worker
    // 8º
    this.#worker = this.#configureWorker(worker)
    this.#view = view
    this.#service = service
  }

  // Sempre um metodo static init para iniciar a controller, recebendo as dependências
  static init(deps) {
    const controller = new Controller(deps)
    // A onde inicializo a controller. Quando eu quiser iniciar a controller, eu chamo o metodo static init de outro lugar e quando chamar o metodo static init, eu chamo o metodo init da controller
    controller.init()

    // So retorno o controller caso alguem queira usar
    return controller
  }

  // Metodo que inicializa o controller
  init() {
    // 1 º Função intermediaria que recebe o file da view
    // Fazendo a amarração da nossa view com o nosso configureOnFileChange
    // Aqui eu chamo o metodo privado configureOnFileChange e passo uma função para ele
    // bind(this) - faz com que o this da função seja o this da classe. Caso precise usar variavel this dentro da função configureOnFileChange dessa classe, é necessário usar o bind, para referir a essa classe
    this.#view.configureOnFileChange(this.#configureOnFileChange.bind(this))

    // 4º Pegando o submit do form
    this.#view.configureOnSubmit(this.#configureOnSubmit.bind(this))
  }

  // 8º Aqui a gente configura o worker para receber as mensagens
  #configureWorker(worker) {
    worker.onmessage = ({ data }) => {
      // 10º com os eventos definidos tanto aqui quanto no worker.js, vai funcionar assim: Apos enviar a mensagem no 9º o worker recebe a msg, posteriormente passando para o services, ou seja o file e a query para ele tratar, e no mesmo tempo que ele passa para a camada service fazer a regra de negocio, ele ja esta me enviando o evento usado junto com outros dados pelo postMessage para executar aqui na controller,  e de acordo com esse evento que eu recebi la do worker dentro do objeto eventType, eu executo a função que eu defini no #events, que por sua vez tem como objetivo por exemplo mexer na view. Lembrando que o dado pode ser recebido desestruturado ou não.
      this.#events[data.eventType](data)
    }
    return worker
  }

  // 3º Para formatar os bytes para o HTML
  #formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']

    let i = 0

    // 1024 bytes = 1 KB
    // Enquanto bytes for maior ou igual a 1024 e i for menor que 4, incrementa o i
    // Por exemplo: bytes = 4132 = 4.03 KB --> bytes/1024 = 4,0390625.toFixed(2) = 4.03. Então i = 1
    // com isso, bytes é menor que 4.03 e i é menor que 4. Mas por conta que o bytes é menor a loop para
    for (i; bytes >= 1024 && i < 4; i++) {
      bytes /= 1024
    }

    // toFixed(2) - arredonda para 2 casas decimais
    // Retorna o bytes arredondado para 2 casas decimais e a unidade de medida
    return `${bytes.toFixed(2)} ${units[i]}`
  }

  // Metodo privado
  // configurar na mudança de arquivo
  // 1 º Função intermediaria que recebe o file da view
  #configureOnFileChange(file) {
    // 2º e 3º Apos receber o file aqui, temos que mandar pra view, para atualizar o html
    // Enviamos o size formatado do arquivo para a view
    // console.log(file.size)
    this.#view.setFileSize(this.#formatBytes(file.size))
  }

  // 4º Pegando o submit do form
  #configureOnSubmit({ file, description }) {
    // 5º caso não exista o arquivo e a descrição, retorna um alerta
    if (!file && !description) {
      this.#view.updateError(`You must provide a file and a description`)
      return
    }
    if (!file) {
      this.#view.updateError(`You must provide a file`)
      return
    }
    if (!description.trim()) {
      this.#view.updateError(`You must provide a description`)
      return
    }

    // 6º Esquema de query para fazer a busca no banco de dados. Poderia colocar essa query no html para dinamico e buscar por onde a gente quiser, sem ser apenas por description. A RegExp é para fazer a busca por expressão regular, nesse caso, a description que nos recebermos pode ser case insensitive, ou seja não importa se é maiusculo ou minusculo
    const query = {}
    query['call description'] = new RegExp(description, 'i')

    // 7º caso o worker esteja marcado, fazemos a busca no worker
    if (this.#view.isWorkerChecked()) {
      console.log('executing on worker thread!')
      // 9º Aqui eu mando a mensagem pro worker. Passando somente o file e a description. Mas não é o file em si e sim a referencia pra a gente poder ler esse arquivo sobre demanda
      this.#worker.postMessage({ file, query })
      return
    }
    // 11º caso não esteja marcado, fazemos a busca no main thread
    // Aqui no caso é a mesma coisa que o worker.js só que no main thread. obs: vai travar a tela
    console.log('executing on main thread!')
    this.#service.processFile({
      file,
      query,
      onOcurrenceUpdate: (...args) => {
        this.#events.ocurrenceUpdate(...args)
      },
      onProgress: total => {
        this.#events.progress({ total })
      }
    })
  }
}
