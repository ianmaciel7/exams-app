# Exam App — Motion & Continuous Physics Specification (`MOTION.md`)

Este documento especifica os princípios de movimento, curvas de aceleração (*easing*), tokens de duração e a física contínua para o grafo de conhecimento e microinterações da interface do **Exam App**.

---

## 1. Princípios de Movimento

O design de movimento no Exam App serve para guiar o olhar, fornecer feedback físico imediato e preservar o modelo mental do estudante durante a navegação entre conteúdos densos.

1. **Naturalidade & Física Orgânica**:
   - Elementos em movimento possuem inércia, massa aparente e desaceleração suave.
   - Nada se move em velocidade estritamente linear (`linear`), exceto loaders indeterminados de rotação contínua.
2. **Responsividade Imediata (Zero Latência Percebida)**:
   - A resposta visual a interações diretas (clique em aba, seleção de alternativa, arrastar de nós) ocorre no primeiro quadro após a ação (< 16ms a 60fps / < 8ms a 120fps).
3. **Continuidade Espacial**:
   - Elementos não desaparecem nem surgem abruptamente; eles expandem, deslizam ou esmaecem suavemente a partir de sua origem contextual (ex: menus surgem do botão âncora; modais emergem com leve escala).
4. **Respeito Cognitivo**:
   - Animações nunca devem bloquear a produtividade ou impor esperas forçadas ao usuário.
   - Não há animações comemorativas excessivas que distraiam o estudante durante sessões de simulado.

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

O grafo interativo de conexões do Exam App (nós de concurso, órgão, cargo, edital e questão) é inspirado na experiência do **Obsidian** e **Capacities**. Ele abandona o modelo rígido de congelamento prematuro (`alpha < 0.012 -> stop`) em favor de uma **física contínua, orgânica e fluida com consumo otimizado de energia**.

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

Em conformidade rigorosa com o critério WCAG 2.2 2.3.3 (Animation from Interactions), o Exam App honra as preferências do sistema operacional do usuário.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 4.1 Comportamento do Grafo sob Movimento Reduzido

Quando a media query `(prefers-reduced-motion: reduce)` estiver ativa:
1. **Pré-cálculo Síncrono Estático**:
   - O grafo executa 400 iterações matemáticas completas em bloco síncrono antes do primeiro frame de pintura.
2. **Congelamento Imediato**:
   - `alpha` é definido como `0`, e `alphaTarget = 0`.
   - Todas as velocidades $\vec{v}$ são zeradas (`node.vx = node.vy = 0`).
   - O loop contínuo de `requestAnimationFrame` **não é iniciado**.
3. **Interações Estáticas**:
   - Arrastar um nó move apenas as coordenadas fixas daquele nó, redesenhando um único quadro sob demanda (`draw()`) sem propagação de oscilações elásticas para o restante da rede.
