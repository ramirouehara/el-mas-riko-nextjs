# Bitácora de fases — El Mas Riko → Next.js

Detalle de qué se hizo, qué se decidió y qué errores se cometieron (y corrigieron) en cada fase.
Se abre para repasar un patrón puntual, no para leer de punta a punta. Ver `PROGRESS.md` para el
estado actual y `docs/conceptos-next.md` para los conceptos ya explicados.

## Git / GitHub

- Repo local con 9 commits al 2026-08-04: `a7dba7c` (initial de create-next-app), `0345b6c`/`af4af3b`
  (schema de Prisma), `a6c5993` ("hicimos el nav"), `f70a9d5` ("corregimos lo de los commits"),
  `edcac46` ("matamos el footer"), `18e98cc` ("hicimo el hero"), `0a478a9` ("hicimos la seccion de
  nosotros"), `1e8a865` ("lista la fase 3" — Especialidades en `page.tsx` + los 4 dominios de
  `next.config.ts`).
- `89b2f83` ("fase 4 cerrada") — `src/lib/prisma.ts`, `src/app/carta/`, el driver adapter en
  `package.json`/`package-lock.json` y el fix del `height={68}` del logo.
- Al cierre de la **segunda sesión del 2026-08-04** queda sin commitear: `PROGRESS.md`,
  `src/app/carta/page.tsx` (el `force-dynamic`), `src/app/pedidos/page.tsx`, `src/app/pedidos/actions.ts` y
  `src/components/FormPedido.tsx`. El usuario commitea y pushea él.
- Remoto configurado: `origin` → `https://github.com/ramirouehara/el-mas-riko-nextjs.git`. Ya está pusheado
  y sincronizado (`git push` a secas alcanza, quedó el upstream seteado).
- **Si en algún momento reaparece un error 403 al pushear** ("Permission ... denied to <usuario>"): ya pasó
  una vez. Causa real: el usuario tiene una sola cuenta de GitHub (`ramirouehara`, logueada con Google, sin
  password tradicional), pero el Keychain de macOS tenía cacheada una credencial vieja de OTRO usuario
  (`uehararamiro`) para `github.com`. Fix que funcionó:
  1. `printf "protocol=https\nhost=github.com\n" | git credential-osxkeychain erase` (borra la credencial
     cacheada).
  2. Generar un **Personal Access Token classic** en github.com/settings/tokens con el checkbox **`repo`**
     tildado explícitamente (la primera vez se generó uno sin ese scope y dio el mismo 403 "denied to
     ramirouehara" aun con el usuario correcto — un fine-grained token o uno sin scope `repo` da el mismo
     síntoma).
  3. `git push` de nuevo, usuario `ramirouehara`, contraseña = el token (no la contraseña real de la cuenta,
     GitHub no la acepta para git por HTTPS desde 2021).
- El usuario corre los comandos de git él mismo en su terminal en general (no Claude vía Bash), como parte
  del aprendizaje.

## Estado de la fase 2 (Prisma) — al 2026-08-01

### Hecho

- Instalado `prisma@7.9.1` (devDep), `@prisma/client@7.9.1` (dep), `dotenv@17.4.2` (devDep).
- Corrido `npx prisma init --datasource-provider mysql` (el flag es obligatorio: `prisma init` a secas
  arma un proyecto para Prisma Postgres, no para MySQL local).
- Archivos generados: `prisma/schema.prisma`, `prisma.config.ts`, `.env`, y línea `/src/generated/prisma`
  agregada al `.gitignore`. También instaló 9 "agent skills" de Prisma en `.agents/skills/` (con symlinks
  desde `.claude/skills/` y `.windsurf/skills/`) + `skills-lock.json`. Se decidió dejarlas: documentan la
  v7 y sirven de referencia autoritativa (`.agents/skills/prisma-upgrade-v7/SKILL.md` tiene la tabla de
  breaking changes).

### ⚠️ Pendiente inmediato para retomar

1. ~~**El `.env` todavía tiene el placeholder de Prisma.**~~ ✅ Hecho: ya dice
   `DATABASE_URL="mysql://root@localhost:3306/elmasrico"`
2. ~~**MySQL de XAMPP sigue apagado**~~ ✅ Confirmado arriba (puerto 3306 responde) al 2026-08-02.
3. ✅ **Los 6 modelos están escritos en `prisma/schema.prisma`** (`Categoria`, `Producto`, `Cliente`,
   `Pedido`, `DetallePedido`, `Usuario`), todos escritos por el usuario como ejercicio guiado campo por
   campo, validados con `npx prisma validate` → OK, y formateados con `npx prisma format`. Errores típicos
   que cometió y corrigió en el camino (útil si se repiten): olvidar `@id` en la PK, olvidar `@@map` de
   modelo, olvidar `@map` en un campo con nombre distinto a la columna, dos campos de relación con el mismo
   nombre en un modelo con FKs dobles (`DetallePedido` — Prisma no lo permite, error real no solo de estilo),
   copiar el largo de `@db.VarChar` de otro campo sin mirar el SQL real, poner `onDelete: Cascade` en una FK
   que en el SQL original no lo tenía.
4. ✅ **Verificado contra la base real con `npx prisma db pull`.** Se hizo primero un commit local
   (`git commit`, sin remoto configurado — todo local) del schema escrito a mano como red de seguridad,
   después se corrió `db pull` y se comparó con `git diff`. Encontró diferencias reales:
   - **Bug real que se nos pasó al escribir a mano**: `Pedido.estado` y `Pedido.fecha` debían ser opcionales
     (`?`) — el SQL original no los marca `NOT NULL`, a diferencia de `total`/`clienteId`. `db pull` los
     corrigió solo.
   - **`@unique` no documentado** en `Categoria.nombre`, `Producto.nombre`, `Usuario.nombre` — la base real
     tiene constraints que no estaban en `DOCUMENTACION.md` (la doc quedó desactualizada respecto a la base).
   - Cosas nuevas que trajo la introspección (no son errores, es cómo describe la base real): `@@index(...)`
     en columnas de FK (MySQL las indexa solas), `map: "..."` dentro de `@relation` (nombre real del
     constraint en MySQL — algunos con nombre explícito del SQL como `fk_pedidos_cliente`, otros
     autogenerados por MySQL como `productos_ibfk_1`), `onUpdate: Restrict`.
   - `DetallePedido.precioUnitario` había vuelto a `precio_unitario` (introspección no impone camelCase) —
     se restauró a mano el nombre + `@map("precio_unitario")` por consistencia de estilo con el resto del
     schema (decisión estética, no funcional).
   - Estado final: schema validado (`prisma validate` OK) y formateado (`prisma format`).

**Fase 2 (modelo de datos con Prisma) queda cerrada**: el ajuste de `precioUnitario` ya está commiteado y
`npx prisma generate` ya se corrió (el Prisma Client existe en `src/generated/prisma`, gitignoreado). Ver
"Dónde retomar (fase 2, ya cerrada)" más abajo.

### Diferencias de Prisma v7 vs. los tutoriales (v5/v6) — importante, muerde

- **La URL de conexión NO va en `schema.prisma`.** El bloque `datasource db` solo tiene `provider = "mysql"`;
  la url vive en `prisma.config.ts` (`datasource: { url: process.env["DATABASE_URL"] }`). Todo tutorial
  viejo muestra `url = env("DATABASE_URL")` dentro del schema — eso ya no es así.
- **El `.env` no se carga solo.** En v6 la CLI de Prisma traía dotenv adentro y lo cargaba sola; en v7 la
  carga es manual, por eso el `prisma.config.ts` generado arranca con `import "dotenv/config"` y por eso
  hay que declarar `dotenv` explícitamente (estaba disponible solo como phantom dependency de prisma).
  Ojo con la confusión: Next.js SÍ lee el `.env` solo cuando corrés `npm run dev` — el que no lo lee es la
  CLI de Prisma, que es un proceso de Node aparte que no pasa por Next.
- **El generator es `prisma-client`** (no `prisma-client-js`) y genera el cliente en
  `src/generated/prisma`, dentro del código fuente, no escondido en `node_modules`.
- **El import del cliente es `@/generated/prisma/client`**, no `@prisma/client`. Consecuencia directa del
  punto anterior.
- **Hace falta un driver adapter, o el cliente no se conecta a nada.** El query engine de Rust ya no existe
  en v7. Para MySQL: `npm install @prisma/adapter-mariadb mariadb`, y el `PrismaClient` se construye con
  `new PrismaClient({ adapter })`. Descubierto y resuelto en la fase 4 — ver el detalle completo en "Estado
  de la fase 4" más abajo. **Es la diferencia más grande de todas y la que hace inservible a cualquier
  tutorial de v5/v6.**

### Dónde retomar (fase 2, ya cerrada)

Los 6 modelos están escritos, validados, verificados contra la base real, formateados y commiteados/pusheados.
`npx prisma generate` ya se corrió (Prisma Client existe en `src/generated/prisma`, gitignoreado). Fase 2
100% cerrada. Sigue la fase 3, detallada abajo.

## Estado de la fase 3 (Landing pública) — CERRADA al 2026-08-04

### Hecho

- **`src/app/layout.tsx`**: se sacaron los fonts Geist default de create-next-app (import, consts, y su uso
  en el `className` del `<html>`) — decisión: sin font custom por ahora, queda el `font-family: Arial,
  Helvetica, sans-serif` que ya estaba en `globals.css` como fallback. `lang="es"`. `metadata` actualizada
  (`title: "El Mas Riko"`, `description: "Pagina de El Mas Riko"`). `<Navbar />` importado y renderizado
  dentro de `<body>`, antes de `{children}`.
  - ⚠️ Pendiente menor: `globals.css` (bloque `@theme inline`) todavía tiene `--font-sans: var(--font-geist-sans)`
    y `--font-mono: var(--font-geist-mono)` apuntando a variables que ya no se definen en ningún lado. No
    rompe nada visualmente (el `body` tiene su propio `font-family` fijo), pero conviene limpiarlo o
    reemplazarlo si en algún momento se agrega un font custom real.
- **`src/components/Navbar.tsx`**: completo y funcionando. Logo (`<Image>` envuelta en `<Link href="/">`)
  + `<ul>` con los 6 links del original (`Inicio /`, `Nosotros /#nosotros`, `Productos /#especialidades`,
  `Carta /carta`, `Pedido /pedidos`, `Empleados /login` — las últimas 3 rutas todavía no existen, dan 404
  a propósito por ahora). Con `flex items-center justify-between px-4 py-3` en el `<nav>` y
  `flex items-center gap-3` en el `<ul>`. Server Component (sin `"use client"`, confirmado y entendido por
  el usuario — no hay estado ni interactividad). Errores que cometió y corrigió en el camino: escribió
  `<link>` (minúscula, tag nativo de HTML) en vez de `<Link>` (el componente importado de `next/link`) —
  buen ejemplo real de la regla de JSX minúscula=HTML/mayúscula=variable en scope; typo `intems-center` en
  vez de `items-center` (Tailwind no tira error en clases mal escritas, solo no aplica el estilo, silencioso).
- **Assets copiados** a `public/img/`: `logo.png` (de `Frame 1.png` del proyecto original) y `sandwich.png`
  (de `sandwich_sin_fondo 1.png`).
- **`src/app/page.tsx`**: se vació el contenido default de create-next-app. Al cierre del 2026-08-03
  renderiza un **Fragment `<>...</>`** con `<HeroCarousel />` + la `<section id="nosotros">` terminada.
  - Se eligió el Fragment sobre un `<main>` (se le ofrecieron las dos, `<main>` era lo más semántico y lo
    que tenía el original — decisión del usuario, funcionalmente equivalente).
  - **Sección "Nosotros" ✅ terminada** (sin commitear todavía al cierre de la sesión). Escrita otra vez
    por capas (esqueleto pelado primero, clases de Tailwind después, div por div explicando qué hace cada
    uno). Estructura: `<section id="nosotros" className="py-16">` → container
    (`max-w-6xl mx-auto px-4`) → fila (`flex flex-col md:flex-row items-center gap-8`) → col izq (`<div>`
    sin clases, con `<Image src="/img/sandwich.png" width={200} height={200}>`) y col der
    (`text-center md:text-left`, con `<h2 className="text-3xl font-bold mb-4">` + `<p className="leading-relaxed">`).
  - Errores que cometió y corrigió: `<Image>` con solo `src` (ver abajo, el ida y vuelta sobre por qué
    TypeScript lo marca en rojo); puso `logo.png` en vez de `sandwich.png`; anidó los dos `<div>` de columna
    en línea recta en vez de como hermanos; y **el cuarto typo silencioso de Tailwind**: `max-2-6xl` en vez
    de `max-w-6xl` (la `2` está al lado de la `w` en el teclado).
  - Dato útil: `public/img/sandwich.png` es de **272×272** (cuadrada), por eso el `width={200} height={200}`
    no la deforma. `logo.png` es 318×155.
- **`src/components/Footer.tsx`**: ✅ terminado (commit `edcac46 "matamos el footer"`). Escrito por el
  usuario por capas: primero la estructura de elementos pelada, después las clases de Tailwind una tanda
  a la vez. Estructura final: `<footer className="mt-auto border-t py-12">` → container
  (`max-w-6xl mx-auto px-4`) → fila de 2 columnas
  (`flex flex-col md:flex-row justify-between gap-6`) → columna izq (logo `<Image>` 140x60 +
  `<p>` descripción, `text-center md:text-left`) y columna der (`<h5>CONTACTO</h5>` + 3 `<p>`,
  `space-y-1 text-center md:text-right`); afuera del container, el `<p>` del copyright con
  `text-sm border-t text-center mt-* pt-*`.
  - Se cambió `min-h-full` → **`min-h-screen`** en el `<body>` de `layout.tsx`: `min-h-full` es
    `min-height: 100%` y no hacía nada porque `<html>` no tiene altura definida, así que el `mt-auto`
    del footer no tenía espacio sobrante que repartir.
  - Errores que cometió y corrigió: dejar el `return ( )` vacío (pasó dos veces, con el Footer y con el
    HeroCarousel — patrón: escribe el esqueleto y se traba en el contenido); poner `md:flex-row` sin el
    `flex` (sin `display:flex` la propiedad `flex-direction` se ignora, silencioso); reemplazar `pt-4`
    por `mt-8` en vez de sumarlo (margin = afuera del borde, padding = adentro; con `border-t` la
    diferencia se ve).
- **`src/components/HeroCarousel.tsx`**: ✅ terminado y funcionando, **primer Client Component del
  proyecto** (`"use client"` + `useState`). Commit `18e98cc "hicimo el hero"`.
  - Decisión tomada con el usuario: se eligió armar el carrusel a mano en vez de un hero estático,
    justamente para tener un caso concreto de Server vs Client Component.
  - Estructura: array `imagenes` (3 objetos `{src, alt}`) declarado **afuera** del componente (no depende
    del estado, se crea una sola vez); `const [actual, setActual] = useState(0)`; funciones `siguiente()`
    y `paAtras()` declaradas **adentro** (necesitan `actual`/`setActual` en scope); el JSX no cambia
    nunca, lo único que cambia es el índice → `imagenes[actual].src`.
  - JSX final: `<div className="relative h-[60vh]">` con, en este orden, `<Image fill object-cover>`,
    overlay (`absolute inset-0 bg-black/30 pointer-events-none`), texto centrado
    (`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white`) y los dos
    `<button>` al final (`absolute right-4/left-4 top-1/2 -translate-y-1/2`).
  - Errores que cometió y corrigió (útiles si se repiten): llave `}` de más cerrando el componente antes
    del `return`; `if (actual >= imagenes.length)` en vez de `actual + 1 >= ...` (hay que validar el
    índice **destino**, no el actual, porque el actual ya se está mostrando y se sabe válido); en
    `paAtras` puso `imagenes.length - 1` en la **condición** en lugar de en el **valor** de rescate
    (invirtió los dos roles y rompió lo que ya andaba); hardcodear `setActual(2)` en vez de
    `imagenes.length - 1`; `==` en vez de `===`; las dos flechas `→` en ambos botones; y otra vez el
    typo silencioso de Tailwind, esta vez **`text-5x1`** con el número 1 en vez de la letra ele.
- **`next.config.ts`**: se agregó `images.remotePatterns` con los 3 dominios externos de las fotos del
  hero (`imag.bonviveur.com`, `www.clarin.com`, `statics.diariomendoza.com.ar`), en la forma objeto
  (`{protocol, hostname, pathname: "/**"}`). Se eligió esto sobre descargar las imágenes a `public/`.
  Verificado contra la doc de la versión instalada
  (`node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md:533`). **Ojo:
  `next.config.ts` no toma hot reload** — hay que reiniciar `npm run dev`.
  - El 2026-08-04 se agregaron los 4 hosts de las especialidades: `upload.wikimedia.org`,
    `images.getrecipekit.com`, `i0.wp.com`, `www.semanarioextra.com.ar` (7 en total). Escritos por el
    usuario sin errores.
  - Dato verificado en la doc (`image.md:589` y `:531`): existe una propiedad **`search`** en
    `remotePatterns` para filtrar query strings, y **omitirla permite cualquier query string** (el `**` es
    implícito). Por eso las 2 URLs con `?` (`?class=16x9` de empanadas, `?w=1920&ssl=1` de pizzas) funcionan
    sin declarar nada extra. Si algún día se quiere cerrar el candado, la doc recomienda `search` exacto.
- **Sección "Especialidades" ✅ terminada** (2026-08-04, commit `1e8a865`) — cierra la fase 3.
  **Primer `.map()` del proyecto.** Estructura final en `src/app/page.tsx`:
  `<section id="especialidades" className="py-16">` → container (`max-w-6xl mx-auto px-4`) →
  `<h2 className="text-3xl font-bold text-center mb-8">` → grilla
  (`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4`) → `{especialidades.map((e) => { return (...) })}`
  → tarjeta `<div key={e.nombre}>` → marco `<div className="relative h-[300px]">` con
  `<Image src={e.src} alt={e.nombre} fill className="object-cover"/>` + `<h3 className="text-center mt-2
  font-semibold">{e.nombre}</h3>` como **hermano** del marco.
  - Array `especialidades` (5 objetos `{src, nombre}`) declarado **afuera** del componente, mismo criterio
    que `imagenes` del HeroCarousel.
  - **Método que funcionó muy bien y conviene repetir en la fase 4**: se partió en 3 sub-pasos —
    (3a) **una sola tarjeta** hardcodeada pero ya leyendo del array con índice fijo (`especialidades[0].src`),
    (3b) convertirla en `.map()` reemplazando el `0` por el parámetro, (3c) las clases de Tailwind.
    Construir una y después multiplicarla resultó mucho más fácil que arrancar con el `.map()` de una, y el
    paso 3a→3b termina siendo un cambio mínimo (el JSX de la tarjeta no se toca).
  - Decisión de nombres discutida a fondo (preguntó 3 veces, ver "Conceptos"): las claves del array son
    `{src, nombre}` y no `{src, alt}`. Argumento que lo convenció: en la fase 4 estos datos salen de
    `prisma.categoria.findMany()`, donde el campo **se llama `nombre`** (ver `schema.prisma`, `Categoria`,
    `Producto` y `Cliente` lo tienen así) → usar hoy el nombre de mañana evita retocar el JSX.
  - Eligió `(e)` como nombre del parámetro del `.map()`. Se le señaló que `e` es la convención para el
    *event* de los handlers y que `esp`/`especialidad` se lee mejor; decidió dejar `e`, está bien.
  - Eligió la forma `=> { return (...) }` (con `return` explícito) sobre `=> (...)`. Las dos son válidas.
  - Sugerencia pendiente de decisión estética: en 2 columnas las tarjetas quedan angostas y alargadas
    (300px de alto fijo, igual que el original en Bootstrap). Se le ofreció `h-[200px] md:h-[300px]` en el
    marco de la imagen. Que decida a ojo, no bloquea nada.
  - Errores que cometió y corrigió, en orden (todos útiles si se repiten):
    1. Array declarado **adentro** del componente en vez de afuera.
    2. Clases `relative h-[300px]` puestas en el **container** en vez de en el marco de la imagen →
       la sección entera medía 300px.
    3. Metió **las 5 `<Image>` dentro de una sola tarjeta** en vez de una (se le explicó que con `fill`
       las 5 se apilan en `absolute` en el mismo lugar y solo se vería la última — el stacking del hero).
    4. `<h2>` y `<h3>` **vacíos** y `alt=""` — cuarta vez que arma el esqueleto y deja el contenido vacío
       (ya había pasado 2 veces con `return ( )`). Patrón a vigilar: **recordarle que ponga el contenido en
       el momento de escribir el tag.**
    5. `<h3>` anidado **dentro** del marco de la imagen en vez de como hermano — **segunda vez** que comete
       este error (la primera con las columnas de Nosotros). Regla que se le dio: si dos elementos van uno
       al lado / debajo del otro en pantalla, son **hermanos**; anidar significa "adentro de".
    6. `<h3>Sanguches</h3>` hardcodeado en vez de `{especialidades[0].nombre}`.
    7. **`(e)=` sin el `>`** de la flecha, más abrir con `{` donde iba `(` → 12 errores de TypeScript en
       cascada (ver "Conceptos", el punto sobre errores en cascada).
    8. Un **`;` suelto adentro del JSX** (`})};`) → `tsc` limpio pero React pinta un `;` en la página.
       Otro silencioso.

### Dónde retomar (fase 3, ya cerrada)

Nada pendiente de la fase 3: la landing pública está completa (Navbar, Hero, Nosotros, Especialidades,
Footer), `npx tsc --noEmit` sale limpio, no quedó ningún typo de Tailwind y está commiteado (`1e8a865`).
Lo único abierto es la decisión estética opcional del `h-[200px] md:h-[300px]`.

**Sigue la fase 4: la Carta.** Es la primera vez que Prisma entra al código de la app. Ideas para arrancar:
es el mismo `.map()` que acaba de escribir pero con `await prisma.producto.findMany({ include: { categoria:
true } })` (o agrupando por categoría) en un Server Component — buen momento para explicar `async` en
componentes de servidor y por qué no hace falta ninguna API intermedia ni `useEffect` + `axios` como en el
proyecto viejo. Repetir el método de sub-pasos que funcionó en Especialidades. Ojo: MySQL de XAMPP tiene que
estar prendido.

### Pendientes menores (no bloquean nada)

- `globals.css` (bloque `@theme inline`) todavía tiene `--font-sans: var(--font-geist-sans)` y
  `--font-mono: var(--font-geist-mono)` apuntando a variables que ya no existen desde que se sacaron los
  fonts de create-next-app del `layout.tsx`.
- ~~Verificar que se haya sacado el `import Image from "next/image"` sin usar de `src/app/page.tsx`.~~
  ✅ Resuelto solo: la sección "Nosotros" ahora sí usa `<Image>`.
- El `<h5>CONTACTO</h5>` del footer se ve igual que un párrafo: el reset de Tailwind (Preflight) le saca
  tamaño y negrita a todos los headings. Si se lo quiere destacar, va con clases explícitas.
- ~~El logo tira el warning `Image with src "/img/logo.png" has either width or height modified, but not the
  other`.~~ ✅ Resuelto el 2026-08-04. Causa real: se declaraba `width={140} height={60}` (ratio 2.333)
  pero el archivo es **318×155** (ratio 2.052), y el Preflight de Tailwind aplica `height: auto` a todas las
  imágenes (`node_modules/tailwindcss/preflight.css:233`) → el navegador respetaba el width y calculaba el
  alto real en 68px, Next detectaba la discrepancia y avisaba. Fix: `height={68}` en `Navbar.tsx:9` y
  `Footer.tsx:11`. **Lección general: `width`/`height` de `next/image` tienen que respetar la proporción real
  del archivo, no ser el tamaño deseado** (eso lo maneja el CSS).
- **Las especialidades de la home están desincronizadas de la base.** La home (hardcodeada) muestra
  Sanguches, Minutas, Empanadas, Pizzas, Bebidas; la base tiene Sanguches, Minutas, Pizzas y
  **Hamburguesas** (no tiene Empanadas ni Bebidas). Es exactamente el problema que la carta ya no tiene.
  Candidato natural a arreglar más adelante leyendo las categorías de Prisma también en la home — pero
  faltaría una columna de imagen en `Categoria` para las fotos.

## Estado de la fase 4 (Carta) — CERRADA al 2026-08-04

### Hecho

- **`npm install @prisma/adapter-mariadb mariadb`** — ⚠️ **el gotcha más grande de Prisma v7 hasta ahora.**
  En v6 Prisma traía su propio *query engine* (un binario de Rust que hablaba con MySQL directo). En v7 ese
  binario **ya no existe**: Prisma usa un driver de Node normal y el *driver adapter* es el traductor entre
  los dos. Sin esto el cliente no se conecta a nada. Ningún tutorial de Google lo menciona.
  - **Dice `mariadb` aunque la base sea MySQL** y está bien: MariaDB es un fork y hablan el mismo protocolo,
    Prisma tiene un solo adapter para los dos. Hubo que aclarárselo explícitamente.
  - Son **dos** paquetes con roles distintos: `mariadb` es el driver (abre el socket, habla el protocolo),
    `@prisma/adapter-mariadb` es el puente Prisma↔driver. Van en `dependencies`, no en dev.
  - Tabla de adapters por provider: `.agents/skills/prisma-upgrade-v7/references/driver-adapters.md:20`.
- **`src/lib/prisma.ts`** — el singleton. Escrito por el usuario (copiado con explicación línea por línea;
  se acordó explícitamente que **esto es boilerplate y no hace falta poder escribirlo de memoria**, a
  diferencia de la lógica de la app). Contenido final:
  ```ts
  import { PrismaClient } from "@/generated/prisma/client";
  import { PrismaMariaDb } from "@prisma/adapter-mariadb";
  const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
  export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== "production") { globalForPrisma.prisma = prisma; }
  ```
  - **`PrismaMariaDb` acepta un connection string directo** (no solo el objeto `{host, port, user...}` que
    muestra la doc) y encima reescribe `mysql:` → `mariadb:` solo — verificado en el código del adapter,
    `node_modules/@prisma/adapter-mariadb/dist/index.mjs:422` y `:488`. Por eso alcanza con reusar
    `process.env.DATABASE_URL` y no hubo que agregar variables nuevas al `.env`.
  - El import es `@/generated/prisma/client` (verificado en `src/generated/prisma/client.ts:40`), **no**
    `@prisma/client` como dicen todos los tutoriales — en v7 el cliente se genera dentro del código fuente.
- **`src/app/carta/page.tsx`** — ruta `/carta`, Server Component `async`. Query final:
  ```ts
  const categorias = await prisma.categoria.findMany({
    orderBy: { nombre: "asc" },
    include: { productos: true },
  });
  ```
  JSX: container (`max-w-3xl mx-auto px-4 py-16`) → `<h1 className="text-4xl font-bold text-center mb-12">`
  → `.map()` de categorías → `<div key={c.id} className="mb-10">` con
  `<h2 className="text-2xl font-bold border-b pb-2 mb-4">` + `<ul className="space-y-2">` →
  `.map()` anidado de `c.productos` → `<li key={p.id} className="flex justify-between">` con
  `<span>{p.nombre}</span>` y `<span className="font-semibold whitespace-nowrap"> ${p.precio.toString()}</span>`.
  - Se usó `max-w-3xl` (no `6xl` como el resto) **a propósito**: es texto en líneas cortas, con 6xl el
    nombre y el precio quedaban a 1100px de distancia.
  - Método: se repitieron los sub-pasos que funcionaron en Especialidades — (5a) `.map()` de afuera con solo
    los `<h2>`, (5b) el `.map()` anidado de productos, (5c) las clases. Antes de todo eso, un paso previo
    muy útil: volcar los datos crudos con `<pre>{JSON.stringify(categorias, null, 2)}</pre>` para ver qué
    llegó realmente **antes** de maquetar nada.
  - Errores: **una coma faltante** entre `orderBy` y `include` (son propiedades de un objeto). El mensaje
    del parser esta vez fue bueno (`Expected ',', got 'ident'` con la flechita) — se contrastó con el
    `Property assignment expected` de la flecha sin `>` para mostrar que hay errores de sintaxis útiles y
    otros que apuntan a cualquier lado.

### ✅ Pendientes cerrados el 2026-08-04 (segunda sesión)

1. ✅ **`export const dynamic = "force-dynamic"` escrito** en `carta/page.tsx:3`.
   - ⚠️ **Lo puso primero en `HeroCarousel.tsx`, el archivo equivocado, y no dio ningún error.** Otro
     silencioso para la colección, y muy didáctico: los *route segment config* (`dynamic`, `revalidate`,
     `metadata`, `runtime`) solo los busca Next en `page.tsx` / `layout.tsx` / `route.ts`. En un componente
     cualquiera es una constante exportada que nadie importa: cero efecto, cero aviso.
2. `metadata` en `carta/page.tsx` — sigue sin escribir, es opcional.

### Ideas/pendientes para más adelante (no bloquean)

- **Los precios se muestran crudos** (`$12000`, sin separador de miles). Quedaría mejor `$12.000`. Se hace
  con `Number(p.precio).toLocaleString("es-AR")` o `Intl.NumberFormat` — buen momento para introducirlo
  cuando aparezca de nuevo en el dashboard.
- **Categoría sin productos**: hoy no hay ninguna, pero renderizaría un `<h2>` con una `<ul>` vacía debajo.
  Si aparece, se resuelve con un renderizado condicional (concepto todavía no explicado).

## Estado de la fase 5 (Formulario de pedido) — 🟡 CASI CERRADA al 2026-08-04

**El camino de escritura funciona de punta a punta.** Verificado consultando MySQL directo: entraron 4
pedidos completos (`clientes` + `pedidos` + `detalle_pedido`, con los totales bien calculados).

### Archivos

- **`src/app/pedidos/page.tsx`** — Server Component `async`, con `export const dynamic = "force-dynamic"`
  (lo decidió él y **razonó bien el porqué**). Query idéntica a la de la carta
  (`categoria.findMany` con `orderBy` + `include: { productos: true }`). Después de la query, un `.map()`
  que **aplana el `Decimal`** (ver abajo) y arma `categoriasPlanas`, que es lo que se le pasa al form.
  Renderiza `<Form categorias={categoriasPlanas} />` dentro de un Fragment.
- **`src/components/FormPedido.tsx`** — Client Component (`"use client"`). Recibe la prop `categorias`.
  Tipos escritos **a mano y explícitos** (decisión suya, ver "Cómo se trabaja esto"):
  ```ts
  type ProductoPlano = { id: number; nombre: string; precio: number; categoriaId: number };
  type CategoriaConProductos = { id: number; nombre: string; productos: ProductoPlano[] };
  ```
  Form con 6 campos, todos con `name`: 3 `<input type="text">` (nombre/telefono/direccion), 2 `<select>`
  (`categoriaId`, `productoId`, llenados con `.map()` — el de productos con `.map()` anidado sobre
  `c.productos`), 1 `<input type="number">` (cantidad) y el `<button type="submit">`.
  Sin una sola clase de Tailwind todavía (a propósito, el método por capas).
- **`src/app/pedidos/actions.ts`** — la Server Action. `"use server"` en la línea 1. `crearPedido(formData)`
  lee los 6 campos con `formData.get()`, convierte con `String()`/`Number()`, hace `findUnique` del producto
  para **sacar el precio de la base y no del cliente**, corta con `if (!producto) throw` y después los tres
  `create` en cadena (`cliente` → `pedido` con `cliente.id` → `detallePedido` con `pedido.id`).

### ⚠️ CORRECCIÓN IMPORTANTE: el `Decimal` NO crashea (verificado el 2026-08-04)

Lo que decía este documento (y lo que se le anticipó a él) era **falso**: se le dijo "te va a explotar" y no
explota. Lo que pasa realmente, verificado en el código de React que hace el chequeo
(`node_modules/next/dist/compiled/react-server-dom-turbopack-experimental/cjs/react-server-dom-turbopack-server.edge.development.js`):

- Si el objeto es una **clase pelada** → `throw Error("Only plain objects, and a few built-ins, can be
  passed to Client Components from Server Components. Classes or null prototypes are not supported.")`.
- Si la clase tiene un método **`toJSON`** → solo `console.error(... "Objects with toJSON methods are not
  supported. Convert it manually to a simple value before passing it to props")` y **sigue adelante**,
  serializando con ese `toJSON`.

El `Decimal` de Prisma cae en el segundo caso (comprobado: `JSON.stringify(new Decimal("12000.50"))` →
`"12000.5"`). O sea **la página anda, con un warning, y del otro lado llega un string**.

**Eso lo hace peor, no mejor**, y es la lección que vale: el tipo `Decimal` sigue diciendo `Decimal` del lado
del cliente, así que `precio.mul(2)` **no se subraya en rojo** y revienta en runtime con
`precio.mul is not a function`. **El tipo miente en el cruce Server→Client** — TypeScript no modela la
serialización. Es la tercera variante del "que no haya rojo no significa que ande".

Nota práctica: el warning sale por el bundle de servidor, o sea **en la terminal del `npm run dev`**, no en
la consola del navegador. Él dijo no verlo; no se investigó más porque no bloquea nada.

**Cómo se resolvió**: aplanar en el servidor antes de pasar. Se hizo campo por campo (sin spread, por
pedido suyo):
```ts
const categoriasPlanas = categorias.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    productos: c.productos.map((p) => ({
        id: p.id, nombre: p.nombre, categoriaId: p.categoriaId, precio: Number(p.precio),
    })),
}));
```

### ⚠️ Pendientes de la fase 5 (en orden de valor)

1. **La transacción — el más importante y el único con contenido nuevo.** Hoy los tres `create` son
   independientes: si falla el segundo o el tercero, **el cliente ya quedó escrito y nadie lo borra**. Es
   literalmente el bug que tiene el `pedidoCliente.js` del proyecto viejo, y se le prometió arreglarlo con
   `prisma.$transaction`. ~10 min. Transfiere directo a LANCER (crear un lead + su primera conversación +
   su primer mensaje tiene la misma forma).
   - Dato: hay un cliente huérfano en la base (`id_cliente: 2`, "María Lópezzz") pero es **data vieja del
     proyecto original**, no lo generó esta sesión. Sirve igual de ejemplo visual.
2. **Feedback y refresco.** Hoy al enviar **no pasa nada visible**: el form no se limpia, no aparece ningún
   mensaje. Acá entran `revalidatePath`, `redirect` y `useActionState` (el `pending`). Es el "reflejar el
   cambio en pantalla" que todavía falta del camino de escritura.
3. **Filtrado de productos por categoría.** El `<select name="categoriaId">` **hoy es decorativo**: no se
   usa en la action (el producto ya sabe su categoría y `detalle_pedido` no la guarda). Su único trabajo
   sería achicar el select de productos. **Se salteó a propósito**: es `useState` puro, React, cero Next,
   y él estaba cansado. Opcional.
4. Clases de Tailwind (el form está pelado). Cosmético.
5. Un `const detalle = ...` sin usar en `actions.ts` — se puede dejar solo el `await`.

### Errores que cometió en esta fase (útiles si se repiten)

1. **`export const dynamic` en el archivo equivocado** (`HeroCarousel.tsx`) — ver fase 4 arriba.
2. **Dos elementos JSX hermanos sin envolver** en `page.tsx` (`TS2657: JSX expressions must have one parent
   element`). Ya le había pasado en Nosotros; lo resolvió solo con un Fragment.
3. **Prop sin tipo** (`TS7031: Binding element 'categorias' implicitly has an 'any' type`).
4. **`tsc` mostró solo 1 de los 2 errores**: cuando hay un error de **gramática**, TypeScript ni corre el
   chequeo de tipos. Refuerza la regla que ya tenía: *arreglar de a uno y volver a correr; la lista de
   errores no es la lista de problemas.*
5. **Sexta vez que deja el esqueleto vacío**: el `<form>` con los 3 inputs sin `name`, los dos `<select>` sin
   `<option>` adentro y el `<button>` sin texto. **Sigue siendo el patrón #1 a vigilar** (van: `return ( )`
   ×2, `<h2>`/`<h3>`/`alt` vacíos, y este). La consigna que se le repite: *escribí el contenido en el mismo
   momento que abrís el tag*.
6. **Creó un `<form>` nuevo y vacío adentro del que ya tenía** para poner el `action`, en vez de agregarle el
   atributo al existente. Confusión tag vs. atributo (y de paso, form anidado es HTML inválido).
7. **`String()` donde iba `Number()`** en `productoId` y `cantidad` (copió el patrón de las 3 líneas de
   arriba).
8. **`prisma.cliente.create` copiado y pegado tres veces** — los otros dos eran `prisma.pedido` y
   `prisma.detallePedido`. Produjo 6 errores de TS que apuntaban todos a las claves del `data`, no al
   modelo equivocado: buen ejemplo de mensaje de error que señala el síntoma y no la causa.
9. **Shorthand de objeto sin variable**: escribió `data: { clienteId, total }` creyendo que nombraba
   columnas. `{ x }` en JS significa `{ x: x }` → `Cannot find name 'clienteId'`. Iba `clienteId: cliente.id`.
10. Se le señalaron dos correcciones y **mandó el archivo sin aplicarlas** (siguió con `prisma.cliente` y
    con el shorthand). Conviene, cuando son varias, listarlas numeradas y pedir que confirme cada una.


## Esquema de datos original (referencia para el Prisma schema)

Ver script SQL completo en `elmasrico/ElMasRico/DOCUMENTACION.md` líneas 88-141. Resumen de tablas y
relaciones:

- `categorias` (id_categoria, nombre)
- `productos` (id_producto, nombre, precio, id_categoria → FK a categorias, sin cascade/RESTRICT)
- `usuarios` (id_usuario, nombre, contrasenia hasheada con bcrypt, id_role) — empleados del dashboard
- `clientes` (id_cliente, nombre, telefono, direccion) — se crean automáticamente desde el form público, sin
  login
- `pedidos` (id_pedido, id_cliente → FK ON DELETE CASCADE, total, estado, fecha)
- `detalle_pedido` (id_detalle, id_pedido → FK ON DELETE CASCADE, id_producto → FK sin cascade, cantidad,
  precio_unitario)

Nota de diseño a preservar: borrar un cliente arrastra sus pedidos y detalle (CASCADE), pero no se puede
borrar una categoría con productos ni un producto ya vendido (RESTRICT) — protege el historial de ventas.
