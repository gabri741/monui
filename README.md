# Monui 📅

> Sistema de Gerenciamento de Eventos com Notificações Automatizadas via WhatsApp

[![GitHub](https://img.shields.io/badge/GitHub-monui-blue?logo=github)](https://github.com/gabri741/monui)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

## 📖 Sobre o Projeto

**Monui** é uma aplicação web desenvolvida como Trabalho de Conclusão de Curso da Pós-Graduação em Desenvolvimento Full Stack, criada para solucionar um problema comum na vida moderna: o esquecimento de eventos importantes.

Na era digital, marcada por rotinas aceleradas e múltiplos compromissos, muitas pessoas encontram dificuldades para organizar e lembrar eventos como consultas médicas, aniversários, compromissos profissionais, reuniões escolares e celebrações especiais. O Monui surge como uma solução intuitiva e eficaz para esse desafio.

### 🎯 Problema Resolvido

A ausência de sistemas simples e personalizados faz com que eventos importantes sejam esquecidos. O Monui permite que usuários configurem lembretes para si mesmos e para outras pessoas, possibilitando o envio de convites com confirmação de presença via WhatsApp, garantindo que nada seja perdido.

---

## ✨ Funcionalidades

- 🔐 **Autenticação Segura**: Login padrão ou via OAuth do Google
- 📆 **Gestão de Eventos**: Cadastro de compromissos
- 💬 **Notificações WhatsApp**: Envio automatizado de lembretes personalizados
- ⏰ **Agendamento Inteligente**: Configure data e horário específicos para cada notificação
- 📊 **Dashboard Analytics**: Visualização de estatísticas sobre eventos e notificações
- 📅 **Visualização em Calendário**: Interface visual para acompanhar eventos programados
- 📈 **Histórico Completo**: Registro de eventos e notificações enviadas

## 🏗️ Arquitetura

O projeto utiliza uma **arquitetura de microsserviços**, garantindo escalabilidade, modularidade e facilidade de manutenção.

### Microsserviços


#### 🔹 Auth Service
Gerencia autenticação e autorização, incluindo login tradicional e OAuth do Google, com geração de tokens JWT.

#### 🔹 Usuários Service
Armazena e gerencia dados cadastrais do usuário

#### 🔹 Eventos Service
Núcleo da aplicação responsável por criar, editar e gerenciar eventos com suas informações completas (data, descrição, local, etc)

#### 🔹 Notificações Service
Integra com a API do WhatsApp (ULTRAMSG) para envio de mensagens.
Executa tarefas agendadas, verificando eventos próximos e acionando notificações automaticamente.

#### 🔹 API Gateway
Ponto de entrada único que roteia requisições, aplica políticas de segurança e controla o tráfego.

#### 🔹 Frontend
Interface web responsiva e intuitiva para interação com usuários.

---

## 🛠️ Stacks

### Backend
- **Node.js** - Runtime JavaScript
- **NestJS** - Framework progressivo para Node.js
- **TypeScript** - Superset JavaScript tipado

### Frontend
- **React** - Biblioteca para construção de interfaces
- **Next.js** - Framework React com SSR
- **TailwindCSS** - Framework CSS utilitário

### Banco de Dados
- **PostgreSQL** - Banco relacional

### Integração
- **ULTRAMSG** - API para integração com WhatsApp

### Testes
- **Jest** - Framework de testes JavaScript

### DevOps
- **Git** - Controle de versão
- **GitHub Actions** - CI/CD
- **Docker** - Containerização
---

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- PostgreSQL
- MongoDB
- Conta na Green-API (para integração WhatsApp)

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/gabri741/monui.git
cd monui
```

2. **Configure as variáveis de ambiente**
```bash
# Copie os arquivos de exemplo
cp .env.example .env

# Configure as credenciais necessárias:
# - Banco de dados (PostgreSQL e MongoDB)
# - Green-API (WhatsApp)
# - OAuth Google
# - JWT Secret
```

3. **Instale as dependências**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

4. **Execute com Docker**
```bash
# Na raiz do projeto
docker-compose up -d
```

5. **Acesse a aplicação**
- Frontend: `http://localhost:3005/login`
---

## 🧪 Testes

O projeto conta com uma cobertura completa de testes:

### Testes Unitários
```bash
npm run test
```

## 🔄 Jornada do Usuário

1. **Autenticação**: Login via email ou Google
2. **Cadastro de Evento**: Criar compromisso (ex: "Meu Casamento - 21/09/2025")
3. **Definição de Contatos**: Adicionar convidados com nome e telefone
4. **Agendamento**: Escolher data e horário de envio das notificações
5. **Envio Automático**: Sistema dispara mensagens no momento programado
6. **Acompanhamento**: Visualizar status de entrega e confirmações


## 🚀 CI/CD

Pipeline automatizado com GitHub Actions:

1. **Build**: Compilação e validação do código
2. **Test**: Execução de testes unitários e integração
3. **Docker**: Build e push de imagens
4. **Deploy**: Publicação automatizada em ambiente controlado

---

## 📚 Documentação da API

A documentação completa das APIs está disponível via Swagger:

```
- API Docs Notificação Service (Swagger): `http://localhost:3003/docs`
- API Docs Event Service (Swagger): `http://localhost:3002/docs`
- API Docs User Service (Swagger): `http://localhost:3001/docs`
```

## 👨‍💻 Autor

**Gabriel**

- GitHub: [@gabri741](https://github.com/gabri741)
- LinkedIn:(https://www.linkedin.com/in/gabriel-martins-1b9556244/)

---

## 📞 Contato

Para dúvidas, sugestões ou oportunidades:

- 📧 Email: [gabrielmartins.mca@gmail.com]
- 💼 LinkedIn:(https://www.linkedin.com/in/gabriel-martins-1b9556244/)
- 🐙 GitHub: [@gabri741](https://github.com/gabri741)


<div align="center">

**Desenvolvido  como Trabalho de Conclusão de Curso**

**Pós-Graduação em Desenvolvimento Full Stack**

⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!

</div>