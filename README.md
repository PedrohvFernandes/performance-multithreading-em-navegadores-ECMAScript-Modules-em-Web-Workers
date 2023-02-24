# Performance e multithreading em navegadores + ECMAScript Modules em Web Workers

## Link dos databases:

- [Salt Lake City Crime Reports](https://www.kaggle.com/datasets/foenix/slc-crime?resource=download)

## O que são WebWorkers API:

Um web worker, conforme definido pelo World Wide Web Consortium e o Web Hypertext Application Technology Working Group, é um script JavaScript executado a partir de uma página HTML que é executada em segundo plano, independentemente de scripts que também possam ter sido executados a partir da mesma página HTML. Web Workers são mecanismos que permitem que uma operação de um dado script seja executado em uma thread diferente da thread principal da aplicação Web. Permitindo que cálculos laboriosos sejam processados sem que ocorra bloqueio da thread principal (geralmente associado à interface). Atualmente o navegador que suporta é somente o Chrome.

- [Web Workers API](https://developer.mozilla.org/pt-BR/docs/Web/API/Web_Workers_API)

## Como que o projeto foi feito

Utilizamos dois padrões de arquitetura MVC e MSC do lado do cliente. View, Controller e Service para organizar o projeto, separando as responsabilidades.

- View-> nesse caso manipula o HTML, colocando e manipulando as info para a interface. Caso fosse no back-end a view seria a propria UI.
- Controller-> Meio de campo, que liga a interface com o service. Recebendo a req e Retornando os dados tratados do service para a interface.
- Service-> é a onde fica toda a regra de negocio.

## Para testar a aplicação:

``npm run start``

Depois extraia o archive.zip ou usar o database small no navegador