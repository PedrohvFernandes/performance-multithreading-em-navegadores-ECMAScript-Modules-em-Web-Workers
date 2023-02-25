export class View {
  // Quando acontecer algo no csv file quero atualizar o file size
  #csvFile = document.querySelector('#csv-file')
  #fileSize = document.querySelector('#file-size')

  // Pegando o form para fazer o submit
  #form = document.querySelector('#form')

  #debug = document.querySelector('#debug')
  #progress = document.querySelector('#progress')
  #worker = document.querySelector('#worker')

  // 2º recebe o arquivo com dado tratado, no caso o size do controller do arquivo e atualiza o html
  setFileSize(size) {
    this.#fileSize.innerText = `File size ${size}\n`
  }

  // Vamos receber uma função da controller e executar aqui
  // Aqui nos não temos regra nenhuma aqui, somente delegando os eventos de um lado para o outro. E a controller é somente o intermediário
  configureOnFileChange(fn) {
    this.#csvFile.addEventListener('change', e => {
      // 1º INTERMEDIARIO para passar o file para a controller quando der um change no input de colocar um arquivo. Posição 0 porque é somente um arquivo dentro do objeto FileList
      fn(e.target.files[0])
    })
  }

  // 3º Pegando o submit do form
  configureOnSubmit(fn) {
    this.#form.reset()
    this.#form.addEventListener('submit', e => {
      e.preventDefault()
      // Pegando o arquivo que foi selecionado
      const file = this.#csvFile.files[0]
      // Não deveria colocar essa regra aqui, deveria estar na controller
      // if(!file) return alert('You must select a file')

      // 4º Atualizando o debug
      this.updateDebugLog('')

      // 5º pegando os dados do form e passando para a controller, description e o files apos dar um submit, la ele faz a validação, caso não exista os dados, retorna um alerta
      const form = new FormData(e.currentTarget)
      const description = form.get('description')
      fn({ file, description })
    })
  }

  // 5º dando alert caso não exista o arquivo
  updateError(message) {
    return alert(message)
  }

  // 6º Atualizando ou limpando o debug
  updateDebugLog(text, reset = true) {
    if (reset) {
      this.#debug.innerText = text
      return
    }

    this.#debug.innerText += text
  }

  // 7º Atualizando o progresso
  updateProgress(value) {
    this.#progress.value = value
  }

  // 8º verifica se o checked está marcado
  isWorkerChecked() {
    return this.#worker.checked
  }	
}
