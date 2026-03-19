# Agents Project — Contexto do Projeto

## Objetivo
Criar agentes de IA para cuidar e evoluir um web app. Este repositório (`agents`) é um espaço seguro/sandbox onde os agentes podem agir livremente sem risco para o app principal.

## Repositórios
- **agents (este repo):** `https://github.com/Mccoala/agents` — sandbox dos agentes
- **web app principal:** `https://github.com/Mccoala/app-ags` — app que os agentes vão cuidar
- **site ao vivo:** `https://app-ags.netlify.app`

---

## Visão do Projeto — Ambiente 3D dos Agentes

Ambiente visual 3D onde cada agente é uma entidade no mundo:

### Visualização 3D
- Cidade/ambiente 3D com **Three.js** ou **React Three Fiber**
- Cada agente é um "prédio" ou entidade com estado visual (ativo, idle, processando)
- Câmera livre para navegar pelo ambiente

### Agentes com Funções
- Cada agente tem uma **role** (analista, executor, revisor, etc.)
- Comunicação entre eles via mensagens visíveis no ambiente
- Logs de atividade exibidos no mundo 3D

### Automação Visível
- Tarefas fluem entre agentes como "pacotes" ou partículas
- Progresso visível em tempo real
- Dashboard integrado mostrando o que cada agente está fazendo

### Stack / Decisões Técnicas
- Frontend 3D: Three.js ou React Three Fiber
- Backend dos agentes: Node.js + Claude API (Anthropic)
- Comunicação entre agentes: mensagens visíveis no ambiente 3D

### Observações
- Projeto de médio/longo prazo
- Performance 3D no browser exige otimização cuidadosa
- Backend necessário para a parte de IA dos agentes

---

## Agentes Planejados

| Agente | Função |
|---|---|
| **Frontend / UI Agent** | Melhora componentes, layout, responsividade, animações |
| **Backend Agent** | APIs, banco de dados, autenticação, performance server-side |
| **QA / Bug Hunter Agent** | Testes, detecção de regressões, relatórios de bugs |
| **Security Agent** | Vulnerabilidades, dependências, OWASP, isolamento multi-tenant |
| **Auth & Onboarding Agent** | Cadastro público, login, multi-tenant, convite por email |
| **Billing / Planos Agent** | Stripe, área de planos, limites por plano, assinaturas |
| **AI / PDF Pipeline Agent** | Melhora extração com Claude, valida dados antes de distribuir |
| **Analytics / Dashboard Agent** | Novas métricas, gráficos, filtros, exportação de relatórios |
| **Rotas / Mapa Agent** | Implementar mapa do Brasil com dados de pedidos |
| **DevOps / Deploy Agent** | CI/CD, monitoramento, alertas de build quebrado, backups |
| **Revisor Agent** | Revisa trabalho dos outros agentes antes de aplicar mudanças |
| **Analista / Monitor Agent** | Lê logs, métricas, detecta anomalias, reporta para os outros |

---

## Web App — app-ags (Análise Completa)

### Sobre o App
Sistema de gestão de produção de brinquedos infláveis para a empresa AGS Brinquedos.

**Fluxo principal:** usuário sobe PDF do pedido → IA (Claude Sonnet 4.6) extrai informações → distribui para todo o sistema.

### Módulos existentes
- **Produção** — pipeline de 4 etapas (corte → costura → prep → montagem)
- **Finalização**
- **Dashboard** — métricas de pedidos em produção, vendas, desempenho de funcionários
- **Rotas** — mapa do Brasil com quantidades e valores de pedidos *(não implementado ainda — ver bugs)*
- **Equipe** — usuários e funcionários
- **Clientes**

### Sistema de usuários
- Multi-usuário com logins individuais
- Funções e acessos por setor
- Admin tem acesso total

### Stack do app-ags
| Camada | Tecnologia |
|---|---|
| Framework | React 18.2.0 |
| Linguagem | JavaScript (JSX) — sem TypeScript no src |
| Build | Vite 5.1.6 |
| Banco de dados | Supabase (`@supabase/supabase-js`) |
| Storage primário | `localStorage` (key: `ags_v3`) com Supabase como sync/fallback |
| Serverless | Netlify Functions |
| Gráficos | Recharts 2.12.2 + D3 Scale |
| Mapas | react-simple-maps, react-map-gl, mapbox-gl *(instalados mas não implementados)* |
| Icons | Lucide React |
| AI | Anthropic Claude via Netlify Function proxy |
| CSS | Tailwind CSS 3.4.1 |
| Host | Netlify |

### Estrutura de arquivos
```
app-ags/
├── netlify/
│   └── functions/
│       └── anthropic.js     ← proxy da Claude API (Netlify Function)
├── src/
│   ├── lib/
│   │   └── supabase.js      ← cliente Supabase
│   ├── App.jsx              ← app INTEIRO (~2.800+ linhas, monolito)
│   ├── index.css
│   └── main.jsx
├── schema.sql               ← schema do Supabase
├── netlify.toml
└── package.json
```

> ⚠️ O app inteiro está em um único `App.jsx` de 2.800+ linhas. Precisa ser componentizado.

---

## Bugs Identificados no app-ags

### 🔴 Críticos (resolver primeiro)

1. **API key da Anthropic hardcoded** em `netlify/functions/anthropic.js` como fallback — exposta no repositório público. Qualquer pessoa pode usar a chave.
2. **Senhas em plaintext hardcoded** no `App.jsx` — credenciais padrão (`admin/ags`, `miriane/123`, `producao/123`) visíveis no GitHub.

### 🟠 Alto

3. **Data hardcoded** como `"2026-03-09"` na lógica de prazo — todos os cálculos de prazo estão errados.
4. **Auth apenas client-side** — permissões e roles são verificadas só no front-end, bypassáveis pelo console do browser.
5. **Módulo de Rotas/Mapa não existe** — as libs (`react-simple-maps`, `mapbox-gl`, `react-map-gl`) estão instaladas e importadas mas nunca foram implementadas como componente. O mapa precisa ser construído do zero.

### 🟡 Médio

6. **App.jsx monolítico** (2.800+ linhas) — dificulta manutenção, debugging e colaboração entre agentes.
7. **Imports mortos** das libs de mapa aumentando o bundle desnecessariamente.

### 🔵 Baixo

8. **`CI=false`** no `netlify.toml` suprime warnings de build, mascarando erros reais.
9. **`node-fetch`** nas dependências — desnecessário num app Vite/browser.
10. **Arquivos de backup commitados** (`*.zip`, `SITE_AGS_ATUALIZADO/`, `build_err.txt`).

---

## O que os Agentes vão fazer no app-ags (Roadmap)

| Prioridade | Agente | Tarefa |
|---|---|---|
| 1 | Security Agent | Remover API key e senhas expostas do código |
| 2 | Auth Agent | Substituir auth fake por Supabase Auth real |
| 3 | Backend Agent | Separar App.jsx monolítico em componentes/módulos |
| 4 | AI/PDF Agent | Melhorar extração + corrigir distribuição dos dados |
| 5 | Rotas Agent | Implementar mapa do Brasil do zero |
| 6 | Frontend Agent | Melhorar UI/UX geral |
| 7 | Billing Agent | Criar área de planos + Stripe |
| 8 | Auth Agent | Login/cadastro público + multi-tenant |

---

## O que ainda não sabemos sobre o app-ags

- Preferência de gateway de pagamento (Stripe, Hotmart, outro?)
- Quais outros bugs específicos o usuário quer priorizar além dos listados
- Requisitos de design/branding para a nova área de login pública
