# Agents Project — Contexto do Projeto

## Objetivo
Criar agentes de IA para cuidar e evoluir um web app. Este repositório (`agents`) é um espaço seguro/sandbox onde os agentes podem agir livremente sem risco para o app principal.

## Repositórios
- **agents (este repo):** `https://github.com/Mccoala/agents` — sandbox dos agentes
- **web app principal:** repositório separado (app que os agentes vão cuidar)

## Visão do Projeto
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

## Agentes Confirmados
- **Especialista em UI/Frontend**
- **Especialista em Backend**
- (outros a definir)

## Stack / Decisões Técnicas
- Frontend 3D: Three.js ou React Three Fiber
- Backend dos agentes: Node.js + Claude API (Anthropic)
- Comunicação entre agentes: mensagens visíveis no ambiente 3D

## Observações
- Projeto de médio/longo prazo
- Performance 3D no browser exige otimização cuidadosa
- Backend necessário para a parte de IA dos agentes
