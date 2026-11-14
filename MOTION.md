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

<!-- MATERIAL-APPLE-MOTION:START -->
## 5. Material 3 Expressive + Apple Fluid Interfaces — aplicação controlada

> **Escopo:** transposição de conceitos dos skills M3 Expressive e Apple Design para **o protótipo HTML/CSS/JS** do Exam App. Esta seção **não substitui** os tokens das seções 2–4 nem afirma que os padrões aqui propostos já estão implementados. Valores, equações e *presets* extraídos de terceiros são referências a validar, não SLAs ou especificação oficial.

### 5.1 Taxonomia funcional de movimento

| Categoria | Propósito | Propriedades preferidas | Exemplos no Exam App | Restrições |
|---|---|---|---|---|
| **Feedback de estado (effects)** | Confirmar ação e mudança de estado sem mover conteúdo | `opacity`, `color`, `background-color` | Hover/pressed, tab selecionada, resposta marcada, filtro ativo | **Sem overshoot** de cor/opacidade; preservar sinalização textual |
| **Espacial (spatial)** | Demonstrar origem, destino, continuidade e hierarquia | `transform` (`translate`/`scale`), eventual raio/clip | Abrir sidebar, right panel, mover foco no grafo, popover ancorado | Evitar layout shift, scroll jump e movimento vestibular |
| **Gesture-following** | Acompanhar ponteiro/toque continuamente | Transform/posição do elemento arrastado | Drag de nós, resize de painel, gesto de sheet quando existir | Seguir diretamente a interação, sem easing que atrase o ponteiro |
| **Spring settle** | Encerrar drag/interrupção com comportamento físico coerente | Simulação amortecida pontual de posição/escala | Soltar nó, magnetismo leve em snap funcional | Respeitar velocidade de soltura e limites; sem loop permanente |
| **Feedback de sistema** | Informar progresso, erro, sucesso e disponibilidade | Indicador estático ou animado com estado textual | Carregamento de PDF, extração, busca, atualização | Timeout/erro/recuperação; nunca loading infinito |
| **Transição instantânea** | Priorizar legibilidade, velocidade ou redução de movimento | Troca direta de estado | Próxima questão, troca de contexto frequente, reduced motion | Continua exigindo foco correto e feedback semântico |

**Princípio de M3 Expressive:** movimento expressivo concentra atenção em momentos de valor; *spatial springs* representam objetos que mudam de posição, escala ou forma; *effects* servem para cor e opacidade e não precisam oscilar. **Princípio Apple:** uma interação física convincente começa do valor **visível atual**, pode herdar velocidade e ser interrompida/alterada de direção sem voltar ao estado inicial.

### 5.2 Regra de interrupção e transferência de velocidade

Todas as transições iniciadas pelo usuário devem tolerar eventos concorrentes:

1. **Ponto inicial = estado atual renderizado**, não o valor inicial da animação anterior. Em reabertura de painel, partir da posição em que o fechamento foi interrompido.
2. **Novo comando cancela/sobrescreve o comando antigo**; não criar fila de animações após cliques rápidos nem esperar um `transitionend` que não virá.
3. **Arraste direto acompanha o dedo/mouse**. Ao soltar, pode aplicar *spring settle* restrito. Se o usuário agarrar novamente, interromper a mola imediatamente e herdar ou zerar a velocidade de forma previsível.
4. **Fechamento por Escape, mudança de rota ou unmount** termina a interação e restaura foco relevante sem esperar por movimento.
5. **Animação não é a fonte de verdade do estado**: `selected`, `expanded`, `aria-selected`, `aria-expanded`, resposta marcada, filtros e resultados devem derivar da mesma máquina/estado lógico.
6. **Qualquer estado intermediário** conserva click targets e legibilidade; hitbox, layer e pointer-events não podem ficar presos após cancelamento.

Em Web Animations API (WAAPI), `Animation.cancel()` interrompe a transição, mas **não preserva por si só todos os estilos computados**. Na prática, ler o estado visual calculado ou usar um único controlador de estado antes de iniciar a próxima animação. Não misturar `transition`, `animation`, WAAPI e JS spring no mesmo atributo sem uma política explícita de ownership.

### 5.3 Spring real vs curva elástica CSS

A curva existente `--motion-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)` **simula overshoot**, mas **não** incorpora velocidade, massa, rigidez ou damping. A denominação histórica é preservada para compatibilidade com o protótipo.

Para um sistema massa-mola-amortecedor, o modelo conceitual é:

```text
F = -k (x - alvo) - c v
a = F / m
v = v + a Δt
x = x + v Δt
```

- `k`: rigidez (*stiffness*); `c`: amortecimento (*damping*); `m`: massa; `v`: velocidade; `Δt`: intervalo temporal em segundos.
- Esses parâmetros **não são diretamente intercambiáveis** com a API de `damping/response` de outro framework, nem com easing CSS.
- Integradores discretos simples podem ficar instáveis em `Δt` alto; usar passo temporal limitado, amortecimento definido, stop threshold e cancelamento. Para animações pontuais, preferir CSS/WAAPI antes de adicionar um motor físico.
- **Overshoot moderado** pode fazer sentido para posição/escala em confirmação especial; **não** deformar texto, enunciados, alternativas, ícones acessíveis ou áreas-alvo. Para `opacity`, valores devem permanecer dentro de `[0,1]`; para cor, interpolação contínua sem bounce.

**M3 Expressive** distingue springs *spatial* e *effects*; **Apple fluid interfaces** enfatiza a passagem de velocidade e reversibilidade. No Exam App ambos são **heurísticas de implementação condicionadas** à legibilidade, ao contexto e à performance, não obrigação de animar tudo.

### 5.4 Ordem de grandeza e tokens existentes

As durações **existentes** permanecem: 60, 120, 200, 350 e 500 ms (seção 2.1). Usar como ponto de partida, e não multiplicar a duração até uma interface parecer "premium".

| Intenção | Padrão recomendado | Observação |
|---|---|---|
| Press/hover | `instant`/ `fast` | Não atrasar ação; compatível com alto volume de estudo |
| Menu/popover | `fast` / `normal` | Abrir a partir do gatilho; foco operacional imediato |
| Seleção de aba | `normal` ou instantâneo | Mudança de conteúdo preserva posição e foco |
| Sidebar / contexto | `normal` / `smooth` se a transição espacial trouxer benefício | Testar clique repetido, focus trap se overlay e ResizeObserver quando útil |
| Navegação contextual entre nós | `normal` / `smooth` para reorientação; instantâneo em redução | Manter seleção, legenda e ponto focal |
| Troca de questão/simulado | Instantâneo ou curta | Priorizar fluxo rápido; sem animação ornamental |
| Loading/progresso | Conforme operação real, sem duração artificial | Estado terminal de sucesso/erro/cancelamento obrigatório |

Para microinterações, várias skills Apple dão intervalos de exemplo (~100–450 ms). **Não os acrescentar como tokens paralelos**; calibrar frente aos tokens existentes e validar com testes reais de tarefa.

### 5.5 Continuidade espacial por fluxo do Exam App

**Sidebar e painel direito.** O painel entra/sai da borda à qual pertence; conteúdo principal não salta. Quando estiver em modo overlay, usar `aria-expanded`, backdrop, Escape e retorno de foco corretos. Não animar largura do layout em todas as ações se o custo de relayout for alto; avaliar composição transform + dimensão final, mas evitar conteúdo clicável fora de posição.

**Abas e navegação de conteúdo.** O indicador de seleção pode se mover em curta distância, mas painel de conteúdo e scroll não devem pular. Caso o usuário mude de aba antes do fim da transição, o indicador deve escolher o **destino novo imediatamente**. A animação nunca justifica manter duas abas visualmente selecionadas.

**Questões e simulados.** Feedback pressionado → seleção → correção têm estados distintos. Marcação não revela resposta correta antes do comando apropriado; cor/efeito não substitui texto, símbolo/ícone acessível ou mensagem anunciada. Contadores não "contam para trás" visualmente para chegar ao valor se isso prejudicar compreensão do cronômetro.

**Grafo de conhecimento.** A seleção de nó pode recentrar/transicionar para vizinhos relacionados como o usuário observou em ferramentas PKM, com duração e câmera **limitadas**. A nova disposição deve preservar identidade dos nós, legibilidade e arestas, em vez de desmontar/reconstruir a rede abruptamente. Filtros por tipo de entidade devem manter legenda, resultado textual e posição lógica sempre que possível. O grafo só simula enquanto há necessidade; ver seções 3 e 4.

**Leitor de PDF.** Trocas de página/zoom devem manter o ponto de leitura e evitar flash, salto de scrollbar ou deslocamento involuntário do texto. Animação de loading nunca substitui estado de erro recuperável.

**Modais/sheets/popovers.** Abertura deve ter uma origem lógica (gatilho), foco é movido assim que operacional, e o fechamento é cancelável. **Não** simular rubber-banding em controles importantes sem suporte a drag e alternativa por teclado.

### 5.6 Performance, CSS, JS, canvas e medição

- Preferir `transform` e `opacity` quando não houver impacto na leitura/seleção, porque normalmente são candidatos à composição eficiente. Isso **não garante** performance: `filter`, blur, grandes layers, muitos nós SVG e repaints podem custar caro.
- Não usar `will-change` em toda a aplicação; ativá-lo pontualmente e medir consumo de memória.
- Em loops de `requestAnimationFrame`, usar timestamps reais, interromper quando estável/oculto, reagir a `visibilitychange` e preferências de movimento e **limitar cálculo em delta de tempo grande** após aba suspensa.
- Limitar efeitos Apple-inspired de `backdrop-filter`: o Design System privilegia superfícies opacas. Não animar blur em grandes áreas/scroll sem teste em dispositivo modesto.
- Evitar JS e CSS concorrentes animando o mesmo elemento/propriedade. Para CSS + WAAPI manter ownership claro e cleanup em transições canceladas.
- Métrica mínima de revisão: taxa/tempo de frame no dispositivo-alvo, layout shifts percebidos, resposta ao input, existência de frames agendados após repouso/aba oculta, acessibilidade/foco, resultado com reduced motion. Orçamento de 16,7 ms/8,3 ms é físico do display, não promessa de latência.

### 5.7 Redução de movimento: matriz de equivalência

| Em movimento normal | Em `prefers-reduced-motion: reduce` | Estado preservado |
|---|---|---|
| Slide de painel | Painel aparece/desaparece sem deslocamento espacial | `expanded`, foco, backdrop, scroll |
| Câmera do grafo recentra com spring | Reposicionamento instantâneo ou transição não espacial discreta | Nó selecionado, vizinhos, legenda, controle de zoom |
| Node drag settle | Parar no destino, sem overshoot ou oscilação | Coordenada final, vínculos |
| Seleção de tab animada | Troca direta de indicador/aba | `aria-selected`, painel e posição |
| Feedback de resposta | Cor/ícone/texto estáticos ou fade discreto apropriado | Correto/incorreto, anúncio e histórico |
| Skeleton/progresso | Placeholder estático ou atualização textual | Loading, erro, recuperação e cancelamento |

A WCAG 2.2 estabelece critérios específicos (como **2.3.1** para flashes e **2.2.2** para conteúdo que se move/atualiza automaticamente, quando aplicáveis); **2.3.3 Animation from Interactions é nível AAA**, não AA. `prefers-reduced-motion` é preferência do usuário e prática de implementação importante, não um substituto de avaliação de WCAG.

### 5.8 Matriz de teste obrigatória para mudanças de animação

1. Abrir → fechar → abrir sidebar e painel no meio do fechamento, com cliques rápidos; verificar estado e foco.
2. Trocar abas 5× em sequência; nenhum painel duplicado, seleção divergente ou `transitionend` perdido.
3. Selecionar nós do grafo rapidamente, filtrar tipos durante animação, usar busca, zoom, pan, drag e mudar de contexto; verificar câmera, nó ativo e controles.
4. Alternar preferência `prefers-reduced-motion` **enquanto uma animação está em execução**; cancelar frames e preservar o estado.
5. Repetir em tema claro/escuro, largura estreita, zoom e com teclado; testar Escape, Tab e leitor de tela conforme recurso.
6. Suspender aba, voltar após tempo longo, observar CPU e frames pendentes; nada deve explodir por grande `Δt`.
7. Simular latência/erro no carregamento e navegação de PDF: nunca deixar usuário preso em skeleton, spinner ou camada bloqueadora.
8. Capturar vídeo/GIF e descrever trajetória, origem, destino, easing, estados/frames e comportamento de interrupção em texto no board; **não afirmar teste visual se não houver execução**.

### 5.9 Fontes e limites das recomendações

- **Oficiais:** [Material 3 — motion](https://m3.material.io/styles/motion/overview), [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/), [Apple Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/liquid-glass), [MDN — Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API), [MDN — prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
- **Skills comunitários, usados como inspiração técnica:** [abhixv / M3 Expressive](https://github.com/abhixv/google-m3-expressive-design-skill), [hamen / Material 3](https://github.com/hamen/material-3-skill), [gdlbo / Material](https://github.com/gdlbo/material-skill), [BuilderIO / Apple Design](https://github.com/BuilderIO/agent-native-product-visuals/tree/main/.agents/skills/apple-design), [bowen31337 / Apple Design](https://github.com/bowen31337/apple-design), [oye-rahul / Apple Web](https://github.com/oye-rahul/Apple-Design-Skill) e [rshankras / Apple Design Skills](https://github.com/rshankras/claude-code-apple-skills/tree/main/skills/design). Os **22** repositórios catalogados (leitura individual ainda não comprovada para todos) estão em [DESIGN.md](DESIGN.md).
- **Limite de verificação:** conceitos de spring/forma/easing extraídos de repositórios diferentes nem sempre têm equivalência paramétrica, mesmo quando usam a palavra "spring". Valores exatos de APIs, tokens e requisitos de plataforma devem ser validados na documentação oficial atual e no navegador real antes da implementação.

### 5.10 Casos-limite omitidos: conteúdo dinâmico, responsividade e ownership

**O contrato de interrupção da seção 5.2 não basta** quando a geometria muda durante o movimento. Validar explicitamente os cenários abaixo antes de adotar efeitos de M3 Expressive/Apple:

| Mudança durante a animação | Falha provável | Estratégia recomendada |
|---|---|---|
| Accordion/textarea muda de altura e conteúdo é carregado | `height: auto` não interpola como valor numérico em muitos contextos; salto de layout e conteúdo cortado | Preferir layout estável/abertura instantânea em UI densa; se animar, medir tamanho, recalcular destino com `ResizeObserver` e encerrar com tamanho intrínseco, sem animar a página inteira |
| Abrir/fechar painel enquanto breakpoint muda | Transform antiga produz deslocamento/overlay invisível | Reavaliar modo `docked` vs `overlay`, cancelar animação antiga e restaurar foco/scroll sem depender de `transitionend` |
| Fonte carrega, usuário amplia zoom ou muda idioma | Geometria e origem visual ficam obsoletas | Invalide medições/cache de posição; evitar shared-element transition se os conteúdos não são realmente equivalentes |
| Usuário clica em aba antes de terminar transição | Animação anterior escreve estado atrasado e ativa aba errada | Identidade única de transição/geração; somente última intenção altera estado lógico e foco |
| Modal fecha enquanto requisição está pendente | Overlay/focus trap "fantasma", foco perdido | Abortar ou desacoplar request quando seguro, limpar listeners/frames e mover foco de modo síncrono ao disparador válido |
| Tab oculta/sistema suspende e volta | `Δt` enorme, salto físico ou trabalho em loop | Limitar passo de integração, parar física e recalcular destino ao retomar; não tentar simular frames perdidos |
| Filtro remove nós durante spring no grafo | Velocidade e arestas referenciam nós inexistentes | Cancelar transições obsoletas, recomputar rede/seleção e câmera, desenhar sob demanda |
| Modo reduzido ativado no meio do spring | Física continua invisível ou reinicia na próxima interação | Cancelar RAF/WAAPI, zerar velocidades e revelar estado final imediatamente, mantendo semântica e foco |

**Observações técnicas:**
1. **Layout FLIP/View Transitions são ferramentas opcionais**, não exigência. Se houver compartilhamento de elementos, usar identidade estável, validar origem/destino e garantir fallback instantâneo. Não clonar visualmente conteúdo que permaneça interativo em duas regiões nem duplicar nomes acessíveis.
2. **Animar `width`/`height`/`top`/`left`** pode provocar relayout; **animar `transform`** pode gerar falsa posição visual em relação ao hitbox, teclado ou seleção de texto. Decidir por medição e coerência, não pela regra "transform sempre".
3. Não depender exclusivamente de `animationend`/`transitionend`: eventos podem não disparar por `display:none`, cancelamento, reduced motion ou troca de rota. Estado lógico e limpeza não podem ficar bloqueados.
4. `ResizeObserver` observa geometria, mas também precisa de cleanup e prevenção de ciclos de resize. Não recalcular layout num loop por frame sem necessidade.
5. Progressos e loaders são **estado de tarefa**, não loop de animação: timeout, erro terminal, retry limitado e botão de recuperação precisam existir independentemente do spinner.
6. Ao alterar motion no protótipo, executar `npm run test:motion` e testes de navegação relevantes quando disponíveis; distinguir teste automatizado de verificação manual de foco/visão/motion.

### 5.11 Checklist de implementação com evidências

- [ ] Registrar estado inicial, alvo, propriedade animada, motivo, duration/easing ou parâmetros de spring, ponto de cancelamento e dono da propriedade CSS/JS.
- [ ] Confirmar que UI e ARIA derivam do mesmo estado lógico; foco e hit targets existem ao abrir/fechar.
- [ ] Testar clique repetido/reversão/interrupção, alteração de viewport/zoom e conteúdo dinâmico.
- [ ] Testar `prefers-reduced-motion` antes **e durante** a animação e retorno de aba após suspensão.
- [ ] Testar grafo com nó removido/filtrado e PDF com troca rápida de página/zoom.
- [ ] Registrar evidência visual real (vídeo/GIF, se houver) e descrição textual no board; não dizer "animação implementada" se somente os docs foram alterados.

Referências técnicas: [MDN — Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API), [MDN — ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver), [MDN — View Transitions](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API), [MDN — prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion). **São mecanismos possíveis, não dependências novas.**

<!-- MATERIAL-APPLE-MOTION:END -->


## 6. Ícones animados, reordenação e arraste acessível (pesquisa 2026)

Esta seção operacionaliza [AGENTS.md §19](AGENTS.md) e [DESIGN.md §8.22](DESIGN.md). **Ícones animados, drag-and-drop, View Transitions e layout animations são padrões técnicos/de design, não novas leis UX.** O sistema atual usa SVG/HTML/CSS/JS e já tem tokens de movimento; priorizar soluções nativas sem dependências e medir antes de considerar dnd-kit ou Motion.

### 6.1. Icon Motion / Symbol Effects — o movimento deve carregar significado

A Apple publica categorias de efeitos nativos **Discrete, Indefinite, Transition e Content Transition**, além de efeitos chamados **Bounce, Pulse, Wiggle, Rotate, Replace, Draw On e Draw Off**, entre outros. O objetivo aqui é aprender **vocabulário e propósito**, não importar SF Symbols para a web. [Apple Symbols](https://developer.apple.com/documentation/symbols), [Apple Motion](https://developer.apple.com/design/human-interface-guidelines/motion).

| Evento ou estado real | Motion web opcional | Não fazer | Alternativa em reduced motion |
|---|---|---|---|
| **Favoritar / desafavoritar** | Troca discreta de estado com desenho de ícone ou escala contida e reversível. | Coração/estrela pulsando indefinidamente ou confirmar favorito antes de persistir se o caso exigir remoto. | Atualizar preenchimento/label/estado sem escala espacial. |
| **Expandir / recolher painel** | Rotacionar chevron ou substituir símbolo de forma coerente com o estado expandido. | Indicar uma direção visual que discorde do estado real ou trocar foco durante transição. | Ícone de estado correto instantaneamente. |
| **Salvar / sincronizar** | Animação discreta enquanto pendente, depois ícone/label de sucesso ou falha. | Spinner eterno, progresso mentiroso, animação de sucesso antes de salvar. | Status textual e mudança de símbolo/cor sem loop. |
| **Erro / aviso / atenção** | Microênfase curta com texto, quando melhorar descoberta. | Shake agressivo, flashes, vibração repetida ou informação transmitida apenas pelo ícone. | Texto acionável, foco e contraste estáticos. |
| **Item movido / reordenado** | Assentamento breve para posição final ou destaque funcional do novo lugar. | Bounce em cada item, mudança de ordem no DOM desconectada da visualização e foco perdido. | Ordem muda diretamente, estado/posição anunciados. |
| **Carregamento** | Ícone com animação não bloqueante apenas enquanto houver operação ativa. | Ativar animação decorativa sem evento/estado, esconder erro atrás de looping. | Texto de progresso/espera, saída em timeout/falha. |

**MUST** associar cada efeito a transição de estado explícita e oferecer feedback legível sem animação; rótulo acessível do botão reflete ação ou estado conforme semântica. **MUST** interromper/reverter efeito ao repetir clique, trocar rota, cancelar gravação ou alternar preferência de movimento. **SHOULD** usar um único evento ou efeito curto por ação; não exigir que a pessoa espere pelo término. Não copiar timing, asset ou API de símbolo da plataforma Apple diretamente para web.

### 6.2. Ciclo de Drag-and-Drop / Sortable

| Estado ou evento | Comportamento visual e de interação | Cancelamento e recuperação |
|---|---|---|
| **Idle** | Item em posição real; handle visível/descobrível quando houver arraste. Elementos internos permanecem clicáveis/editáveis. | Alteração de layout não altera a ordem lógica. |
| **Armed / press** | Ativar drag somente após intenção identificável (handle, limiar de movimento ou ativação por teclado) sem destruir scroll normal. | Soltar sem deslocar mantém estado; não executar ação de clique acidental. |
| **Dragging** | Item acompanha ponteiro **sem easing entre dedo e objeto**; mostrar cópia/overlay e indicação de origem/destino. | Escape, pointercancel, toque interrompido ou perda de foco retornam à situação anterior. |
| **Over drop target** | Evidenciar alvo válido, posição de inserção e eventual proibição de drop; permitir auto-scroll controlado se necessário. | Alvo inválido não dispara gravação nem deslocamento persistente. |
| **Drop / settle** | Assentamento curto conforme movimento reduzido; o efeito reflete a ordem lógica final e não bloqueia nova ação. | Drop fora de alvo cancela; nova interação interrompe a animação anterior. |
| **Committing** | Persistir ordem/posição quando aplicável, com pending e prevenção de gravações concorrentes obsoletas. | Em erro, oferecer restauração/retry, sem mensagem de sucesso indevida. |
| **Committed / reverted** | Atualizar anúncio de posição e foco; manter IDs estáveis, ordem DOM e dados alinhados. | Desfazer quando disponível recupera mesma informação via qualquer modalidade. |

**Handle e sensores:** dnd-kit documenta [Sortable](https://dndkit.com/concepts/sortable/), [DragDropManager](https://dndkit.com/concepts/drag-drop-manager/) (PointerSensor, KeyboardSensor, Accessibility, AutoScroller) e [Drag Overlay](https://dndkit.com/react/components/drag-overlay/). **O pacote não é obrigatório** e recursos no adaptador React podem não existir de forma idêntica no protótipo DOM. Se a equipe adotar dnd-kit no futuro, avaliar **framework, versão e APIs** antes de codificar. O modelo de estado e requisitos continuam independentes de bibliotecas.

**Acessibilidade — três acessos independentes:**
1. **Teclado:** ativar reordenação por controle focável, mover destino usando comandos anunciáveis, confirmar ou cancelar com Escape, preservando foco. Ver [W3C APG — Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/).
2. **Ponteiro direto:** drag com mouse/caneta/toque, com drop targets discerníveis, sem bloquear scroll/paste/seleção indevidamente.
3. **Ponteiro único sem arraste:** botões "Mover para cima/baixo", menu "Mover para…" ou campo/controle para posição. **É uma exigência separada de teclado para WCAG 2.5.7 (AA)**, salvo exceção apropriada. Ver [W3C G219](https://www.w3.org/WAI/WCAG22/Techniques/general/G219) e [Understanding SC 2.5.7](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements).

**Implementação web a verificar:**
- Proteger gestos do navegador usando semântica adequada, limites de captura e tratamento de **pointerdown / pointermove / pointerup / pointercancel** e **lostpointercapture** quando captura for adotada. Não desativar touch scroll globalmente; limitar touch-action ao handle apenas se justificável e testado. [MDN — Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events).
- Manter **IDs/keys estáveis** durante drag e drop; overlay visual não pode duplicar papel/nome focável do item original. Foco/seleção e ordem visual devem corresponder à ordem DOM ou ter navegação documentada e testada.
- Prevenir conflito entre **arrastar e clicar**, arrastar e selecionar texto, auto-scroll e scroll nativo, modais e drag, múltiplos ponteiros, drop fora, item removido durante drag, atraso do servidor, undo e mudanças de viewport.
- **Preferir controle específico de drag handle** quando card possui links, botões, checkbox ou campo editável. Não tornar o card inteiro não selecionável apenas por ser arrastável.
- Verificar WCAG **2.1.1 (A) Keyboard**, **2.5.1 (A) Pointer Gestures**, **2.5.2 (A) Pointer Cancellation**, **2.5.7 (AA) Dragging Movements**, **2.5.8 (AA) Target Size (Minimum)** e foco/nome/estado aplicáveis. Não confundir 2.5.7 com apenas suporte a teclado.

### 6.3. Shared layout e View Transitions — continuidade, não efeito decorativo

**Mecanismos documentados:** [MDN View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) (same-document e cross-document, dependendo de navegador/condições), [Motion Layout](https://motion.dev/docs/react-layout-animations), [Motion Reorder](https://motion.dev/docs/react-reorder) e [Motion AnimatePresence](https://motion.dev/docs/react-animate-presence).

- **SHOULD** usar transição entre card ↔ detalhe, item ↔ lista ou painel fechado ↔ aberto somente se esclarece **origem e destino**, não em toda rota ou clique.
- **MUST** manter um **dono único** da posição/escala/opacidade em cada instante; ao interromper, transferir estado visual atual ou aplicar estado final sem salto, inclusive durante nova navegação/resize.
- **MUST** garantir que conteúdo realmente esteja navegável enquanto a animação ocorre e que snapshots de View Transitions não criem uma **segunda interface focável ou estado lógico duplicado**.
- **MUST** preservar scroll, seleção, foco e contexto quando necessário. Não atribuir à API View Transitions a correção automática de foco ou de estado de dados; isso continua sob responsabilidade da aplicação.
- **MUST** prever **fallback de mudança instantânea** para ausência de suporte e **prefers-reduced-motion**; verificar diferentes browsers antes de optar por cross-document view transitions. Não presumir que View Transitions funciona em toda navegação.
- **SHOULD** testar mudanças de filtros, ordenação e itens durante a transição; falhas de carga/async podem invalidar origem/destino e devem cancelar movimento obsoleto.
- **AVOID** representar uma animação de slot, link ou card como garantia de que houve persistência no servidor.

### 6.4. Matriz de testes de motion de componentes

| Fluxo | Sequência mínima de teste | Evidência |
|---|---|---|
| Ícone alternável | Clique duas vezes rápido; aguarde resposta lenta/falha; alternar reduced motion durante efeito. | Ícone, label, estado ARIA e valor persistido coerentes; sem animação eterna. |
| Reordenar lista/cards | Mouse drag, touch scroll + drag, teclado, mover por botão/menu sem arraste, drop inválido e Escape. | Mesma ordem final e feedback em todas as modalidades; status apropriado. |
| Drag e navegação | Arrastar e rolar, sair do container, resize, trocar de aba/rota, remover item durante drag. | Sem ghost de overlay, foco preso ou animação residual; item em estado recuperável. |
| Grafo | Mover nó, arrastar canvas, pan/zoom, selecionar nó por alternativa, cancelar e reduced motion. | Relações, foco, nó ativo e câmera preservados; alternativa não dependente de drag. |
| View Transitions | Navegar rapidamente, back/forward, resize, mudança async no meio, navegador sem suporte. | Mudança completa sem bloquear input, foco e scroll; fallback funcional. |

**MUST** registrar separadamente **documentado, implementado e testado**, com gravação/GIF do comportamento relevante e evidência reproduzível no board quando houver mudança de protótipo; esta especificação isolada não demonstra conformidade nem requer GIF fabricado.

