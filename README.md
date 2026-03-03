# NO PONTO 3.0

Sistema Mobile de Gestão de Ponto com Geolocalização Inteligente.

## Estrutura do Projeto

O projeto é um monorepo (ou estrutura de pastas separadas) contendo:

- **backend/**: API NestJS com PostgreSQL.
- **mobile/**: App React Native (Expo) com TypeScript.

## Pré-requisitos

- Node.js (v18+)
- PostgreSQL (Local ou Docker)
- Expo Go (no celular) ou Emulador Android/iOS

## Configuração

### Backend

1. Navegue para a pasta `backend`:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o banco de dados no arquivo `.env` (crie se não existir, baseado no `.env.example` ou use os padrões):
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_DATABASE=no_ponto
   JWT_SECRET=super-secret-key
   ```
4. Inicie o servidor:
   ```bash
   npm run start:dev
   ```

### Mobile

1. Navegue para a pasta `mobile`:
   ```bash
   cd mobile
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o projeto Expo:
   ```bash
   npx expo start
   ```

## Funcionalidades (Em Desenvolvimento)

- [x] Estrutura do Projeto
- [x] Configuração do Backend (NestJS + TypeORM)
- [x] Configuração do Mobile (Expo Router)
- [ ] Autenticação (JWT)
- [ ] Registro de Ponto com Geolocalização
- [ ] Dashboard do Gestor
- [ ] Histórico e Ajustes

## Stack Tecnológica

- **Frontend**: React Native (Expo)
- **Backend**: NestJS
- **Banco de Dados**: PostgreSQL
