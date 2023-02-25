# Performance e multithreading em navegadores + ECMAScript Modules em Web Workers

## Link dos databases:

- [Salt Lake City Crime Reports](https://www.kaggle.com/datasets/foenix/slc-crime?resource=download)

## O que são WebWorkers API:

Um web worker, conforme definido pelo World Wide Web Consortium e o Web Hypertext Application Technology Working Group, é um script JavaScript executado a partir de uma página HTML que é executada em segundo plano, independentemente de scripts que também possam ter sido executados a partir da mesma página HTML. Web Workers são mecanismos que permitem que uma operação de um dado script seja executado em uma thread diferente da thread principal da aplicação Web. Permitindo que cálculos laboriosos sejam processados sem que ocorra bloqueio da thread principal (geralmente associado à interface). Atualmente o navegador que suporta é somente o Chrome.

- [Web Workers API](https://developer.mozilla.org/pt-BR/docs/Web/API/Web_Workers_API)

## Como que o projeto foi feito

Utilizamos dois padrões de arquitetura MVC e a camada services do lado do cliente. View, Controller e Service para organizar o projeto, separando as responsabilidades.

- Model-> é aonde fica toda a informação, no caso do projeto é o arquivo que contem os dados em assets.
- View-> nesse caso manipula o HTML, colocando e manipulando as info para a interface. Somente ele vai importar modulo, somente ele vai ler elemento etc. Caso fosse no back-end a view seria a propria UI(react, html etc). 
- Controller-> Meio de campo, que liga a interface com o service. Recebendo a req e Retornando os dados tratados do service para a interface. O pai de todos, o orquestrador. Por exemplo: Recebe uma msg do worker, terminou de processar e precisa enviar pra view, o worker não sabe quem é a view, mas o controller sabe, então por isso que ele fica no meio, passando objeto pra um lado e pro outro. Ele faz a regra de validação e não a de negocio. De para quem
- Service-> é a onde fica toda a regra de negocio.
- Worker-> tudo que for executar em segundo plano, usar muita CPU e travar a tela.
- Index-> o index nada mais o cara que vai cuidar de tudo, ele é quem vai centralizar os demais e ser chamado pelo HTML.

## Do que o projeto aborda:

Ele aborda o poder de ler(contagem de linhas por description, quanto pesa o arquivo etc) arquivos grandes do lado do cliente, usando somente o navegador e o processamento do próprio cliente. Usando o ECMAScript Modules em Web Workers API, que é uma API nativa do JS ou melhor dizendo web API, para poder ler arquivos grandes e não travar o navegador do cliente, sem o uso do back-end. Ou seja, usando multithreading em segundo plano em navegadores para poder ler arquivos gigantescos somente do lado do front. Poderia fazer isso do lado do back-end usando o worker_threads e se isso fosse uma aplicação online a onde não sabemos a quantidades de pessoas que irão utilizar essa aplicação e ate mesmo o peso dos arquivos, a quantidade de linhas contida nele, poderia acarretar o servidor, sobrecarregando ele, compensando rodar do lado do cliente, mesmo que ele não tenha tantos recursos de hardware. Com isso, mantemos a aplicação no ar sem nenhum problema e não precisamos escalonar o servidor futuramente.

E a pesquisa que iremos fazer é sobre os crimes que ocorreram na cidade de Salt Lake City, Utah, Estados Unidos, através do call description dentro do database em archive ou database-small.

Todo o projeto foi feito com JS vanilla + HTLM + CSS + ECMAScript Modules em Web Workers API. Utilizando MVC e a camada services design patterns do lado do cliente.

## Para testar a aplicação:

``npm start``

Depois extraia o archive.zip ou usar o database small no navegador

Em choose file, selecione o arquivo que você quer pesquisar, depois teste com worker threads e sem worker threads e veja a diferença de performance.

## Sub tecnologias usadas:

Browser-sync: para poder rodar o projeto no navegador e atualizar automaticamente. Especificamente na versão @2.27.11

## Referencia

- [Erick Wendel](https://www.youtube.com/watch?v=-wXPxJYhZeI)
- [workers](https://caniuse.com/?search=workers)
