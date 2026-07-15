# 🏗️ Operações do estaleiro

![Versão](https://img.shields.io/badge/version-2.0.0-f97316?style=for-the-badge)
![Status](https://img.shields.io/badge/concluido-0b2c4d?style=for-the-badge)

**🔗 Aplicação Online:** [https://operacoes-estaleiro.vercel.app/]<br>
**Link Make** [https://us2.make.com/public/shared-scenario/J7BbuXUVbDo/projeto]
---

## 📌 Visão Geral

O **Projeto Operaçoes do estaleiro** é a evolução do sistema de gestão de controle de estoque do estaleiro 

## 🧠 Motor de Decisão (Regras de Negócio - Desafio 1)

1. O operador envia pdf/imagem e email de destinatario via frontend
2. A IA processa o pedido(criando e comparando tabelas)
3. A IA envia email com uma tabela de dados.
---

## ⚙️ Arquitetura Técnica

### Fluxo de Dados

```mermaid
graph TD
    A[GATILHO: Chegada do pdf] --> B(Frontend: Next.js/Shadcn)
    B -->|Webhook| C(Make.com: Webhook Gateway)
    C -->|Consulta| D(Google Sheets: Estado da Matriz)
    D -->|Payload| E(Motor IA: Gemini Pro 1.5)
    E -->|Decisão JSON| F{Make: Roteador Lógico}
    F -->|Caminho A: Sucesso| G[Envia Email]

```

## 🛠️ Tecnologias Utilizadas

- **Frontend:** Next.js, TypeScript, Tailwind CSS, Shadcn/UI, Lucide React.
- **Backend/Orquestração:** Make.com (Low-Code/No-Code Integration).
- **IA Cognitiva:** Google Gemini API (Prompt Engineering focado em roteirização logística).
- **Database:** Google Sheets (Matriz de estados).

---

## 🚀 Como Executar Localmente

### Pré-requisitos

- Node.js (v18+)
- NPM ou PNPM
- Conta ativa no Make.com e Google Cloud (para API do Gemini)

### Passos de Instalação

1. **Clone o repositório:**

```bash
git clone https://github.com/joaosilvateixeira33/shipyard-sync-flow

```

1. **Instale as dependências:**

```bash
npm install

```

ou

```bash
pnpm install
```

1. **Configure as variáveis de ambiente:**
   Crie um `.env.local` na raiz com o link do seu Webhook do Make.com.
2. **Inicie o servidor:**

```bash
npm run dev

```

ou

```bash
pnpm dev
```
---

## 📝 Documentação da Automação (Backend)

O arquivo `backend/blueprint-roteirizador.json` contém a arquitetura lógica do Make.com.

- **Ajustes necessários:** Importe este JSON no seu cenário do Make.com para replicar a lógica de busca do Google Sheets e a chamada à API do Gemini.
- **Customização:** A lógica da regra de 40% e o isolamento de cargas IMO está encapsulada no módulo `Generate a Response` (Gemini) do cenário.

-

## 🎓 Créditos e Contexto

Projeto desenvolvido como parte do desafio técnico da **KODIE Academy** em parceria com a **Wilson Sons**.

- **Versão:** 2.0.0
- **Status:** Projeto concluido.

---

## 👨‍💻 Desenvolvido por

<a href="https://www.linkedin.com/in/eduardogomes377">
  <img src="https://github.com/joaosilvateixeira33.png" width="120px;" alt="Foto de Eduardo Gomes Andrade" style="border-radius: 50%;"/>
</a>
<br />
<strong>João Marcos Silva</strong>
<br />
<em>Full Stack Developer</em>
<br /><br />
<a href="https://www.linkedin.com/in/jo%C3%A3o-silva-fullstack/">
  <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
</a>
