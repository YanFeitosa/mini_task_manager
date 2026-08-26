# Mini Task Manager

Aplicação full stack para organizar tarefas em equipes pequenas. Inclui autenticação, times, responsáveis, filtros e checklists, com as regras de negócio validadas pela API.

## Recursos

- autenticação com JWT e acesso restrito aos times do usuário;
- criação, edição, exclusão e visualização de tarefas;
- filtros, paginação, prioridades, responsáveis e prazos;
- checklist opcional, progresso calculado e regras de conclusão;
- interface responsiva e dados de demonstração para uso local.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Back-end | Java 21, Spring Boot, Spring Security, JPA e Flyway |
| Front-end | React 19, TypeScript e Vite |
| Banco e infraestrutura | PostgreSQL 17, Docker Compose e Nginx |

## Início rápido

Com o Docker Desktop em execução, rode na raiz do projeto:

```bash
docker compose up --build
```

- aplicação: http://localhost:5173
- API: http://localhost:8080
- health check: http://localhost:8080/actuator/health

Para entrar, use `ana@taskmanager.local` e a senha `demo1234`. Também existem usuários demonstrativos para `bruno`, `carla` e `diego` no domínio `@taskmanager.local`, todos com a mesma senha.

Encerre os serviços com `docker compose down`. Para apagar também os dados locais, use `docker compose down -v`.

## Desenvolvimento local

Requisitos: Java 21, Node.js 22 e Docker Desktop.

Inicie o banco e o back-end:

```bash
docker compose up -d postgres
cd backend
cp .env.example .env
./mvnw spring-boot:run
```

Em outro terminal, inicie o front-end:

```bash
cd frontend
cp .env.example .env
npm ci
npm run dev
```

No Windows PowerShell, use `Copy-Item .env.example .env` e `.\mvnw.cmd` nos comandos equivalentes.

## Regras principais

- Usuários só acessam tarefas dos times dos quais participam.
- O responsável deve pertencer ao time da tarefa.
- Uma tarefa só pode ser concluída se tiver responsável e, quando houver checklist, todos os itens estiverem marcados.
- Apenas o responsável pode atualizar o checklist ou concluir a tarefa.

## Testes e qualidade

Com o PostgreSQL ativo, execute:

```bash
cd backend
./mvnw verify

cd ../frontend
npm run lint
npm run build
```

O mesmo fluxo é executado pelo GitHub Actions em pushes e pull requests para `main` e `develop`.
