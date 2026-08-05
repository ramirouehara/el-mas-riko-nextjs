# El Mas Riko → Next.js — Progreso y contexto

Reescritura de [ElMasRico](/Users/ramirouehara/Desktop/elmasrico/ElMasRico) (sistema de gestión para una
sangucheria) usando Next.js, como proyecto de aprendizaje. La app original está documentada en
`elmasrico/ElMasRico/DOCUMENTACION.md` (frontend HTML/CSS/JS vanilla + Bootstrap, backend Express + MySQL,
auth JWT+bcrypt).

## ⭐ PARA QUÉ EXISTE ESTE PROYECTO (contexto revelado el 2026-08-04)

**Esto no es un proyecto en sí mismo: es la Fase 0 de otro.** El usuario está armando **LANCER**, una app de
gestión integral para un local que vende productos Apple (inbox unificado de WhatsApp/Instagram/Facebook +
IA para filtrar leads + CRM + métricas + stock). Tiene un `PLANNING.md` propio con stack, roadmap de 8 fases
y estimación (~235h). Stack de LANCER: Next.js App Router, **PostgreSQL** (no MySQL), Prisma, Socket.io para
tiempo real, API de Claude para la IA, deploy en Railway/Render como **servidor persistente** (no serverless).

ElMasRico es el vehículo de aprendizaje elegido para esa Fase 0, y es mejor que la "mini-app descartable tipo
lista de tareas" que proponía el plan: el usuario ya conoce el dominio de memoria, así que lo único nuevo es
el framework, y tiene el original contra el que comparar.

**Consecuencia práctica para cómo guiar esto:** lo que importa es **el flujo de Next.js**, no terminar la
sangucheria ni pulir el CSS. El usuario lo dijo explícitamente: *"no me fijé tanto en el tailwind realmente,
me fijé más en el flujo de cómo funciona Next"*. Se nota en sus preguntas — todas fueron sobre routing,
layouts, `children`, Server vs Client, y de dónde salen los datos; ninguna sobre Tailwind. **Priorizar
conceptos transferibles a LANCER por sobre completitud del proyecto.**

## Cómo se trabaja esto (importante para retomar)

- El usuario sabe algo de React/Next/TypeScript pero no a fondo. El objetivo es que **programe él**,
  entendiendo cada paso — no que Claude escriba todo el código de una.
- Guiar fase por fase del roadmap de abajo, explicando conceptos de Next.js a medida que aparecen
  (Server vs Client Components, App Router, Server Actions, etc.), y dejar que el usuario escriba el código,
  revisando/corrigiendo.
- No avanzar de fase sin que la fase anterior esté entendida y funcionando.
- **Boilerplate vs. lógica de la app** (acordado el 2026-08-04): la infraestructura (`lib/prisma.ts`, config)
  se le pasa por el chat con explicación línea por línea y no se espera que la escriba de memoria; la lógica
  (queries, `.map()`, formularios, CRUD) sí la escribe él. Ver el detalle en los conceptos de la fase 4.

## Decisiones tomadas

- **Alcance**: full-stack en Next.js (App Router). El backend también vive en Next.js (Route Handlers /
  Server Actions), no se reutiliza `backend2` (Express) tal cual — aunque sirve de referencia para la
  lógica de negocio.
- **DB**: Prisma como ORM sobre la misma MySQL (XAMPP) que usaba el proyecto original.
- **Estilos**: Tailwind CSS (reemplaza Bootstrap 5).
- **Lenguaje**: TypeScript en todo.

## Roadmap

1. **Setup del proyecto** ✅ DONE (2026-07-31)
2. **Modelo de datos con Prisma** ✅ DONE (2026-08-02) — ver detalle en "Estado de la fase 2" abajo
3. **Landing pública (Server Components, layout)** ✅ DONE (2026-08-04) — Navbar, Footer, Hero (carrusel),
   sección "Nosotros" y sección "Especialidades" (primer `.map()` del proyecto). Landing completa.
4. **Carta** ✅ DONE (2026-08-04) — `/carta` con productos agrupados por categoría, leídos directo desde
   Prisma con `.map()` anidado. Ver detalle en "Estado de la fase 4" abajo.
5. **Formulario de pedido público** — Client Component + Server Actions (reemplaza la cadena de 3 fetches con
   axios del original: crear cliente → crear pedido → agregar detalle) ⬅️ ACÁ RETOMAR.
   ⚠️ Ojo con el `Decimal` de `precio`: no se puede pasar de un Server Component a un Client Component
   (`"Only plain objects can be passed to Client Components"`). Ya se le anticipó que va a aparecer.
6. **Login/Auth** — JWT en cookie httpOnly + middleware de Next.js para proteger rutas (mejora vs.
   localStorage del original). **Alta prioridad**: es literalmente la Fase 1 de LANCER ("login básico y
   roles: dueño ve todo, vendedor ve lo suyo").
7. **Dashboard: CRUD de categorías** — el patrón completo (leer, crear, editar, borrar, revalidar).
   **Última fase con contenido nuevo.**
8. ~~Repetir el patrón CRUD para productos, clientes, pedidos, usuarios~~ ❌ **SE SALTEA** (decidido el
   2026-08-04). Cero conceptos nuevos: es el mismo patrón de la fase 7 cuatro veces. Con el objetivo real
   (aprender el flujo, no terminar la sangucheria) es tiempo perdido. **Al terminar la fase 7 se salta a
   LANCER.**
9. **NUEVO — ejercicio de `<Suspense>` + streaming** (agregado el 2026-08-04, no estaba en el roadmap
   original). ~30 min, se puede hacer en cualquier momento a partir de ahora. Motivo: el "streaming de
   respuestas de IA" es una de las razones por las que el usuario eligió Next para LANCER y es el único
   concepto central que el roadmap de ElMasRico no cubría. Se practica con algo trivial (una parte de la
   carta que tarde a propósito).

### Estado del flujo de Next.js (lo que de verdad se está midiendo)

- ✅ **Camino de LECTURA completo**: request → Server Component `async` → Prisma → HTML. Es el que usan la
  carta de ElMasRico y, en LANCER, el CRM, el panel de métricas y el stock.
- ❌ **Camino de ESCRITURA**: form del cliente → cruzar al servidor → validar → escribir → reflejar el
  cambio en pantalla (Server Actions + revalidación). **Es la mitad que falta y la que más pesa para
  LANCER** (inbox, leads que cambian de etapa, stock que se descuenta). Fases 5 y 7.
- ❌ **Streaming / Suspense**: fase 9 de arriba.

## LANCER — qué transfiere, qué corregir del plan y qué de-riskear (2026-08-04)

Anotado después de leer el `PLANNING.md` de LANCER, para no perderlo entre sesiones.

### Cosas del `PLANNING.md` de LANCER que ya quedaron desactualizadas

1. **"API routes: cómo se escribe un endpoint de backend dentro de Next.js"** (ítem de la Fase 0 de LANCER).
   Ese ítem se escribió antes de saber que existen Server Components y Server Actions. **Para su propia app
   no necesita endpoints**: leer con Server Components, escribir con Server Actions. Eso hace LANCER más
   simple de lo estimado (el CRM, el panel financiero y el stock son todos así).
   - **Pero el ítem se queda por otro motivo**: los **webhooks de WhatsApp/Instagram/Facebook** sí necesitan
     Route Handlers, porque Meta tiene que poder hacerle `POST` a una URL. Es el caso de manual de "alguien
     externo le habla a tu servidor". Van a ser ~3 archivos en todo LANCER, no la forma de escribir el
     backend. Convención: `route.ts`, y **no puede convivir con un `page.tsx` en la misma carpeta** (de ahí
     que se metan en `app/api/...`).
2. **Prisma v7 con Postgres**: instalar **`@prisma/adapter-pg`** desde el día uno (el equivalente del
   `@prisma/adapter-mariadb` de acá) y la URL en `prisma.config.ts`, no en el schema. Sin adapter el cliente
   no se conecta a nada. **Cualquier tutorial de v5/v6 que encuentre va a estar mal** — ver la sección
   "Diferencias de Prisma v7" más abajo, es lo primero que tiene que releer al arrancar LANCER.
3. **El caché/prerender de Next**: lo más importante que se llevó de la fase 4. En una carta de sangucheria
   que Next congele el HTML en el build es un detalle; en un **inbox en vivo y un dashboard de métricas**
   sería catastrófico. Va a necesitar `force-dynamic` en el inbox y `revalidate` largo en reportes.

### El riesgo técnico #1 de LANCER: Socket.io + App Router

Es la única decisión del stack que se pelea con el diseño del framework: Socket.io necesita engancharse a un
servidor HTTP propio, y `next dev` / `next start` no lo dan de arriba — hace falta un custom server.

Alternativas que conviene evaluar **antes** de comprometerse:
- **SSE (Server-Sent Events)**: un Route Handler que mantiene la respuesta abierta y empuja mensajes. Nativo
  de Next, sin custom server. Para un inbox alcanza, porque solo hace falta servidor→cliente, no
  bidireccional. **Es la que se le recomendó probar primero.**
- Un servicio externo (Pusher, Ably): elimina el problema a cambio de un costo mensual.

**Recomendación concreta que se le dio: prototipar el tiempo real en la Fase 0 o 1 de LANCER, NO en la 2.**
El plan lo pone dentro de la Fase 2, después de ~45h de trabajo en el inbox; si ahí descubre que la
arquitectura no cierra, ya construyó medio módulo sobre una decisión equivocada. Un prototipo pelado ("el
servidor manda la hora cada 2 segundos y el navegador la muestra") son ~2h y valida o descarta el enfoque
cuando cambiar todavía es gratis.

### Qué transfiere tal cual

- **MySQL → Postgres es barato**: `provider = "postgresql"` + `@prisma/adapter-pg`. Las queries
  (`findMany`, `include`, `orderBy`, `where`) **no se tocan**. Buen ejemplo concreto de para qué sirve un ORM.
- El diseño de schema de la fase 2 de acá es la misma habilidad que modelar leads/conversaciones/mensajes
  (Fase 1 de LANCER).
- La fase 6 de acá (auth con cookie httpOnly + middleware) **es** el "login básico y roles" de la Fase 1 de
  LANCER.

## Estado actual del proyecto Next.js

Creado con `create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
en `/Users/ramirouehara/Desktop/primer-proyecto-nextjs`.

- `next@16.2.12`, `react@19.2.4`, `tailwindcss@4`, `prisma`/`@prisma/client@7.9.1`,
  `@prisma/adapter-mariadb@7.9.1`, `mariadb@3.5.3`
- Git inicializado automáticamente por create-next-app (ver sección "Git / GitHub" abajo para el estado real)
- Estructura al 2026-08-04:
  - `src/app/layout.tsx` (layout raíz, con `<Navbar />` y `<Footer />`), `src/app/page.tsx` (home)
  - `src/app/carta/page.tsx` (ruta `/carta`)
  - `src/components/` con `Navbar.tsx`, `Footer.tsx` y `HeroCarousel.tsx`
  - `src/lib/prisma.ts` (el singleton del Prisma Client — **el único lugar donde se instancia**)
  - `src/generated/prisma/` (el cliente generado, gitignoreado)
- Rutas existentes: `/` y `/carta`. Todavía dan 404 (a propósito): `/pedidos` (fase 5) y `/login` (fase 6),
  los dos ya linkeados desde el `Navbar`.
- Servidor de dev probado y funcionando (`npm run dev` → `http://localhost:3000`), se detuvo al cerrar la
  sesión — para retomar: `npm run dev` desde la raíz del proyecto.
- `npm audit`: 12 vulnerabilidades "high" en dependencias transitivas del scaffold — no bloqueante para
  desarrollo, revisar más adelante si hace falta.

## Git / GitHub

- Repo local con 9 commits al 2026-08-04: `a7dba7c` (initial de create-next-app), `0345b6c`/`af4af3b`
  (schema de Prisma), `a6c5993` ("hicimos el nav"), `f70a9d5` ("corregimos lo de los commits"),
  `edcac46` ("matamos el footer"), `18e98cc` ("hicimo el hero"), `0a478a9` ("hicimos la seccion de
  nosotros"), `1e8a865` ("lista la fase 3" — Especialidades en `page.tsx` + los 4 dominios de
  `next.config.ts`).
- `89b2f83` ("fase 4 cerrada") — `src/lib/prisma.ts`, `src/app/carta/`, el driver adapter en
  `package.json`/`package-lock.json` y el fix del `height={68}` del logo.
- Al cierre de la sesión del **2026-08-04** lo único sin commitear es este `PROGRESS.md`. El usuario
  commitea y pushea él.
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

### ⚠️ Pendiente inmediato para retomar

1. **`export const dynamic = "force-dynamic"` en `carta/page.tsx`** — se le explicó y **no lo escribió
   todavía** (verificado: el archivo no tiene ningún export además del default). Ver el punto del prerender
   en "Conceptos" — sin esto la carta queda congelada en producción.
2. **`export const metadata = { title: "Carta | El Mas Riko" }`** en `carta/page.tsx` — opcional, ofrecido
   y no escrito todavía.
3. Commitear (ver "Git / GitHub"). Después, fase 5.

### Ideas/pendientes para más adelante (no bloquean)

- **Los precios se muestran crudos** (`$12000`, sin separador de miles). Quedaría mejor `$12.000`. Se hace
  con `Number(p.precio).toLocaleString("es-AR")` o `Intl.NumberFormat` — buen momento para introducirlo
  cuando aparezca de nuevo en el dashboard.
- **Categoría sin productos**: hoy no hay ninguna, pero renderizaría un `<h2>` con una `<ul>` vacía debajo.
  Si aparece, se resuelve con un renderizado condicional (concepto todavía no explicado).

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
  3. **En la fase 5 va a morder**: no se puede pasar de Server a Client Component
     (*"Only plain objects can be passed to Client Components"*).
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
