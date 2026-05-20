# AgendaFlow API — Referência de rotas

Base URL: `http://localhost:3000`

Rotas protegidas exigem o header:
`Authorization: Bearer <token>`

---

## Auth
| Método | Rota            | Auth | Descrição                        |
|--------|-----------------|------|----------------------------------|
| POST   | /auth/register  | —    | Cadastrar novo usuário           |
| POST   | /auth/login     | —    | Login, retorna token JWT         |
| GET    | /auth/me        | Sim  | Dados do usuário logado          |

**POST /auth/register**
```json
{ "name": "João", "email": "joao@email.com", "password": "Senha@123", "role": "client" }
```

**POST /auth/login**
```json
{ "email": "joao@email.com", "password": "Senha@123" }
```

---

## Users
| Método | Rota              | Auth | Descrição               |
|--------|-------------------|------|-------------------------|
| GET    | /users/profile    | Sim  | Ver perfil próprio      |
| PUT    | /users/profile    | Sim  | Atualizar nome/email    |
| PATCH  | /users/password   | Sim  | Trocar senha            |

---

## Establishments
| Método | Rota                        | Auth        | Descrição                    |
|--------|-----------------------------|-------------|------------------------------|
| GET    | /establishments             | —           | Listar todos (paginado)      |
| GET    | /establishments/:id         | —           | Buscar por ID                |
| GET    | /establishments/me/list     | owner/admin | Meus estabelecimentos        |
| POST   | /establishments             | owner/admin | Criar estabelecimento        |
| PUT    | /establishments/:id         | owner/admin | Atualizar                    |
| DELETE | /establishments/:id         | owner/admin | Remover                      |

**POST /establishments**
```json
{
  "name": "Barbearia do João",
  "slug": "barbearia-do-joao",
  "phone": "(54) 99999-1234",
  "address": "Rua das Flores, 100"
}
```

---

## Professionals
| Método | Rota                                        | Auth        | Descrição              |
|--------|---------------------------------------------|-------------|------------------------|
| GET    | /professionals/establishment/:id            | —           | Listar por estabelec.  |
| GET    | /professionals/:id                          | —           | Buscar por ID          |
| POST   | /professionals                              | owner/admin | Criar profissional     |
| PUT    | /professionals/:id                          | owner/admin | Atualizar              |
| DELETE | /professionals/:id                          | owner/admin | Remover                |

**POST /professionals**
```json
{ "establishment_id": 1, "name": "Carlos", "bio": "Especialista em barba." }
```

---

## Services
| Método | Rota                                   | Auth        | Descrição            |
|--------|----------------------------------------|-------------|----------------------|
| GET    | /services/establishment/:id            | —           | Listar por estabelec.|
| GET    | /services/:id                          | —           | Buscar por ID        |
| POST   | /services                              | owner/admin | Criar serviço        |
| PUT    | /services/:id                          | owner/admin | Atualizar            |
| DELETE | /services/:id                          | owner/admin | Remover              |

**POST /services**
```json
{ "establishment_id": 1, "name": "Corte masculino", "duration_min": 30, "price": 35.00 }
```

---

## Schedules
| Método | Rota                                                     | Auth        | Descrição              |
|--------|----------------------------------------------------------|-------------|------------------------|
| GET    | /schedules/professional/:professionalId                  | —           | Ver horários           |
| POST   | /schedules                                               | owner/admin | Criar/atualizar horário|
| DELETE | /schedules/professional/:professionalId/weekday/:weekday | owner/admin | Remover dia            |

**POST /schedules** (weekday: 0=Dom, 1=Seg ... 6=Sab)
```json
{ "professional_id": 1, "weekday": 1, "start_time": "08:00", "end_time": "18:00" }
```

---

## Appointments
| Método | Rota                                         | Auth        | Descrição                    |
|--------|----------------------------------------------|-------------|------------------------------|
| GET    | /appointments/availability                   | —           | Slots livres do profissional |
| POST   | /appointments                                | Sim         | Criar agendamento            |
| GET    | /appointments/me                             | Sim         | Meus agendamentos            |
| GET    | /appointments/:id                            | Sim         | Detalhe do agendamento       |
| PATCH  | /appointments/:id/status                     | Sim         | Mudar status                 |
| GET    | /appointments/professional/:professionalId   | owner/admin | Agenda do profissional       |

**GET /appointments/availability**
```
?professional_id=1&service_id=1&date=2025-06-10
```

**POST /appointments**
```json
{ "professional_id": 1, "service_id": 1, "starts_at": "2025-06-10T09:00:00", "notes": "Quero franja curta" }
```

**PATCH /appointments/:id/status**
```json
{ "status": "confirmed" }
```
Valores válidos: `confirmed`, `cancelled`, `completed`

---

## Admin (apenas role=admin)
| Método | Rota                                   | Descrição                      |
|--------|----------------------------------------|--------------------------------|
| GET    | /admin/stats                           | Totais gerais do sistema       |
| GET    | /admin/users                           | Listar usuários                |
| PATCH  | /admin/users/:id/activate              | Ativar usuário                 |
| PATCH  | /admin/users/:id/deactivate            | Desativar usuário              |
| GET    | /admin/establishments                  | Listar estabelecimentos        |
| PATCH  | /admin/establishments/:id/activate     | Ativar estabelecimento         |
| PATCH  | /admin/establishments/:id/deactivate   | Desativar estabelecimento      |

---

## Fluxo completo de uso (exemplo prático)

1. `POST /auth/register` — cadastrar dono (role: owner)
2. `POST /auth/login` — obter token
3. `POST /establishments` — criar a barbearia
4. `POST /professionals` — adicionar profissional
5. `POST /services` — cadastrar serviços
6. `POST /schedules` — definir horários (um por dia da semana)
7. `POST /auth/register` — cadastrar cliente (role: client)
8. `GET /appointments/availability?...` — ver slots disponíveis
9. `POST /appointments` — criar agendamento
10. `PATCH /appointments/:id/status` — confirmar ou concluir
