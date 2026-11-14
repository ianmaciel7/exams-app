# Exam App — Motion & Continuous Physics Specification (`MOTION.md`)

Este documento especifica os princípios de movimento, curvas de aceleração (*easing*), tokens de duração e a física contínua para o grafo de conhecimento e microinterações da interface do **Exam App**.

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
| `--motion-continuous` | Contínuo | Simulação de física do grafo de conhecimento |

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

## 3. Especificação da Física Contínua do Grafo

O grafo interativo de conexões do Exam App (nós de concurso, órgão, cargo, edital e questão) é inspirado na experiência do **Obsidian** e **Capacities**. A física contínua é **opcional e condicionada à visibilidade, preferência de movimento e orçamento de CPU/bateria**. Não impor movimento perpétuo: se a simulação não acrescentar compreensão ou prejudicar desempenho, estabilizar e pausar.

### 3.1 Modelo de Forças Físicas

A simulação é regida por quatro forças principais resolvidas a cada passo de integração:

1. **Repulsão Eletrostática de Muitos Corpos (Coulomb Repulsion)**:
   - Afasta os nós para evitar sobreposições e criar distribuição uniforme no plano.
   - Fórmula com fator de amortecimento para proximidade extrema ($\epsilon$):
     $$\vec{F}_{\text{rep}}(i, j) = \frac{k_{\text{rep}} \cdot q_i \cdot q_j}{\|\vec{r}_{ij}\|^2 + \epsilon} \cdot \hat{r}_{ij}$$
   - Onde $q_i$ é a carga do nó (proporcional ao seu grau de conexão $\text{deg}(i)$ e raio visual).

2. **Atração Elástica por Vínculo (Hooke's Spring Law)**:
   - Mantém nós conectados próximos uns aos outros ao longo de uma distância de repouso $L_0$:
     $$\vec{F}_{\text{spring}}(i, j) = -k_{\text{spring}} \cdot (\|\vec{r}_{ij}\| - L_0) \cdot \hat{r}_{ij}$$
   - Vínculos entre entidades hierárquicas principais (ex: Concurso $\leftrightarrow$ Edição) têm rigidez maior que vínculos periféricos (ex: Questão $\leftrightarrow$ Tag).

3. **Gravidade Central (Centering Pull)**:
   - Uma força atrativa sutil em direção ao centro do canvas $(cx, cy)$ para impedir que componentes desconexos flutuem indefinidamente para o infinito:
     $$\vec{F}_{\text{center}}(i) = -k_{\text{center}} \cdot (\vec{p}_i - \vec{c})$$

4. **Arrasto & Amortecimento Viscoso (Damping)**:
   - Reduz a velocidade linear gradualmente a cada passo de tempo para dissipar energia cinética:
     $$\vec{v}_{t+1} = \vec{v}_t \cdot (1 - \gamma)$$
   - Onde $\gamma \in [0.04, 0.08]$ fornece um amortecimento suave e orgânico sem oscilações violentas.

### 3.2 Integração Numérica (Velocity Verlet)

Em vez de simples Euler explícito (suscetível a explosões numéricas quando nós colidem), a simulação utiliza o integrador **Velocity Verlet**:

```javascript
// Passo de integração Verlet
function stepVerlet(node, dt, fx, fy, damping) {
  // Aceleração resultante
  const ax = fx / node.mass;
  const ay = fy / node.mass;

  // Atualização de posição com base na velocidade e aceleração anteriores
  node.x += node.vx * dt + 0.5 * ax * dt * dt;
  node.y += node.vy * dt + 0.5 * ay * dt * dt;

  // Atualização de velocidade amortecida
  node.vx = (node.vx + ax * dt) * (1 - damping);
  node.vy = (node.vy + ay * dt) * (1 - damping);
}
```

### 3.3 Target de Alfa Contínuo (Continuous Living Graph)

Diferente de implementações que desligam a animação assim que `alpha < 0.012`, o grafo mantém um **patamar mínimo de vitalidade orgânica**:

1. **Meta de Alfa Dinâmica (`alphaTarget`)**:
   - Durante carregamento inicial ou arrasto: `alphaTarget = 0.3` a `1.0`.
   - Em repouso (equilíbrio dinâmico): `alphaTarget = 0.003`.
   - A simulação decai exponencialmente em direção a `alphaTarget`:
     $$\alpha_{t+1} = \alpha_t + (\alpha_{\text{target}} - \alpha_t) \cdot \lambda$$
     com taxa de adaptação $\lambda = 0.02$.
2. **Micro-flutuações Brownianas Sutis**:
   - No patamar de equilíbrio (`alpha <= 0.005`), uma força estocástica infinitesimal ($\sim 10^{-4}\,\text{px}$) mantém os nós com um movimento de "respiração" sutil, similar ao comportamento dos nós no Obsidian Graph View.
3. **Reaquecimento Térmico por Interação**:
   - `pointermove` (hover sobre um nó): eleva `alpha` temporariamente para `0.1` nos nós vizinhos, realçando a cadeia de conexões.
   - `drag` (arrastar nó): fixa o nó sob o cursor (`vx = vy = 0`), eleva `alpha` para `0.45` e propaga energia para a vizinhança conectada.
   - `pan` / `zoom`: reaquece levemente para `0.05` para garantir nitidez de renderização sem travamentos.
4. **Governança de CPU e Bateria**:
   - Se o canvas não estiver visível na viewport (aba em segundo plano ou `display: none`), o loop de `requestAnimationFrame` é pausado imediatamente (`cancelAnimationFrame`) para economizar 100% de CPU.
   - Retoma automaticamente assim que a visibilidade for restaurada (`document.visibilityState === 'visible'`).

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

**Nota de migração:** o protótipo atual pode conter um reset global de animações. Não o substituir automaticamente sem auditoria; ao implementar componentes, preferir desativação **direcionada** de movimento espacial, mantendo estado/feedback visíveis e verificando CSS, JS e canvas. Testar alterações de preferência durante a sessão.

### 4.1 Comportamento do Grafo sob Movimento Reduzido

Quando a media query `(prefers-reduced-motion: reduce)` estiver ativa:
1. **Pré-cálculo Síncrono Estático**:
   - Calcular um layout inicial estável sem bloquear a primeira pintura; usar orçamento de tempo, lotes ou Worker quando necessário. **Não** impor 400 iterações síncronas como requisito.
2. **Congelamento Imediato**:
   - `alpha` é definido como `0`, e `alphaTarget = 0`.
   - Todas as velocidades $\vec{v}$ são zeradas (`node.vx = node.vy = 0`).
   - O loop contínuo de `requestAnimationFrame` **não é iniciado**.
3. **Interações Estáticas**:
   - Arrastar um nó move apenas as coordenadas fixas daquele nó, redesenhando um único quadro sob demanda (`draw()`) sem propagação de oscilações elásticas para o restante da rede.
