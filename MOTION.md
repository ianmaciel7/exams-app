# Exam App — Motion & Graph Physics Specification (`MOTION.md`)

Este documento especifica princípios de movimento, curvas de aceleração (*easing*), tokens de duração e a **física condicional** do grafo de conhecimento e das microinterações do **Exam App**. O protótipo pode interromper a simulação quando estável, invisível ou em modo de movimento reduzido.

---

## 1. Princípios de Movimento

O design de movimento no Exam App serve para guiar o olhar, fornecer feedback físico imediato e preservar o modelo mental do estudante durante a navegação entre conteúdos densos.

1. **Naturalidade & Física Orgânica**:
   - Elementos em movimento possuem inércia, massa aparente e desaceleração suave.
   - Escolher curvas conforme a função: `linear` pode ser adequado a progresso constante ou movimento ligado à rolagem; entradas/saídas podem usar aceleração e desaceleração. Não impor física decorativa a todo componente.
2. **Responsividade Imediata (Zero Latência Percebida)**:
   - Fornecer feedback tão logo a ação seja reconhecida; 16,7 ms a 60 fps e 8,3 ms a 120 fps são **orçamentos de quadro**, não SLAs garantidos de resposta ao usuário. Não bloquear a ação aguardando animação.
3. **Continuidade Espacial**:
   - Usar continuidade espacial quando ela esclarece relações (menu ancorado, painel, mudança de contexto); mudanças imediatas são válidas para acessibilidade, preferências de movimento reduzido e fluxos de alta frequência.
4. **Respeito Cognitivo**:
   - Animações nunca devem bloquear a produtividade ou impor esperas forçadas ao usuário.
   - Não há animações comemorativas excessivas que distraiam o estudante durante sessões de simulado.


### 1.1 Os 12 princípios clássicos da animação — adaptação responsável para UI

Os 12 princípios difundidos por Frank Thomas e Ollie Johnston em *The Illusion of Life* (1981) são **princípios artísticos de animação**, não leis científicas, normas WCAG nem requisitos automáticos de software. A tabela é uma **interpretação original para interfaces**, não reprodução do livro. Aplicar somente quando melhora estado, hierarquia, continuidade ou feedback.

| Princípio clássico | Adaptação possível no Exam App | Limite / anti-padrão |
|---|---|---|
| **1. Squash and Stretch** (compressão e alongamento) | Leve resposta visual ao pressionar um botão ou arrastar um nó do grafo | Não deformar texto, alternativas, hitbox ou componentes críticos |
| **2. Anticipation** (antecipação) | Indicar que um painel pode ser arrastado ou expandido por affordance e resposta inicial | Não inserir animação preparatória que atrase clique, envio ou navegação |
| **3. Staging** (encenação / foco) | Destacar visualmente a resposta corrigida, a tarefa atual e a origem de um menu | Evitar múltiplos elementos animados competindo com o enunciado |
| **4. Straight Ahead Action and Pose to Pose** (animação contínua vs. poses-chave) | Preferir estados definidos e transições determinísticas em UI; simulação contínua apenas quando útil no grafo | Não depender de movimento imprevisível para comunicar estado de prova |
| **5. Follow Through and Overlapping Action** (continuidade e sobreposição) | Elementos subordinados podem acompanhar a abertura de um painel com atraso mínimo | Nunca atrasar feedback, foco, clique ou encerramento por efeito de cauda |
| **6. Slow In and Slow Out** (aceleração e desaceleração) | Curvas de entrada/saída coerentes com os tokens abaixo | Não aplicar easing a cada pixel de arrasto direto, nem proibir linear universalmente |
| **7. Arcs** (arcos) | Trajetórias curvas podem comunicar relações espaciais em visualizações do grafo | Evitar percursos longos em ações repetitivas e efeitos vestibulares |
| **8. Secondary Action** (ação secundária) | Microfeedback discreto em ícones/indicadores pode reforçar uma mudança principal | Não competir com feedback de correto/incorreto ou leitura |
| **9. Timing** (temporização) | Duração compatível com distância, relevância e frequência; usar tokens existentes | Não forçar espera nem presumir que toda transição deva ter animação |
| **10. Exaggeration** (exagero) | Ênfase pontual para erro crítico ou marco raro, se realmente ajudar | Evitar shake, bounce ou celebração repetitiva em sessões de estudo |
| **11. Solid Drawing** (solidez visual) | Preservar alinhamento, profundidade e relações geométricas ao transformar elementos | Não introduzir falsa perspectiva ou deslocamentos que causem saltos de layout |
| **12. Appeal** (atratividade) | Criar movimento claro, legível e consistente com o design system | Encanto não pode superar acessibilidade, foco e produtividade |

### 1.2 Princípios operacionais de Motion Design para interfaces

| Regra | Aplicação e decisão | Verificação |
|---|---|---|
| **Propósito antes do efeito** | Animar para comunicar feedback, relação espacial, mudança de estado ou atenção necessária | Se retirar a animação, perde-se significado? Se não, ela é opcional |
| **Causalidade e continuidade** | Origem e destino devem corresponder ao elemento acionado; usar continuidade de painel, aba ou menu quando útil | O usuário sabe de onde veio e para onde foi? |
| **Interrupção e reversibilidade** | Uma animação em curso deve aceitar nova ação, reversão e fechamento sem fila de efeitos | Clicar rapidamente abrir/fechar e navegar várias vezes |
| **Resposta imediata** | Estado funcional e foco não aguardam o término da transição; não animar envio de dados como substituto de status real | Operação continua correta com duração zero e rede lenta? |
| **Hierarquia temporal** | Uma transição principal pode ter filhos coordenados; limitar atraso acumulado e evitar cascatas em listas extensas | O último item não fica indisponível esperando stagger? |
| **Easing sem dogmas** | Entradas podem desacelerar; saídas podem acelerar; drag acompanha ponteiro diretamente; spring só se apropriado | O movimento não ultrapassa alvo nem gera oscilação indesejada? |
| **Duração contextual** | Usar tokens de 60/120/200/350/500 ms como *pontos de partida* existentes, não metas universais | Testar frequência, distância, dispositivo e usuários experientes |
| **Performance real** | Preferir transform/opacity quando adequado; evitar animar layout em listas longas; limitar blur, sombras, filtros e loops | Verificar FPS, long tasks, reflow, bateria e viewport estreita |
| **Estado sem dependência de JS** | Conteúdo deve ser visível sem animação e sem hidratação; fallback em APIs não suportadas | Desativar JS/efeitos e confirmar leitura e navegação |
| **Movimento reduzido com significado preservado** | Trocar deslocamentos/zoom/parallax por estado imediato ou transição discreta não espacial; não apagar feedback essencial | Testar com preferência de redução ativa e mudança dinâmica |
| **Autoplay e repetição** | Evitar loops decorativos; pausar quando oculto/offscreen; permitir parar movimentos que se enquadrem em WCAG 2.2.2 | Aba oculta, scroll, bateria, leitor de tela e tempo de uso |
| **Foco e teclado independentes** | Focus trap, retorno do foco, semântica e anúncio de status devem funcionar com animação desativada | Teclado, Escape, Enter, Tab e leitor de tela |
| **Integridade de dados** | Nenhuma transição deve duplicar envio, perder resposta, ocultar erro ou alterar resultado antes da confirmação | Envio duplo, retry, refresh, erro e interrupção |

### 1.3 Matriz de aplicação por superfície do Exam App

| Superfície / evento | Movimento permitido | Regra de segurança e acessibilidade |
|---|---|---|
| Seleção de alternativa | Feedback de pressionamento/seleção discreto, em geral token instant/fast | Não revelar gabarito antes de confirmar; foco e seleção não dependem da animação |
| Correção e gabarito | Transição breve de cor/opacity para estado + explicação visível | Correto/incorreto sempre em texto e sem depender só de cor; sem tremor punitivo |
| Próxima questão / voltar | Transição curta opcional que preserve contexto e posição intencional | Não deslocar leitura inesperadamente; permitir navegação rápida sem fila |
| Sidebar e painel direito | Abertura/fechamento coerente com âncora; token normal/smooth conforme distância | Interrompível; foco e hitbox corretos; sem conteúdo inacessível durante transição |
| Modal / menu / dropdown | Entrada e saída breves; possível fade/transform limitado | Escape e retorno do foco imediatos; não bloquear fechamento |
| Grafo de conhecimento | Drag direto; física somente se útil e com orçamento; pausar quando oculto | Respeitar movimento reduzido; não exigir movimento constante para compreender relações |
| Progresso e loading | Status verdadeiro, skeleton quando útil, indicador discreto | Não inventar percentual nem deixar loop sem recuperação |
| Simulado cronometrado | Feedback mínimo, previsível, sem celebrações | Animação não consome tempo útil, não bloqueia respostas e não mascara timeout |

### 1.4 Acessibilidade normativa e fontes de implementação

- **WCAG 2.2 — 2.3.1 (A)**: evitar flashes acima dos limites; não substituir por regra genérica de duração.
- **WCAG 2.2 — 2.2.2 (A)**: fornecer mecanismo de pausa/parada/ocultação para movimento ou atualização automática nas condições definidas pelo critério, salvo exceções.
- **WCAG 2.2 — 2.3.3 (AAA)**: movimento disparado por interação deve poder ser desativado, salvo quando essencial; é **AAA**, não AA.
- **MDN / CSS**: media query [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), [CSS transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transitions) e [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API).
- **Motion (documentação consultada via Context7)**: [React accessibility](https://motion.dev/docs/react-accessibility) e [useReducedMotion](https://motion.dev/docs/react-use-reduced-motion). Em aplicações React que **já** usem Motion, o equivalente a MotionConfig com reducedMotion="user" reduz transform/layout motion; **não instalar Motion** apenas para animações simples no protótipo HTML/CSS/JS.
- **Plataformas**: [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) e [Material Design 3](https://m3.material.io/), conforme o contexto, não como regras universais para a web.
- **Curadoria de implementação**: skill instalada **Impeccable — Animate** (referência de motion com propósito, orçamento, timing, redução de movimento e QA). Faixas sugeridas de 100–150, 150–300, 300–500 e 500–800 ms são **heurísticas**, não SLA nem obrigação do projeto; preservar os tokens deste documento até decisão validada.
- **Origem histórica dos 12 princípios**: Frank Thomas e Ollie Johnston, *The Illusion of Life: Disney Animation* (1981). São princípios artísticos adaptados aqui; não uma lista de 12 requisitos WCAG.

**Hierarquia em caso de conflito:** segurança e acessibilidade > integridade de resposta/prova > feedback e sucesso da tarefa > performance > expressão estética. Toda exceção precisa de justificativa e teste reproduzível.

---

## 2. Tokens de Duração & Curvas de Aceleração (Easing)

### 2.1 Tokens de Duração

| Token | Duração | Casos de Uso Recomendados |
| :--- | :--- | :--- |
| `--motion-duration-instant` | `60ms` | Estados de botão ativo (`:active`), pressionamento de teclas, feedback tátil |
| `--motion-duration-fast` | `120ms` | Hover em abas, botões e alternativas, surgimento de tooltips, badges |
| `--motion-duration-normal` | `200ms` | Transição de abas ativas, abertura de dropdowns e menus de contexto, acordeões |
| `--motion-duration-smooth` | `350ms` | Expansão ou recolhimento de painéis laterais (Sidebar e Right Panel), diálogos modais |
| `--motion-duration-extended` | `500ms` | Transições de tela completa, navegação entre modos de estudo |
| Física do grafo (modo lógico, não token CSS) | Condicional | Ativa apenas em modo normal, para até 240 nós, enquanto há energia de layout |

### 2.2 Curvas de Easing Padronizadas

As curvas utilizam a sintaxe CSS `cubic-bezier` para garantir consistência em todos os navegadores:

```css
:root {
  /* Easing padrão para transições bidirecionais suaves */
  --motion-ease-standard: cubic-bezier(0.2, 0, 0, 1);

  /* Easing de entrada (Decel) - elementos que entram no campo visual */
  --motion-ease-enter: cubic-bezier(0.05, 0.7, 0.1, 1);

  /* Easing de saída (Accel) - elementos que saem do campo visual */
  --motion-ease-exit: cubic-bezier(0.3, 0, 0.8, 0.15);

  /* Easing de mola elástica sutil para cards e chips interativos */
  --motion-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 3. Física do grafo — implementação e limites

O grafo de conhecimento oferece manipulação direta de nós, filtros, zoom e conexões visuais. **A física não é obrigatória nem contínua**: em modo normal, roda enquanto o layout precisa estabilizar ou após uma interação que o reaquece; em movimento reduzido, não há passos de física após a criação. Para grafos densos, o protótipo usa layout estático como proteção de desempenho.

### 3.1 Modelo efetivamente implementado

No protótipo `prototypes/exam-app-0.1.1/index.html`, `tick()` implementa uma **integração explícita de velocidade e posição semelhante a Euler**, com amortecimento; **não é Velocity Verlet**. Os parâmetros são heurísticos de layout, não simulação física dimensionalmente calibrada.

1. **Repulsão entre pares**: percorre pares de nós visíveis, ignora distâncias maiores que o limite do código e calcula força inversamente proporcional a `distância² + 280`, escalada por `alpha` e grau dos nós; também aplica separação quando há sobreposição.
2. **Atração de arestas**: ajusta velocidade dos nós conectados segundo a diferença entre distância atual e alvo, ponderada por grau e `alpha`; arestas classificadas como fracas são ignoradas na atração.
3. **Centralização**: aplica uma pequena correção de velocidade em direção ao centro do plano.
4. **Amortecimento**: multiplica a velocidade por `0.88` a cada passo; a posição é atualizada com a velocidade amortecida. A perturbação visual é escalada por `alpha` e **não** constitui movimento perpétuo.
5. **Decaimento**: `alpha *= 0.985` por passo; abaixo de `0.025`, o agendador deixa de executar a física até uma interação relevante. Não prometer comportamento temporal idêntico em dispositivos com FPS diferentes.

**Custo:** a repulsão é `O(N²)`; o protótipo só habilita a física para **até 240 nós**. Acima disso, utiliza a disposição inicial em espiral com zoom de ajuste, sem loop de física. Esse limite é um **guardrail provisório**, não um resultado de benchmark; medir em dispositivos reais antes de aumentá-lo. A posição inicial e a simulação devem manter os controles de busca, filtros, drag, zoom e teclado operacionais.

### 3.2 Ciclo de vida e renderização

- Um único agendador controla `requestAnimationFrame`. `invalidate()` solicita **um quadro** quando um evento altera o canvas, inclusive no modo reduzido; ele não inicia um loop contínuo.
- A montagem não executa 180/400 passos síncronos de física. Primeiro mostra o layout inicial e o ajusta à viewport; no modo normal, a física evolui em quadros subsequentes, somente se habilitada.
- `prefers-reduced-motion` é observado com `MediaQueryList.change`. Ao ativar redução, cancelar o frame pendente, zerar `alpha` e velocidades e redesenhar o estado estático. Ao desativar, retomar a física apenas se habilitada.
- `visibilitychange` e `IntersectionObserver` pausam o agendamento em aba oculta ou grafo fora da viewport. A visibilidade restaurada permite redesenho e continuação condicional.
- `stopGV()` cancela o frame e desconecta `ResizeObserver`, `IntersectionObserver` e listeners de preferência/visibilidade para evitar trabalho depois de navegar.
- O drag em movimento reduzido atualiza somente a posição do nó arrastado e pede um redesenho; os outros nós não recebem impulso.

### 3.3 Limites e verificação necessária

A estratégia de custo, as durações e o limite de 240 nós **não foram validados com medições de FPS, bateria, dispositivos ou leitores de tela** nesta alteração. O estado de implementação não equivale a conformidade WCAG. Validar abertura de grafos pequenos/densos, redimensionamento, mudança dinâmica da preferência, alternância de abas, scroll fora da viewport, retorno, teclado, drag, zoom e filtros. Registrar medições e evidências reais no board quando executadas.

---

## 4. Acessibilidade & Modo de Redução de Movimento (`prefers-reduced-motion`)

O Exam App respeita a preferência do sistema por movimento reduzido. **WCAG 2.2, critério 2.3.3 (Animation from Interactions) é nível AAA**, não requisito AA geral. Os critérios 2.3.1 (Three Flashes or Below Threshold) e 2.2.2 (Pause, Stop, Hide), quando aplicáveis, são nível A. A conformidade exige avaliação real, não apenas uma media query.

```css
/* Exemplo de padrão para componentes que usam movimento espacial.
   Não aplicar reset global indiscriminado: feedback e estados devem permanecer claros. */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }

  .motion-spatial,
  .motion-spatial::before,
  .motion-spatial::after {
    animation: none !important;
    transition: none !important;
  }
}
```

**Implementação atual:** o protótipo removeu os dois resets globais e usa desativação **direcionada** para os componentes animados conhecidos, preservando transições de feedback não espacial. Ainda é necessário validar visualmente cada componente e o feedback de carregamento em modo reduzido, em CSS, JS e canvas.

### 4.1 Comportamento do Grafo sob Movimento Reduzido

Quando a media query `(prefers-reduced-motion: reduce)` estiver ativa:
1. **Layout estático imediato**: apresentar a disposição inicial em espiral, com ajuste de zoom, **sem** 400 passos síncronos de física e sem bloquear a primeira pintura com simulação.
2. **Congelamento da simulação**: `alpha = 0`, velocidades `vx = vy = 0` e nenhum loop contínuo de `requestAnimationFrame`. Um frame isolado é permitido para desenhar alterações reais de estado.
3. **Interações estáticas**: drag modifica apenas a posição do nó; zoom, pan, busca e filtros solicitam redesenho sob demanda. A preferência pode mudar durante a sessão, sem recarregar a página.
