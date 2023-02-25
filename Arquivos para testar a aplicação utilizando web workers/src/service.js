// A service é a nossa regra de negocio, ela vai gerenciar, se o worker ta fora do ar, se estiver fora do ar, ela vai processar normalmente, diretamente na service, diretamente na main thread, mas se estiver no ar, ela vai processar no worker thread com processos em segundo plano
export class Service {
  // O query é o description, o file que é pra processar e o onProgress que é uma função que vai ser executada a cada progresso, e o onOcurrenceUpdate que é uma função que vai ser executada a cada ocorrência. O service é importado no worker.js, porque é la que ela recebe os dados via postMessage da camada controller e posteriormente é devolvido para a controller com o postMessage
  processFile({ file, query, onOcurrenceUpdate, onProgress }) {
    // console.log({
    //   file,
    //   query
    // })
    const linesLength = { counter: 0 }
    const progressFn = this.#setupProgress(file.size, onProgress)
    // Performace.now() é uma função que retorna o tempo em milisegundos desde que iniciou
    const startedAt = performance.now()
    // Aqui ele pega a hora de agora - com a hora que ele começou a executar o processamento
    const elapsed = () =>
      `${((performance.now() - startedAt) / 1000).toFixed(2)} seconds`

    const onUpdate = () => {
      return found => {
        // Devolvemos o found, o elapsed e o linesLength para o controller
        onOcurrenceUpdate({
          found,
          elapsed: elapsed(),
          linesLength: linesLength.counter
        })
      }
    }

    // O stream le os arquivos usando, no navegador são chamadas de web-stream. pipeThrough(new TextDecoderStream()) é uma função que transforma o arquivo de binario pra texto e o pipeTo pra falar qual que é o final dele
    file
      .stream()
      .pipeThrough(new TextDecoderStream())
      // Se eu quiser trabalhar mais no dados posso usar sempre o pipeThrough
      .pipeThrough(this.#csvToJson({ linesLength, progressFn }))
      // pepeTo é sempre a ultima etapa
      // onOcurrenceUpdate: onUpdate() --> É uma função que vai ser executada a cada ocorrência. Ela retorna uma função que precisa receber um parametro, que é o found, que é o numero de ocorrências
      .pipeTo(this.#findOcurrencies({ query, onOcurrenceUpdate: onUpdate() }))
    // WritableStream é para escrever no arquivo, printar na tela etc
    // .pipeTo(
    //   new WritableStream({
    //     // O write é uma função que vai ser executada a cada linha do arquivo
    //     // Chunk nas nomenclaturas do stream é uma linha do arquivo, ou pedaços do arquivo. So com isso quebramos o mito que de não é possivel ler arquivos no navegador
    //     write(chunk) {
    //       // console.log('chunk', chunk)
    //     }
    //   })
    // )

    // onProgress(30)
    // setTimeout(() => {
    //   onProgress(60)
    //   setTimeout(() => {
    //     onProgress(100)
    //   }, 200)
    // }, 200)
  }

  // Aqui a gente trata(tira espaços em brancos e linhas vazias) e conta as linhas que tem no arquivo. E transforma o arquivo em um objeto JSON, que posteriormente vai ser usado para fazer a pesquisa
  #csvToJson({ linesLength, progressFn }) {
    let columns = []
    // Essa api é para ler arquivos/dados sobre demanda no navegador, nesse caso linha por linha, gerando um objeto enorme e posteriormente enfileirandos os objetos contidos dentro desse objeto
    return new TransformStream({
      transform(chunk, controller) {
        // Como o progressFn retorna uma função que tem uma parametro, então passamos o tamanho do chunk para ela e a cada chunk que ele ler, ele vai somando o tamanho do chunk com o total de bytes que ele ja leu e vai tendo o progresso
        progressFn(chunk.length)
        // Aqui estou quebrando o chunk em linhas, ou seja, cada linha do arquivo é um chunk, pode ser vazia ou conter algo dentro
        const lines = chunk.split('\n')
        // Vai contar quantas linhas tem no arquivo e vai somando com o counter
        linesLength.counter += lines.length
        // Na primeira vez que ele ler o arquivo, columns vai estar vazio, ou seja ele vai ler o header, que é a primeira linha do arquivo
        if (!columns.length) {
          // Estou removendo a primeira linha do arquivo(objeto em memoria), que é o header e isso não é uma boa prática, mas é só para o exemplo
          const firstLine = lines.shift()
          // Columns é o cara que contem os itens da primeira linha do arquivo. Removemos a primeira linha do arquivo, e agora ela é um array com os itens da primeira linha do arquivo
          columns = firstLine.split(',')
          // Estou removendo a primeira linha da contagem de linhas
          linesLength.counter--
        }

        // Vai caminhar em cada linha do arquivo, fazendo com que o chunk retorne um objeto JSON. E cada chunk é uma linha do arquivo, e o header que foi deletado, ele vira um objeto JSON com as chaves e valores pra cada linha do arquivo. Se tiver 20 linhas no arquivo, vai ter 20 objetos JSON
        for (const line of lines) {
          // Se a linha estiver vazia, ele vai pular para a proxima linha
          if (!line.length) continue
          let currentItem = {}
          // Aqui estou quebrando a linha em itens, ou seja, cada item da linha é um item do array
          const currentColumnsItems = line.split(',')
          // Isso tudo porque removemos a primeira linha do arquivo
          for (const columnIndex in currentColumnsItems) {
            // Aqui estou pegando o item da linha que estou lendo no momento
            const columnItem = currentColumnsItems[columnIndex]
            // trimEnd() --> Estou removendo os espaços em branco do final da string
            // Aqui estou falando que a chave de tal item por exemplo da posição 0 vai ser a mesma chave do cara que estiver na primeira posição do header ou seja na primeira linha do arquivo
            currentItem[columns[columnIndex]] = columnItem.trimEnd()
          }
          // enfileirar o objeto JSON para ser processado em demanda
          controller.enqueue(currentItem)
        }
      }
    })
  }

  // Aqui a gente pesquisa de acordo com a nossa query. Toda vez que achar o item na minha pesquisa ele ja vai retornar o objeto JSON
  #findOcurrencies({ query, onOcurrenceUpdate }) {
    // Estou rodando em todas chaves que estão vindo query, porque posteriormente a pessoa aqui pode implementar uma interface e nela ela pode digitar mais de uma query, e aí eu vou ter que rodar em todas as chaves que ela digitar
    const queryKeys = Object.keys(query)
    // Aqui eu estou criando um objeto vazio, que vai ser usado para verificar se o item que eu estou procurando já foi encontrado
    let found = {}
    return new WritableStream({
      write(jsonLine) {
        for (const keyIndex in queryKeys) {
          // Pegamos a chave que a pessoa digitou. e aqui é a call description
          const key = queryKeys[keyIndex]
          // Pegamos o valor(description) que a pessoa digitou. no nosso caso é a regex la na controller configureOnSubmit
          const queryValue = query[key]
          // Com a description que a pessoa digitou, eu vou verificar quantas existem no arquivo
          found[queryValue] = found[queryValue] ?? 0
          // Como é uma regex, os test retorna pra gente com true o false
          // E vamos testar no jsonLine que é objeto na posição key que é a description. ou seja, ele vai pesquisar no arquivo por cada linha do json grande jsonLine[description]
          // Se ele achar ele vai somar 1 no found[description]
          if (queryValue.test(jsonLine[key])) {
            found[queryValue]++
            onOcurrenceUpdate(found)
          }
        }
      },
      close: () => onOcurrenceUpdate(found)
    })
  }

  #setupProgress(totalBytes, onProgress) {
    // Ver a quantidade de bytes que ja processou  do arquivo
    let totalUploaded = 0
    onProgress(0)

    // O onProgress é uma função que vai ser executada a cada progresso, no fim ele retorna uma função que vai ser executada a cada progresso no csvToJson
    return chunkLength => {
      totalUploaded += chunkLength
      const total = (100 / totalBytes) * totalUploaded
      onProgress(total)
    }
  }
}
