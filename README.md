# Mini Task Manager

## Objetivo

Construir uma aplicação full stack simples para que pequenos times possam organizar tarefas  e acompanhar o status das demandas.

## Stack

### Back-end
- Java 21
- Spring Boot
- Spring Web
- Spring Security
- Spring Data JPA / Hibernate
- Flyway
- PostgreSQL
- JWT

### Front-end
- React
- TypeScript
- Vite

### Infraestrutura
- Docker

## Arquitetura

O back-end será desenvolvido como um **monólito modular**, mantendo os principais domínios da aplicação separados internamente.

Essa abordagem foi escolhida por ser proporcional ao escopo atual do projeto, evitando a complexidade operacional de uma arquitetura distribuída sem necessidade real.

A separação entre os módulos também facilita uma possível evolução futura para microsserviços. Caso algum domínio passe a exigir escalabilidade, implantação ou evolução independente, ele poderá ser extraído gradualmente sem que seja necessário introduzir essa complexidade desde o início.

Os principais módulos previstos são:

- Autenticação
- Usuários
- Times
- Tarefas

## Entidades principais

### User

Representa um usuário da aplicação.

Principais dados:

- nome
- e-mail
- senha

### Team

Representa um time responsável por organizar seus membros e tarefas.

Principais dados:

- nome

### TeamMember

Representa a associação entre usuários e times, permitindo que um usuário participe de um ou mais times.

### Task

Representa uma tarefa pertencente a um time.

Principais dados:

- título
- descrição
- status
- prioridade
- responsável
- time
- data de criação
- prazo

## Regra de negócio principal

Uma tarefa só poderá ser marcada como concluída quando possuir um responsável atribuído.
