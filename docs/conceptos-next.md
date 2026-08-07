# Conceptos de Next.js/React/Prisma — ya explicados

Referencia de conceptos ya cubiertos, para no repetir de cero (pero sí refrescar si hace falta). Separado de
`PROGRESS.md` porque es la parte que más vale como consulta sola, sin el ruido del estado del proyecto. Ver
`PROGRESS.md` para el estado actual y `docs/bitacora-fases.md` para el detalle de qué se hizo y qué errores
se cometieron en cada fase.

## Conceptos ya explicados (no repetir de cero, pero se puede refrescar)

- **Qué es un ORM / qué es Prisma**: contraste concreto contra el `db.query("select * FROM categorias")` con
  `mysql2` del backend viejo — tipado, typos detectados en el editor, una sola fuente de verdad.
- **Las 3 piezas de Prisma**: `schema.prisma` (la fuente de verdad), Prisma Client (el objeto `prisma` para
  queries, generado), Prisma Migrate (la CLI que sincroniza la base).
- **Qué es un `model`**: la palabra clave de la Prisma Schema Language, equivalente a un `CREATE TABLE`.
  De un `model` salen dos cosas en direcciones opuestas: el SQL hacia la base, y los tipos + métodos de TS
  hacia el código.
- **Sintaxis de campos, completa**: las 3 ranuras (nombre / tipo / atributos); tipos base; modificadores
  `?` (opcional — ojo, en Prisma todo es obligatorio por default, al revés que SQL) y `[]` (lista);
  `@` = campo vs `@@` = modelo; `@id`, `@default(autoincrement())`, `@map`, `@@map`, `@db.VarChar`
  (y el dato de que ese `db` es el nombre del bloque `datasource`, no una palabra mágica).
- **Relaciones**: se declaran de los dos lados. El lado lista (`productos Producto[]`) es virtual, no es
  columna; el lado con `@relation(fields: [...], references: [...])` es el que tiene la FK real.
- **Qué dependencias del backend viejo ya no van** y por qué: `express` (Next es el servidor), `cors` (ya no
  hay dos orígenes distintos), `dotenv` en runtime (Next lo lee solo), `mysql2` (lo reemplaza Prisma).
  Sí van a hacer falta más adelante: `bcrypt` y `jsonwebtoken`, en la fase 6 (auth).
- **El lado "espejo" de una relación** (`productos Producto[]` en `Categoria`): no es columna, es
  navegación virtual; existe porque Prisma exige declarar la relación en ambos modelos. El lado con
  `@relation(fields:..., references:...)` es el dueño real de la FK; el otro lado es de solo lectura.
- **`onDelete` completo**: `Restrict` (bloquea el borrado del padre con hijos — el default implícito de
  InnoDB, lo escribimos explícito igual porque documenta una decisión de diseño), `Cascade` (borra en
  cascada, usado en `clientes→pedidos`), `SetNull` (requiere campo opcional), `NoAction`.
- **Convención de nombres del Prisma Client generado**: `model Producto` → se usa como `prisma.producto`
  (camelCase) para queries, pero el tipo TS exportado sigue siendo `Producto` (PascalCase) para anotar
  variables/parámetros.
- **`npx prisma validate`** (chequea sintaxis del schema) y **`npx prisma format`** (autoalinea columnas,
  cosmético) como comandos de rutina mientras se escribe el schema.
- **Server Components**: todo componente en `src/app/` es Server Component por default (se ejecuta en el
  servidor, sin JS de más al cliente, puede hacer `await prisma....` directo). Client Component (necesita
  `useState`/`onClick`/APIs de navegador) requiere `"use client"` como primera línea del archivo — ya usado
  en `HeroCarousel.tsx`, ver el detalle ampliado en los conceptos del 2026-08-03 más abajo.
- **Regla de JSX mayúscula/minúscula**: minúscula (`div`, `nav`, `link`) = tag HTML nativo; mayúscula
  (`Link`, `Image`, `Navbar`) = JSX busca una variable en scope (importada o definida) y la renderiza como
  componente. Ligado al concepto de **scope**: una variable solo existe donde fue declarada/importada hacia
  abajo en ese archivo.
- **`<Link href="...">`** (`next/link`) reemplaza `<a>` para links internos, navegación sin recarga completa.
  **`<Image src="..." width height />`** (`next/image`) reemplaza `<img>`, requiere `width`/`height`
  explícitos, optimiza automático.
- **Anclas `#id`**: comportamiento del navegador, no de Next — `href="/#nosotros"` combina ruta (`/`) +
  fragmento (`#nosotros`, un `id` en algún elemento de esa página) para hacer scroll automático ahí.
- **`layout.tsx` y `{children}`**: el layout envuelve todas las rutas debajo suyo; `{children}` es una prop
  que Next llena dinámicamente con el `page.tsx` de la ruta actual (una por vez, no todas juntas). Layouts
  pueden anidarse (no usado todavía, solo el root layout existe). Beneficio extra sobre simplemente duplicar
  código: al navegar entre rutas que comparten layout, el layout NO se vuelve a montar (el navbar no
  parpadea/reinicia).
- **Tailwind, gotcha importante**: una clase mal escrita (typo) no tira ningún error, simplemente no aplica
  ningún estilo — a diferencia de un error de sintaxis de TS/Prisma, esto es silencioso y hay que
  detectarlo a ojo comparando con lo esperado. Ya pasó **4 veces**: `intems-center`, `md:flex-row` sin
  `flex`, `text-5x1` (número 1 en vez de letra ele) y `max-2-6xl` en vez de `max-w-6xl`. **Es la fuente de
  bugs #1 del proyecto** — ante cualquier estilo que "no se aplica", revisar el spelling de la clase antes
  que nada. Truco de diagnóstico que ya se usó: asociar cada clase con su síntoma visible (ej. sin
  `max-w-*`, el `mx-auto` no centra nada porque no hay ancho sobrante que repartir → el texto se estira de
  punta a punta). **Update 2026-08-04**: en Especialidades escribió 7 tandas de clases sin **un solo** typo
  — el hábito parece estar agarrando, pero sigue siendo lo primero a revisar ante un estilo que no aplica.

### Agregados el 2026-08-03 (fase 3: footer + hero)

- **Por qué JSX y no HTML** — explicado con contraste concreto contra su propio `frontend/js/categorias.js`
  (el `fila.innerHTML = \`...\`` dentro del `forEach`): HTML solo expresa lo que se sabe de antemano, así que
  para datos dinámicos él **ya estaba escribiendo código que genera HTML**, solo que como string opaco
  (sin validación de tags, sin tipado, con `innerHTML = ""` manual, con `data-id` + reconexión de listeners
  aparte, y con riesgo de XSS). JSX es lo mismo pero que el compilador entiende como estructura. De ahí
  **declarativo vs imperativo**: describís cómo se ve la UI para un estado dado, en vez de dictar los pasos
  de la mutación del DOM.
- **Las llaves `{}` en JSX** = "la puerta de vuelta a JavaScript". Comillas = string literal, llaves =
  expresión JS evaluada. Sirve en atributos (`width={140}`) y en contenido (`{producto.nombre}`). Se conectó
  con el `{children}` del layout, que ya venía usando sin saber por qué. Mencionado el `style={{...}}` de
  doble llave (llaves de JS + objeto literal) aunque todavía no se usó.
- **Client Components**: `"use client"` como primera línea. Los dos motivos concretos por los que el
  carrusel lo necesita (recordar algo que cambia después de cargar la página; y el `onClick`, que es una
  función y no se puede serializar en HTML). Aclarados los dos malentendidos típicos: **no** significa "no
  se renderiza en el servidor" (se renderiza igual para el HTML inicial), y **es contagioso hacia abajo**
  (lo que importes desde un Client Component también se vuelve cliente) → por eso conviene ponerlo lo más
  abajo posible en el árbol. Un Server Component **sí puede** renderizar un Client Component (`page.tsx`
  renderizando `<HeroCarousel />`); al revés no, sin cuidados especiales.
- **`useState`**: por qué una variable común no sirve (el componente es una función que React re-ejecuta;
  una variable normal ni sobrevive al re-render ni avisa que cambió). Devuelve un array de 2 que se desarma
  con destructuring: valor actual + función setter. El setter hace dos cosas: guarda y **dispara el
  re-render**. Nunca asignar directo.
- **Handlers de eventos**: `onClick` recibe **una función, no una llamada**. `onClick={siguiente}` (sin
  paréntesis) pasa la referencia; `onClick={() => setActual(...)}` usa la flecha para **diferir** la
  ejecución. `onClick={siguiente()}` la ejecutaría durante el render → loop infinito.
- **Índices fuera de rango en JS**: `imagenes[-1]` o `imagenes[3]` devuelven `undefined` **sin error**; el
  crash aparece una línea después al hacer `.src`, o sea el stack trace apunta a otro lado que el problema
  real.
- **`===` vs `==`**: `==` convierte tipos (`"1" == 1` → true). Convención: siempre `===`.
- **Breakpoints de Tailwind**: `md:` etc. son **`min-width`**, "de ese ancho para arriba", no un tipo de
  dispositivo — `md:` también aplica en `lg`, `xl`, etc. Por eso Tailwind es mobile-first: el caso chico sin
  prefijo, los grandes con prefijo pisándolo. Nunca al revés. Tabla: `sm` 640 / `md` 768 / `lg` 1024 /
  `xl` 1280 / `2xl` 1536. Se conectó con el `col-md-*` de Bootstrap, que ya usaba el mismo concepto.
- **Escala de espaciado de Tailwind**: cada unidad = `0.25rem` (número ÷ 4 = rem). Aplica a `m`, `p`, `gap`,
  `space-y`. **Ojo**: Bootstrap y Tailwind usan los mismos nombres con valores distintos (`py-5` = 3rem en
  Bootstrap vs 1.25rem en Tailwind) — no se copian los números tal cual al traducir. Notación arbitraria
  `h-[60vh]` / `mt-[70px]` para lo que no está en la escala, a usar con moderación.
- **Box model — margin vs padding respecto a un borde**: el borde es la frontera, `margin` empuja desde
  afuera y `padding` desde adentro. Sin `border`/`bg` la diferencia no se ve; con `border-t` sí.
- **`fill` vs `object-cover` (no son lo mismo, costó)**: `fill` (prop de `next/image`) decide **el tamaño**
  — la imagen ocupa todo el contenedor, vía `position:absolute`, y por eso el contenedor necesita `relative`
  + altura. `object-cover` (CSS puro) decide **cómo se acomoda el contenido adentro de esa caja** —
  recortarse en vez de deformarse. Analogía que funcionó: `fill` es el tamaño del marco, `object-cover` es
  cómo recortás la foto para que entre. Prueba empírica: sacar uno u otro da resultados distintos.
  Confusión de nombres a tener presente: la prop `fill` de next/image ≠ `object-fit: fill` de CSS.
- **Apilado de elementos (stacking)**: los elementos **posicionados** (`relative`/`absolute`/…) se pintan
  **encima** de los `static`, sin importar el orden en el DOM — por eso la `<Image fill>` tapaba el botón y
  se comía los clics. Entre dos posicionados gana el que va **después en el DOM** → ordenando bien
  (imagen → overlay → texto → botones) no hizo falta un solo `z-index`.
- **`pointer-events-none`**: "visible pero invisible al mouse, los clics me atraviesan". Necesario en el
  overlay, que tiene que estar encima sí o sí y si no se comería los clics de los botones.
- **Centrado de elementos posicionados**: `top-1/2` + `-translate-y-1/2` (y el par en X). El `top-1/2` mide
  hasta el borde superior del elemento, el `translate` compensa la mitad de su propia altura — funciona sin
  saber cuánto mide.
- **`bg-black/40` vs `opacity-40`**: la barra aplica opacidad **al color**; `opacity` la aplica al elemento
  **y a todos sus hijos**. Para transparentar un fondo, siempre `bg-color/N`.
- **`images.remotePatterns` en `next.config.ts`**: `next/image` bloquea dominios externos por defecto (para
  que nadie use tu servidor para optimizar imágenes ajenas); hay que declararlos. Dos formas: `new URL(...)`
  o el objeto `{protocol, hostname, pathname}`. Comodines: `*` = un segmento, `**` = cualquier cantidad.
  El hostname tiene que ser exacto (`www.clarin.com` ≠ `clarin.com`).

### Agregados el 2026-08-03, segunda sesión (fase 3: sección Nosotros)

- **Cómo funcionan realmente las anclas `#id`** (lo volvió a preguntar: "¿cómo sabe Next a dónde apunta?").
  La clave que faltaba: **Next no sabe nada, lo hace el navegador**. El navegador parte la URL en ruta +
  fragmento y los trata distinto — la ruta sale a la red, el fragmento **nunca sale**, es 100% del lado del
  cliente. La conexión es literalmente **string matching entre el `href` y el atributo `id`**; si no
  matchea, no hay error ni warning, simplemente no pasa nada (otro caso silencioso). Los `id` tienen que ser
  únicos en el documento — por eso sirve `id` y no `class`. Único lugar donde Next mete mano: en la
  navegación con `<Link>` entre rutas no hay recarga real, así que no existe el evento "terminé de cargar"
  donde el navegador scrollearía → Next hace ese scroll por su cuenta después de renderizar.
- **Un componente devuelve UNA sola cosa** — es JS puro: `return` devuelve un valor, no podés devolver dos
  elementos hermanos sueltos (igual que no podés hacer `return 1, 2`). Error que aparece:
  *"Adjacent JSX elements must be wrapped in an enclosing tag"*. Dos salidas: un tag real (`<main>`,
  `<div>`) o un **Fragment** `<>...</>`, un envoltorio invisible que no genera ningún elemento en el HTML
  final (para agrupar sin ensuciar el DOM).
- **Props = un solo objeto, y TypeScript chequea su forma.** Costó, se explicó dos veces (la segunda desde
  cero, que fue la que funcionó). El puente conceptual: `<Image src="..." />` se convierte más o menos en
  `Image({ src: "..." })` — los atributos del tag se juntan **en un objeto** que es el único argumento.
  El tipo declara qué claves lleva ese objeto, y el `?` es el **único** diferenciador entre obligatoria y
  opcional (`alt: string` vs `width?: number`). El error no tiene nada de React ni de Next: es el mismo que
  daría `saludar({ edad: 30 })` con `function saludar(p: { nombre: string; edad?: number })`. Consejo
  práctico que se le dio: **pasar el mouse por el subrayado rojo y leer el mensaje** — casi siempre dice
  literal `Property 'X' is missing in type ... but required in type ...`.
- **TypeScript vs. runtime: son DOS controles distintos en momentos distintos.** Concepto importante que
  salió de un error real: al poner solo `alt` el rojo desapareció, pero la página igual explota. En
  `next/image` **solo `alt` es obligatoria en el tipo** (`node_modules/next/dist/shared/lib/get-img-props.d.ts:15-19`
  — `width?`/`height?` llevan `?`), y sin embargo Next las exige igual, tirando el error recién al ejecutar
  (`get-img-props.js:340`: `Image with src "..." is missing required "width" property.`). El motivo del
  diseño: "width es obligatorio salvo que hayas puesto `fill`" es una regla condicional entre props —
  expresable en TS con uniones, pero con mensajes de error horribles, así que Next eligió runtime.
  **Moraleja general: que no haya subrayado rojo no significa que ande.** El navegador es el juez final.
- **Por qué `width`/`height` son obligatorias** en `next/image`: Next necesita la proporción **antes** de
  descargar la imagen para reservarle el lugar y evitar el *layout shift* (que el contenido de abajo salte
  cuando la imagen carga). Son las dimensiones **intrínsecas**, el tamaño visual final se cambia igual por
  CSS. Y tienen que respetar la proporción real del archivo o la imagen sale deformada. `alt` es
  obligatoria por accesibilidad (`<img>` de HTML te deja omitirla, `next/image` no).
- **Método de trabajo que ya está funcionando bien: escribir por capas.** Primero el esqueleto de tags sin
  una sola clase (se le da el árbol de anidación en prosa/ASCII), se verifica en el navegador que se vea
  "apilado y feo", y recién después las clases de Tailwind **div por div, explicando qué trabajo hace cada
  uno**. Se usó en el Footer y en Nosotros, con buen resultado. Corolario que se le explicó: 3 `<div>`
  anidados no es de más — cada uno hace **un** trabajo distinto (limitar ancho / hacer la fila / ser celda),
  y mezclarlos en uno es lo que después no se entiende.

### `.map()` y `key` — ✅ EXPLICADO Y PRACTICADO (escrito el 2026-08-04 en Especialidades)

Se explicó el 2026-08-03 y se escribió el 2026-08-04. Lo que se le dijo, para referencia:

- **El problema**: 5 tarjetas idénticas en estructura, distintas solo en imagen y título. Copiar/pegar 5
  veces = cambiar un detalle en 5 lugares. Y los datos algún día vienen de la base, donde ni siquiera sabés
  cuántos son al escribir el código.
- **El puente con lo que ya sabe**: es el mismo problema que resolvía con
  `categorias.forEach(cat => fila.innerHTML += \`<tr>...\`)` en `frontend/js/categorias.js` — recorrer un
  array y armar HTML. La versión de React es la misma idea pero **produciendo elementos** en vez de pegar
  strings.
- **`.map()` en JS pelado**: método de array, aplica una función a cada elemento y devuelve un **array
  nuevo** (no toca el original). La función puede devolver lo que sea, incluido JSX → te queda un **array
  de elementos**.
- **En JSX un array se renderiza solo**: React lo desarma y pinta los elementos como hermanos. Se apoya en
  las llaves `{}` (la puerta de vuelta a JS) y en que adentro va **una expresión**. Por eso en React se usa
  `.map()` y no `for`: un `for` es una *sentencia*, no devuelve un valor, no se puede poner entre llaves.
- **La prop `key`**: warning típico *"Each child in a list should have a unique key prop"*. Motivo: cuando
  la lista cambia, React compara la versión vieja con la nueva para tocar el DOM lo menos posible; sin
  identificador solo puede comparar por posición, y si insertás algo al principio cree que cambiaron todos.
  Va en el elemento **más externo** que devuelve el `.map()` y tiene que ser única entre hermanos. Con datos
  de la base va a ser el `id`; en las especialidades alcanza con el `nombre` porque no se repite.

### Agregados el 2026-08-04 (fase 3: sección Especialidades)

- **Nombres impuestos vs. nombres inventados.** Confusión real que tuvo: creía que llamar `alt` a una clave
  de **su** objeto la convertía sola en el `alt` de la imagen. La explicación que funcionó fue la línea 44
  del HeroCarousel, `alt={imagenes[actual].alt}`: **hay dos `alt` en esa línea y no son la misma cosa** — el
  de la izquierda es una prop definida por `next/image` (nombre impuesto, si escribís otro no hace nada), el
  de la derecha es una clave de su propio objeto (nombre libre). Nada es automático, el puente lo escribe él.
  Límites del nombre libre: tiene que leerse igual que se escribió (si no, `undefined` silencioso — TS lo
  detecta y autocompleta), y con espacios/guiones hay que usar comillas + `obj["..."]` en vez del punto.
- **Cómo elegir el nombre de un campo**: por lo que el dato **es**, no por uno de los lugares donde se usa.
  Y el argumento decisivo, que es práctico y no estético: si ya sabés cómo se va a llamar el campo cuando
  venga de la base (`nombre` en el schema de Prisma), usalo desde ahora y el JSX no se retoca en la fase 4.
- **`.map()`: la dirección del flujo.** Lo confirmó al revés ("map crea un array y podemos ejecutar una
  función según ese array"). Corrección: la **función es el ingrediente** y el array nuevo es el
  **resultado** — `.map()` recorre el original, ejecuta tu función con cada elemento, junta lo devuelto, y
  *eso* es el array nuevo. Entran 5 objetos, salen 5 `<div>`.
- **Expresión vs. sentencia** — el concepto de fondo del "¿por qué `.map()` y no `for`?", y vale para todo
  React. Precisión importante que se le dio: **un `for` sí puede hacerlo** (`const t = []; for (...)
  t.push(<div/>)` y después `{t}`), no es incapaz. El punto es **dónde se puede escribir**: entre las llaves
  de JSX tiene que ir algo que **tenga un valor**. `.map()` devuelve un array → sirve inline. Un `for` hace
  cosas pero él mismo no *es* nada → no hay nada que React pueda tomar (como intentar `const x = for (...)`).
  Expresiones: `.map()`, `a.b`, `2+2`, ternario. Sentencias: `for`, `while`, `if`, `return`.
- **El parámetro del `.map()` existe sin estar declarado en ningún lado** — no hay ningún `const e = ...`.
  Es el parámetro de la función; `.map()` lo va llenando solo, uno distinto por vuelta, y solo existe dentro
  de esa función (scope).
- **Flecha con `(` vs con `{`**: `=> (` devuelve directo lo que sigue; `=> {` abre un **bloque** y entonces
  hace falta `return` explícito o la función no devuelve nada → lista invisible **sin ningún error**. Las dos
  formas son válidas, lo que importa es que los cierres coincidan (`))}`  vs `})}`). Los tres cierres
  seguidos son lo que más lo marea: `)` de la flecha + `)` del `.map(` + `}` de las llaves de JSX.
- **Errores de sintaxis en cascada: el causante está una línea ANTES del primer error reportado.** Caso real
  y muy didáctico: le faltó el `>` de la flecha en la línea 71 y `tsc` tiró **12 errores, ninguno en la 71**
  (el primero en la 72, y mensajes que no tenían nada que ver: `Property assignment expected`,
  `Expected corresponding JSX closing tag for 'section'`). Explicación: al leer `= {` el parser concluyó
  "me asignan un objeto literal" y a partir de ahí interpretó mal todo lo que siguió. **Regla: ante una
  catarata de errores, mirar la línea anterior al primero y arreglar de a uno.** Comando usado:
  `npx tsc --noEmit`, que conviene tener a mano como chequeo rápido de todo el proyecto.
- **La flecha son dos caracteres**, `=` y `>`. Sin el `>` no es una función, es una asignación.
- **`;` adentro del JSX = texto literal.** Escribió `})};` y `tsc` salió limpio, pero React pinta un `;` en
  la página. El `;` cierra una **sentencia** de JavaScript; adentro de un `return ( ... )` no hay sentencias,
  hay una expresión de JSX. Otro caso silencioso para la colección.
- **`grid` vs `flex`** (primera vez que usa grid; hasta ahora todo era flexbox). La distinción que se le dio:
  **flex** = "poné estos elementos en una fila/columna y que cada uno ocupe lo que necesite", pensás en la
  *dirección*; **grid** = "esta caja tiene N columnas, los hijos caen en ellas y saltan de fila solos",
  pensás en la *estructura* y los hijos no deciden nada. Para N tarjetas iguales alineadas, grid es directo;
  con flex habría que pelear con `flex-wrap` y anchos. `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5`,
  mobile-first como siempre, y **`grid` tiene que estar o las clases de columnas no hacen nada** (misma
  trampa que `md:flex-row` sin `flex`, que ya se comió una vez). `gap-4` funciona igual que en flex, en
  los dos ejes. Traducción del original: `col-6 col-md-4 col-lg-2` de Bootstrap → 6/12 = 2 columnas,
  4/12 = 3, y se eligió 5 en vez de 6 porque son 5 tarjetas.
- **Multi-cursor en VS Code** (lo pidió él para renombrar las 5 claves): `Cmd+D` agrega cursor en la
  siguiente aparición idéntica, `Cmd+Shift+L` todas de una, `Cmd+K Cmd+D` saltea una, `Option+Click` cursor
  libre, `Option+Cmd+↑/↓` en columna, `Escape` vuelve a uno. Advertencia concreta que le sirvió:
  **seleccionar lo justo para que sea inequívoco** — buscar `alt` a secas también agarraba el
  `alt="Sanguche de milanesa ElMasRico"` de Nosotros, mientras que `alt:` (con los dos puntos) no.
  Y se le señaló que para renombrar en serio el correcto es **`F2`** (Rename Symbol), que usa TypeScript
  para entender qué es el símbolo y no toca strings ni comentarios que casualmente coincidan.
  También `Option+Shift+F` para formatear el archivo y arreglar la indentación.

### Agregados el 2026-08-04, segunda parte (fase 4: la Carta)

- **Server Component `async` + base de datos directo** — el concepto central de la fase. `export default
  async function Carta()` con `await prisma....` como primera línea. Se le señaló que esto era **imposible**
  en su proyecto viejo: ahí necesitaba endpoint de Express + `useEffect` + `axios` + estado de loading. Acá
  el componente se ejecuta en el servidor, espera los datos y devuelve HTML ya armado. Verificado contra la
  doc instalada: `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md` (sección
  "With an ORM or database").
- **Routing por carpetas**: carpeta = segmento de URL, y adentro un archivo con **nombre reservado**.
  `src/app/carta/page.tsx` → `/carta`. La carpeta define la URL, `page.tsx` es el nombre que Next busca
  (`carta.tsx` o `index.tsx` darían 404). Corolario que le sirvió: un archivo en `src/app/` que no se llame
  `page.tsx` **no crea ninguna ruta**.
- **Los layouts se ANIDAN, no se reemplazan.** Preguntó si un `layout.tsx` dentro de `carta/` "mostraría ese
  children" y usó la expresión "el layout más cercano" — la corrección importante es que aplican **todos**,
  de afuera hacia adentro: `app/layout.tsx` envuelve a `app/carta/layout.tsx` que envuelve a la página. El
  navbar y el footer **siguen estando**. Confirmado en
  `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md:180`. Caso de uso concreto
  que se le dio: el sidebar del dashboard en la fase 7/8 (`app/dashboard/layout.tsx`), que además **no se
  remonta** al navegar entre rutas hermanas. Detalles: solo el layout raíz lleva `<html>`/`<body>`; un
  `layout.tsx` no es obligatorio (se hereda el de arriba).
- **Exports con nombre reservado**: `metadata`, `dynamic`, `revalidate`. No se importan ni se llaman — se
  exportan y Next los busca por nombre en `page.tsx`/`layout.tsx`. El `metadata` de una página pisa el del
  layout.
- **`include` = el JOIN, pero el valor está en la FORMA.** Preguntó "¿el include hizo un join?" y la
  respuesta completa fue: sí conceptualmente, pero un JOIN a mano devuelve una **tabla plana** con la
  categoría repetida en cada fila, y él necesitaba **4 objetos con un array adentro**. Alguien tiene que
  hacer esa transformación plano→anidado: en su proyecto viejo con `mysql2` la hacía a mano agrupando por
  `id_categoria`; Prisma la hace sola. **Eso es la mitad de lo que se paga por usar un ORM.**
  - Matiz honesto que se le dijo: el SQL real puede ser un JOIN o **dos queries** cosidas en JS, según la
    versión de la base (el adapter chequea la versión al conectarse). No hace falta adivinar → `log`.
- **`log: ["query"]`** en el constructor del `PrismaClient` imprime el SQL real en la terminal del servidor
  (no en la consola del navegador). Se le presentó como la herramienta para auditar un ORM y para cazar el
  clásico N+1. Lo probó y decidió sacarlo; sabe que está ahí.
- **`productos: true` vs `productos: { ... }`** dentro de `include`: el `true` es el atajo "traelo y listo";
  la forma objeto permite configurar (ordenar, filtrar, elegir campos).
- **Sin `ORDER BY` no hay orden garantizado.** Muy buen caso real: el volcado salió alfabético (Hamburguesas,
  Minutas, Pizzas, Sanguches) pero los ids eran 10, 8, 9, 7 — o sea no era orden de id ni de creación, la
  base eligió lo que le convino (probablemente el índice del `@unique` en `nombre`). **Trampa clásica:
  funciona en tu máquina, parece ordenado, y un día cambia sin que nadie toque nada.** Regla: si el orden
  importa, pedilo. `orderBy: { nombre: "asc" }`, y en el `include` va otro `orderBy` anidado para el nivel
  de adentro.
- **`Decimal` no es un número ni un string** (verificado en `src/generated/prisma/models/Producto.ts:187`:
  `precio: runtime.Decimal`). Aparece como `"12000"` con comillas en el `JSON.stringify` porque el objeto
  sabe serializarse a string. El **por qué** que funcionó: los números de JS son floats binarios y
  `0.1 + 0.2 === 0.30000000000000004`, inaceptable con plata; de ahí el `Decimal @db.Decimal(10,2)` del
  schema. Tres consecuencias, todas prácticas:
  1. En JSX hace falta `.toString()` o React tira *"Objects are not valid as a React child"*.
  2. No se puede hacer `precio * 2` — el `Decimal` tiene `.mul()`, `.plus()`, o se convierte con `Number()`.
  3. **En la fase 5 mordió, pero NO como se había anticipado.** Ver la corrección completa en "Estado de la
     fase 5" — no hay crash, hay un `console.error` y una conversión silenciosa a string.
- **El singleton del Prisma Client y por qué existe.** El hot reload de dev reejecuta los módulos que
  cambiaron; si el `new PrismaClient()` viviera en la página, cada guardado abriría un **pool de conexiones
  nuevo** hasta que MySQL corte con `Too many connections`. Precisiones que hizo falta hacerle porque lo
  resumió como "un bug": (a) **no es un bug de Next ni de Prisma** — el bug sería su código; el hot reload
  hace lo que debe y no puede adivinar que ese objeto es caro; (b) **solo pasa en desarrollo** (de ahí el
  `if (NODE_ENV !== "production")`, en prod no hay recargas); (c) el archivo hace **dos** cosas, no una:
  evitar los clientes duplicados **y** ser el único lugar donde se configura la conexión (cambiar de base
  = tocar un archivo).
- **Boilerplate vs. lógica de la app** — meta-lección que preguntó explícitamente ("¿es copiar y pegar y
  entender qué hace nomás?") y que conviene mantener como criterio de trabajo: el `lib/prisma.ts` es
  infraestructura, se escribe una vez, está igual en miles de proyectos, y **no tiene valor poder escribirlo
  de memoria** — alcanza con saber que existe, que es el único lugar donde se instancia, y para qué está el
  `globalThis` (para reconocer el `Too many connections` cuando aparezca). La lógica de la app (queries,
  `.map()`, formularios, CRUD) sí tiene que poder escribirla solo. **No todo el código merece el mismo
  esfuerzo.**
- **`??` (nullish coalescing)**: "si lo de la izquierda es `null`/`undefined`, usá lo de la derecha". Se
  distinguió del `||`, que también cae a la derecha con `0` o `""`. Va a reaparecer con los campos
  opcionales (`Cliente.direccion` es `String?`).
- **`!` (non-null assertion)** y que **`process.env.CUALQUIERCOSA` siempre es `string | undefined`** para
  TypeScript. El `!` es "confiá, esto existe", con el costo de que si falta el error aparece en runtime.
- **`globalThis`**: el objeto global del proceso, existe una sola vez y **no se recrea** con el hot reload —
  de ahí el truco. El `as unknown as {...}` es un doble casteo necesario porque el tipo de `globalThis` no
  tiene ninguna propiedad `prisma`.
- **⚠️ HALLAZGO IMPORTANTE: Next prerenderiza la carta en el build por defecto.** Se le había afirmado que
  "cambiar un precio se refleja solo" y **eso era falso en producción**; se verificó con `npm run build` y
  la salida marcó `○ /carta` = *prerendered as static content*. O sea: Next ejecuta la query **durante el
  build** y congela el HTML. Motivo: Next prerenderiza todo lo que puede y busca señales de que la página
  necesita el momento de la request (cookies, headers, query params) — **una query a la base no es una de
  esas señales**. Efecto colateral: la base tiene que estar prendida para poder *buildear*.
  - Fix aplicable: `export const dynamic = "force-dynamic"` (render en cada request; el build pasa a
    marcar `ƒ`). Alternativa mejor para una carta real: `export const revalidate = 60` (ISR — estático pero
    regenerado como máximo cada 60s). **Se recomendó `force-dynamic` por ahora** para que en la fase 7 los
    cambios del dashboard se vean al instante sin pensar en cachés, y cambiarlo a `revalidate` al final.
  - Next 16 tiene un modelo nuevo (**Cache Components**, con `use cache` y PPR) pero es **opt-in**:
    requiere `cacheComponents: true` en `next.config.ts`, que el proyecto no tiene, así que aplica el
    modelo anterior. Docs: `01-app/01-getting-started/08-caching.md:17` y
    `01-app/02-guides/caching-without-cache-components.md`.
- **Nombres impuestos vs. inventados, segunda vuelta** (preguntó por qué `include: { productos: ... }` si la
  tabla es `productos` y el modelo `Producto`). La respuesta: ese `productos` es el **campo de relación**
  que él declaró en `model Categoria` (`productos Producto[]`) y **el nombre es libre** — podría ser
  `items` o `banana`. Lo pluralizó porque el tipo es una lista, no porque la tabla se llame así; que
  coincida con `@@map("productos")` es **casualidad**. Cadena de tres eslabones que cerró el tema:
  `c.productos` (campo, nombre suyo) → su tipo `Producto[]` apunta al **modelo** → el modelo tiene
  `@@map("productos")` que apunta a la **tabla**. El que sabe *cómo* unirlas es el `@relation` del lado de
  `Producto`, donde vive la FK. **Regla que se le dio: si dudás si un nombre lo elegiste vos, buscá dónde
  está declarado** — si está en tu schema o en tu objeto es tuyo; si viene de una librería (`findMany`,
  `include`, `src`, `alt`, `key`) es impuesto.
- **Los tres nombres de una tabla** (`Categoria` el modelo y el tipo TS / `prisma.categoria` para queries /
  `categorias` la tabla real vía `@@map`). Que el cliente baje **solo la primera letra** (`DetallePedido` →
  `prisma.detallePedido`) es una **convención del generador de Prisma**, no una regla de JS: sigue la
  convención de TS de PascalCase para tipos y camelCase para propiedades, y por eso los dos nombres
  coexisten. El plural está en el `findMany`, no en el modelo.
- **En un proyecto nuevo no hacen falta `@map`/`@@map`.** Preguntó si conviene nombrar las tablas igual para
  evitar el "quilombo". Sí: si la base la crea Prisma con `migrate`, los nombres coinciden porque Prisma los
  eligió. Los `@map` de este proyecto existen porque la base **ya existía** con convenciones de SQL
  (plural, snake_case) — y eso fue una **ventaja**: pudo apuntar a la base con los datos ya cargados sin
  migrar nada, que es el caso normal en el mundo real. Matiz: hay equipos que ponen `@@map` a propósito aun
  empezando de cero, porque la base la consumen también humanos por phpMyAdmin y reportes SQL a mano.
- **El `$` antes de las llaves en JSX es texto literal**, no interpolación de template string (esas van con
  backticks). `<span>${p.precio.toString()}</span>` renderiza `$12000`.
- **`<ul>`/`<li>` en vez de `<div>`** para una lista: más semántico, los lectores de pantalla la anuncian
  como lista. El Preflight de Tailwind le saca los puntitos y la sangría, así que visualmente no molesta.
- **Volcar los datos crudos antes de maquetar**: `<pre>{JSON.stringify(datos, null, 2)}</pre>`. El `<pre>`
  respeta saltos de línea y espacios; el `2` del `stringify` es la indentación. Es la forma más rápida de
  responder "¿qué tengo realmente acá?" antes de escribir JSX.
- **Ancho máximo según el contenido**: `max-w-3xl` para listas de texto vs `max-w-6xl` para secciones con
  fotos. Con 6xl, el nombre del producto y su precio quedaban separados por 1100px de nada.
- **`justify-between` reutilizado**: el mismo de la `<nav>` (logo vs links) resuelve el `<li>` de la carta
  (nombre a la izquierda, precio a la derecha). Y `whitespace-nowrap` para que un precio no se parta.
- **Multi-cursor / `F2`**: ver el detalle en los conceptos de Especialidades, más arriba.

### Agregados el 2026-08-04, segunda sesión (fase 5: form + Server Actions)

- **`npm run dev` vs `npm run build` vs `npm start` — laguna grande, no sabía que existía el build.**
  Vale la pena tenerlo presente porque **es lo que va a hacer Railway con LANCER** (clona, `npm install`,
  `npm run build`, `npm start` — nada más). Lo que lo destrabó: en su proyecto viejo **no existía ningún
  build** porque el navegador entendía sus `.html`/`.js` tal cual y el backend era `node index.js`; acá hace
  falta porque **TypeScript y JSX no los entiende ningún runtime**, alguien tiene que traducirlos.
  - `dev`: traduce al vuelo, re-traduce al guardar (hot reload), no optimiza, **re-renderiza todo en cada
    request** → por eso `force-dynamic` no se nota en desarrollo.
  - `build`: traduce todo de una a `.next/`, minifica, y **decide ruta por ruta si prerenderiza** (de ahí
    la tabla con `○` y `ƒ`, y por eso la query se ejecuta en ese momento).
  - `start`: solo sirve lo que quedó en `.next/`. No compila nada.
  - Dato práctico: **`next build` es un chequeo gratis** — corre TS y ESLint sobre *todo* el proyecto, a
    diferencia de `dev` que solo compila los archivos que visitaste. Más completo que `npx tsc --noEmit`.
- **Route segment config** (`dynamic`, `revalidate`, `metadata`, `runtime`): son config **de ruta**, no de
  componente. Next los busca **por nombre** únicamente en `page.tsx` / `layout.tsx` / `route.ts`. En
  cualquier otro archivo no hacen nada y no avisan (ver el error del HeroCarousel arriba).
  - Analogía que preguntó y **NO** aplica: *"¿es como un nodemon?"*. No: nodemon mira **archivos** y
    reinicia el proceso, es de desarrollo y no existe en producción; `force-dynamic` mira **requests**, no
    reinicia nada, y **solo importa en producción**. El nodemon de este proyecto es el hot reload que ya
    trae `next dev`.
- **Props, tercera explicación (la que funcionó).** Lo que destrabó fue separar *quién* de *qué*: el
  **componente** es el que pasa, la **prop es el dato pasado**. Diagrama que usó:
  `page.tsx ──categorias──► FormPedido`. Más las dos reglas de dirección: **siempre padre → hijo** (un hijo
  no le puede pasar props al padre) y **de ida nomás** (el hijo no modifica la prop). Ancla que ya tenía:
  `{children}` del layout **es** una prop.
  - Confusión aparte que hubo que aclarar: **el `import` y la prop van en direcciones contrarias.** El
    import trae *la función* hacia `page.tsx`; los datos van de `page.tsx` *hacia* el componente al
    renderizarlo. No hay ningún `export` de datos.
  - Y el clásico de la doble aparición del nombre: `function Form({ categorias }: { categorias: X[] })`.
    Lo leía como "categorias es de tipo categorias que es de tipo X". La corrección: el `{}` de la derecha
    **no es el tipo de `categorias`, es el tipo del objeto de props**, y `categorias` es una **clave**
    adentro. Lo que lo cerró fue escribirlo sin desarme:
    `function Form(props: { categorias: X[] }) { const categorias = props.categorias }` — ahí cada cosa
    aparece una sola vez.
- **⭐ Los tipos le cuestan "horrores" (dicho por él). El truco que se le dio:** *un tipo es el volcado del
  `<pre>` con los valores reemplazados por el nombre del tipo.* `7` → `number`, `"Sanguches"` → `string`,
  el array → `Algo[]`. Misma estructura, misma indentación. Más: **hover en VS Code muestra el tipo
  calculado** (casi nunca hace falta inventarlo), y la aclaración de por qué acá sí hubo que escribirlo a
  mano — **los datos cruzan Server→Client y TypeScript no puede seguirlos a través de ese salto**; en el
  95% del código no se escriben tipos.
- **`&` (intersección) y `Omit<X, "campo">`: explicados y después DESCARTADOS** a pedido suyo, junto con el
  spread. Quedó todo escrito explícito. También se le mostró `Prisma.CategoriaGetPayload<{ include: ... }>`
  (deriva el tipo de las mismas opciones de la query, no se puede desincronizar) y se descartó por opaco —
  **pero anotado como la opción correcta para LANCER**, donde los `include` de 3 niveles hacen inviable la
  intersección a mano.
- **Spread `...`**: explicado (copia las claves, y **lo que va después pisa**; el orden importa) y
  **rechazado por él**. Registrado en "Cómo se trabaja esto" como preferencia general.
- **`FormData` es una API nativa del navegador**, no la creó él ni Next; TypeScript ya la conoce. Es donde
  el navegador junta los campos rotulados por su `name`. **Quién se lo pasa a la action: Next**, cuando se
  envía el `<form action={...}>`.
  - **`name` es la etiqueta con la que viaja el valor. Sin `name` el campo no se manda.** Equivalente de su
    `document.getElementById("nombre").value`, pero al revés: en vez de ir a buscar cada campo, el form los
    manda todos juntos rotulados.
  - **`.get("x")` NO es el GET de HTTP** (se rió con esto). Es el método de un objeto tipo `Map`: leer una
    clave. Podría llamarse `.leer()`. Si el string no coincide con ningún `name`, devuelve `null` sin error.
  - **Todo lo que sale de `FormData` es string** → `Number()` para los ids y las cantidades.
- **`"use server"` y las Server Actions** — el concepto central de la fase.
  - Es una **directiva** (un string suelto, como `"use strict"`), **de React, no de TypeScript** — funciona
    igual en `.js`. Lo preguntó explícitamente.
  - **Con esa línea Next hace 3 cosas solo**: deja el código únicamente en el servidor, le crea una
    dirección para invocarla, y del lado del cliente deja un "control remoto" que hace el POST. Por eso se
    puede importar desde un Client Component sin que las credenciales de la base terminen en el navegador:
    **lo que se importa es el control remoto, no la función**.
  - **En `actions.ts` no hay ningún POST escrito.** El POST lo agrega Next al compilar. Lo confirmó por su
    cuenta ("okey, hace un post") y el punto que se le remarcó es que **nunca escribió la URL, ni el
    `fetch`, ni el endpoint**.
  - `<form action={funcion}>`: el `action` de HTML esperaba una **URL**; React lo extendió para aceptar una
    **función**. Va **sin paréntesis** (misma regla que el `onClick={siguiente}` del carrusel).
  - Error suyo a recordar: quiso poner el `action` creando un `<form>` nuevo adentro del que ya tenía.
- **El GET desaparece, el POST no.** Marco que le sirvió: *un GET tiene sentido cuando el que pide los datos
  está lejos del que los tiene*. En `page.tsx` no lo está (ya corre en el servidor) → Prisma directo, cero
  HTTP. En el submit sí hay distancia real (navegador → servidor) → ahí sí hay una petición, y es la única.
- **⚠️ Confusión que hubo que corregir al final: "cada `create` hace un POST".** NO. **Hay un solo POST en
  toda la operación**, el del navegador al servidor. De ahí para adentro son `INSERT` de SQL que Prisma
  manda a MySQL — no viajan por la red. En el proyecto viejo sí eran 3 POST porque cada uno cruzaba a
  Express. Diagrama que se le dio:
  `navegador ──POST──► servidor ──(SELECT + 3 INSERT, SQL)──► MySQL`.
- **Server Action vs Route Handler** (preguntó "¿pero se podría hacer el post con post?"). Sí se puede:
  `app/api/pedidos/route.ts` con `export async function POST(request)` + `fetch` desde el cliente. Se
  descartó acá porque hay que escribir el endpoint, la URL, el `fetch`, el JSON de ida y vuelta y los
  errores a mano, sin nada a cambio. **Regla corta que se le dio: form propio → Server Action; alguien de
  afuera → Route Handler.** El caso real de LANCER son los **webhooks de Meta**, donde no hay form ni
  componente, solo un servidor externo golpeando la puerta.
- **⭐ Nunca confiar en un precio que viene del cliente.** Su `pedidoCliente.js` sacaba el precio del
  `data-precio` del `<option>`, o sea del navegador: con F12 cualquiera se compraba una milanesa a $1. Por
  eso la action hace `findUnique` del producto y usa **el precio de la base**. `cantidad` sí puede venir del
  form; `precio` no. Transferible tal cual a LANCER (cualquier monto, descuento o estado de lead).
- **`findUnique` devuelve la fila O `null`** → `TS18047: 'producto' is possibly 'null'`. Se resuelve con un
  guard temprano (`if (!producto) throw new Error(...)`), y a partir de esa línea TypeScript ya sabe que
  existe y deja de marcarlo. Patrón que va a usar todo el tiempo en LANCER.
- **`create` devuelve la fila creada** → `cliente.id` es el id nuevo. Es el equivalente exacto del
  `clienteResponse.data.id_cliente` que tenía con axios. Por eso los tres `create` van en cadena.
- **`.ts` vs `.tsx`**: `.tsx` solo hace falta si el archivo tiene JSX. `actions.ts` no lleva tags → `.ts`.
  Ligado a la pregunta "¿JSX es React básicamente?": JSX es **la sintaxis** (poder escribir `<div>` adentro
  de JS), React es **la librería** que lo pinta. Van siempre juntos, la distinción solo importa para
  entender para qué existe la extensión `.tsx`.
