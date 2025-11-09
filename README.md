# User Service Microservice

Microsserviço de gerenciamento de usuários pronto para produção, implementando autenticação JWT, autorização OPA, mensageria NATS e persistência MongoDB seguindo Clean Architecture e padrões de Vertical Slice.

## 🚀 Características

- **Autenticação JWT**: Geração e validação de tokens JWT para autenticação de usuários
- **Autorização OPA**: Integração com Open Policy Agent para controle de acesso baseado em políticas
- **Mensageria NATS**: Publicação de eventos de domínio (user.created, user.updated)
- **Persistência MongoDB**: Armazenamento de dados com índices otimizados
- **Clean Architecture**: Separação clara entre domínio, aplicação e infraestrutura
- **Vertical Slice**: Organização por features/funcionalidades
- **Métricas Prometheus**: Monitoramento e observabilidade
- **Logs Estruturados**: Logging em JSON com mascaramento de dados sensíveis
- **Docker Ready**: Containerização com multi-stage build e health checks
- **Azure App Service**: Pronto para deploy em Azure Container Apps

## 📋 Pré-requisitos

- Node.js >= 18.0.0
- MongoDB >= 5.0
- NATS Server (opcional, para eventos)
- OPA (opcional, para autorização)

## 🛠️ Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd user-service-microservice

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Inicie o serviço
npm start
```

## 🔧 Configuração

### Variáveis de Ambiente

#### Servidor
- `PORT`: Porta do servidor (padrão: 3011)
- `NODE_ENV`: Ambiente de execução (development, production)
- `API_VERSION`: Versão da API (padrão: v1)
- `LOG_LEVEL`: Nível de log (error, warn, info, debug)

#### MongoDB
- `USERS_MONGO_URI`: URI de conexão do MongoDB
- `USERS_MONGO_DB_NAME`: Nome do banco de dados (padrão: users_db)

#### NATS
- `NATS_URL`: URL do servidor NATS
- `NATS_QUEUE_GROUP`: Grupo de fila (padrão: user-service)
- `NATS_JETSTREAM_ENABLED`: Habilitar JetStream (true/false)
- `NATS_SUBJECTS`: Subjects para publicação de eventos

#### JWT
- `AUTH_JWT_ISSUER`: Emissor do token JWT
- `AUTH_JWT_AUDIENCE`: Audiência do token JWT
- `AUTH_JWT_EXPIRES_IN`: Tempo de expiração do token (ex: 1h, 24h)
- `AUTH_JWT_SECRET`: Chave secreta para desenvolvimento
- `AUTH_JWKS_URI`: URI do JWKS para produção
- `AUTH_JWT_REQUIRED`: Requer JWT em rotas protegidas (true/false)

#### OPA
- `OPA_URL`: URL do servidor OPA
- `OPA_POLICY_PATH`: Caminho da política OPA
- `OPA_TIMEOUT_MS`: Timeout para consultas OPA
- `OPA_FAIL_OPEN`: Permitir acesso em caso de falha OPA (true/false)

#### Rate Limiting
- `RATE_LIMIT_WINDOW_MS`: Janela de tempo para rate limiting
- `RATE_LIMIT_MAX_REQUESTS`: Máximo de requisições por janela

#### Feature Flags
- `ENABLE_SWAGGER`: Habilitar documentação Swagger (true/false)
- `ENABLE_METRICS`: Habilitar endpoint de métricas (true/false)

#### CORS
- `CORS_ORIGIN`: Origens permitidas para CORS (* ou lista separada por vírgula)

## 📚 API Endpoints

### Endpoints Públicos

#### Registrar Usuário
```http
POST /api/v1/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "João",
  "lastName": "Silva",
  "roles": ["user"]
}
```

#### Login
```http
POST /api/v1/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### Endpoints Protegidos (Requerem JWT)

#### Obter Perfil do Usuário
```http
GET /api/v1/users/me
Authorization: Bearer <jwt-token>
```

#### Atualizar Perfil
```http
PUT /api/v1/users/me
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "firstName": "João",
  "lastName": "Santos"
}
```

#### Alterar Senha
```http
PUT /api/v1/users/me/password
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass456"
}
```

### Endpoints de Infraestrutura

#### Health Check
```http
GET /api/v1/health
```

#### Métricas Prometheus
```http
GET /api/v1/metrics
```

#### Documentação Swagger
```
GET /api-docs
```

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
src/
├── domain/                 # Camada de domínio
│   ├── entities/           # Entidades de domínio
│   │   ├── User.js
│   │   ├── UserProfile.js
│   │   └── Credentials.js
│   ├── value-objects/      # Objetos de valor
│   │   ├── Email.js
│   │   ├── PasswordHash.js
│   │   └── Role.js
│   ├── ports/              # Interfaces/Contratos
│   │   ├── IUserRepository.js
│   │   ├── IPasswordHasher.js
│   │   ├── IEventPublisher.js
│   │   └── IAuthPolicyClient.js
│   └── services/           # Serviços de domínio
│       └── UserDomainService.js
├── features/               # Features (Vertical Slice)
│   └── users/
│       ├── application/    # Casos de uso
│       │   └── usecases/
│       │       ├── RegisterUserUseCase.js
│       │       ├── LoginUserUseCase.js
│       │       ├── GetUserProfileUseCase.js
│       │       ├── UpdateUserProfileUseCase.js
│       │       └── ChangePasswordUseCase.js
│       └── http/           # Camada HTTP
│           ├── router.js
│           └── handlers/
│               ├── registerUserHandler.js
│               ├── loginHandler.js
│               ├── getProfileHandler.js
│               ├── updateProfileHandler.js
│               └── changePasswordHandler.js
├── infra/                  # Camada de infraestrutura
│   ├── db/
│   │   ├── mongoClient.js
│   │   ├── ensureIndexes.js
│   │   └── UserModel.js
│   ├── repositories/
│   │   └── MongoUserRepository.js
│   ├── crypto/
│   │   └── BcryptPasswordHasher.js
│   ├── messaging/
│   │   └── NatsEventPublisher.js
│   ├── opa/
│   │   └── HttpAuthPolicyClient.js
│   ├── auth/
│   │   ├── JwtIssuer.js
│   │   └── JwtVerifier.js
│   ├── metrics/
│   │   └── metricsRegistry.js
│   └── utils/
│       ├── logger.js
│       └── errorHandling.js
└── main/                   # Bootstrap da aplicação
    ├── container.js        # Injeção de dependências
    ├── app.js              # Configuração Express
    └── server.js           # Inicialização do servidor
```

### Princípios Arquiteturais

- **Clean Architecture**: Separação de responsabilidades em camadas
- **Dependency Inversion**: Dependências apontam para o domínio
- **Vertical Slice**: Organização por features completas
- **SOLID Principles**: Código manutenível e extensível

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar apenas testes unitários
npm run test:unit

# Executar testes com cobertura
npm run test:coverage

# Executar testes de arquitetura
npm run test:arch
```

## 🐳 Docker

### Build da Imagem

```bash
docker build -t user-service:latest .
```

### Executar Container

```bash
docker run -d \
  --name user-service \
  -p 3011:3011 \
  -e USERS_MONGO_URI=mongodb://mongo:27017 \
  -e USERS_MONGO_DB_NAME=users_db \
  -e NATS_URL=nats://nats:4222 \
  -e AUTH_JWT_SECRET=your-secret-key \
  user-service:latest
```

### Docker Compose (Exemplo)

```yaml
version: '3.8'
services:
  user-service:
    build: .
    ports:
      - "3011:3011"
    environment:
      - USERS_MONGO_URI=mongodb://mongo:27017
      - USERS_MONGO_DB_NAME=users_db
      - NATS_URL=nats://nats:4222
      - AUTH_JWT_SECRET=your-secret-key
    depends_on:
      - mongo
      - nats

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  nats:
    image: nats:latest
    ports:
      - "4222:4222"

volumes:
  mongo-data:
```

## ☁️ Deploy no Azure

### Azure App Service for Containers

1. **Build e Push da Imagem**

```bash
# Login no Azure Container Registry
az acr login --name <registry-name>

# Build e push
docker build -t <registry-name>.azurecr.io/user-service:latest .
docker push <registry-name>.azurecr.io/user-service:latest
```

2. **Criar App Service**

```bash
# Criar Web App
az webapp create \
  --resource-group <resource-group> \
  --plan <app-service-plan> \
  --name <app-name> \
  --deployment-container-image-name <registry-name>.azurecr.io/user-service:latest
```

3. **Configurar Variáveis de Ambiente**

```bash
az webapp config appsettings set \
  --resource-group <resource-group> \
  --name <app-name> \
  --settings \
    PORT=80 \
    USERS_MONGO_URI="<mongodb-connection-string>" \
    USERS_MONGO_DB_NAME="users_db" \
    NATS_URL="<nats-url>" \
    AUTH_JWT_SECRET="<jwt-secret>" \
    NODE_ENV="production"
```

4. **Configurar Health Check**

```bash
az webapp config set \
  --resource-group <resource-group> \
  --name <app-name> \
  --health-check-path "/api/v1/health"
```

## 📊 Métricas

O serviço expõe as seguintes métricas Prometheus:

- `users_registered_total`: Total de usuários registrados
- `user_login_attempts_total{result}`: Tentativas de login (success/failure)
- `profile_updates_total`: Total de atualizações de perfil
- `password_changes_total{result}`: Mudanças de senha (success/failure)
- `events_published_total{subject}`: Eventos publicados por subject
- `http_requests_total{method,path,status}`: Requisições HTTP
- `http_request_duration_ms{method,path,status}`: Duração das requisições

## 🔒 Segurança

- **Password Hashing**: Bcrypt com salt rounds configurável
- **JWT**: Tokens assinados e validados
- **Rate Limiting**: Proteção contra ataques de força bruta
- **Helmet**: Headers de segurança HTTP
- **CORS**: Configuração de origens permitidas
- **Input Validation**: Validação de dados de entrada
- **PII Masking**: Mascaramento de dados sensíveis nos logs

## 🔄 Eventos de Domínio

### user.created
Publicado quando um novo usuário é registrado.

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "roles": ["user"],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### user.updated
Publicado quando o perfil de um usuário é atualizado.

```json
{
  "userId": "uuid",
  "updates": {
    "firstName": "João",
    "lastName": "Santos"
  },
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 📝 Licença

MIT

## 👥 Contribuindo

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato com a equipe de desenvolvimento.