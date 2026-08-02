# El Mas Riko → Next.js — Progreso y contexto

Reescritura de [ElMasRico](/Users/ramirouehara/Desktop/elmasrico/ElMasRico) (sistema de gestión para una
sangucheria) usando Next.js, como proyecto de aprendizaje. La app original está documentada en
`elmasrico/ElMasRico/DOCUMENTACION.md` (frontend HTML/CSS/JS vanilla + Bootstrap, backend Express + MySQL,
auth JWT+bcrypt).

## Cómo se trabaja esto (importante para retomar)

- El usuario sabe algo de React/Next/TypeScript pero no a fondo. El objetivo es que **programe él**,
  entendiendo cada paso — no que Claude escriba todo el código de una.
- Guiar fase por fase del roadmap de abajo, explicando conceptos de Next.js a medida que aparecen
  (Server vs Client Components, App Router, Server Actions, etc.), y dejar que el usuario escriba el código,
  revisando/corrigiendo.
- No avanzar de fase sin que la fase anterior esté entendida y funcionando.

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
3. **Landing pública (Server Components, layout)** 🚧 EN CURSO (2026-08-02) — ver "Estado de la fase 3"
   abajo. ⬅️ ACÁ RETOMAR MAÑANA.
4. Carta — productos agrupados por categoría, leídos directo desde Prisma (sin API intermedia)
5. Formulario de pedido público — Client Component + Server Actions (reemplaza la cadena de 3 fetches con
   axios del original: crear cliente → crear pedido → agregar detalle)
6. Login/Auth — JWT en cookie httpOnly + middleware de Next.js para proteger rutas (mejora vs. localStorage
   del original)
7. Dashboard: CRUD de categorías (primer CRUD completo, sienta el patrón)
8. Repetir el patrón CRUD para productos, clientes, pedidos, usuarios

## Estado actual del proyecto Next.js

Creado con `create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
en `/Users/ramirouehara/Desktop/primer-proyecto-nextjs`.

- `next@16.2.12`, `react@19.2.4`, `tailwindcss@4`
- Git inicializado automáticamente por create-next-app (sin commits propios todavía)
- Estructura: `src/app/layout.tsx` (layout raíz), `src/app/page.tsx` (home, todavía el default de Next.js)
- Servidor de dev probado y funcionando (`npm run dev` → `http://localhost:3000`), se detuvo al cerrar la
  sesión — para retomar: `npm run dev` desde la raíz del proyecto.
- `npm audit`: 12 vulnerabilidades "high" en dependencias transitivas del scaffold — no bloqueante para
  desarrollo, revisar más adelante si hace falta.

## Git / GitHub

- Repo local con 4 commits al 2026-08-02: `a7dba7c` (initial de create-next-app), `0345b6c`/`af4af3b`
  (schema de Prisma), `a6c5993` ("hicimos el nav").
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

**Fase 2 (modelo de datos con Prisma) queda cerrada** salvo commitear este último ajuste
(`precioUnitario`, todavía sin commitear). El siguiente paso técnico es correr `npx prisma generate`
(genera el Prisma Client en `src/generated/prisma`, todavía no se corrió), y con eso ya se puede arrancar la
fase 3 (landing pública / primer uso de Prisma Client en una página).

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

### Dónde retomar (fase 2, ya cerrada)

Los 6 modelos están escritos, validados, verificados contra la base real, formateados y commiteados/pusheados.
`npx prisma generate` ya se corrió (Prisma Client existe en `src/generated/prisma`, gitignoreado). Fase 2
100% cerrada. Sigue la fase 3, detallada abajo.

## Estado de la fase 3 (Landing pública) — al 2026-08-02

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
- **`src/app/page.tsx`**: se vació el contenido default de create-next-app, quedó `return (<></>);` — un
  fragment vacío. Ojo: el `import Image from "next/image";` de arriba quedó sin uso, ESLint probablemente
  lo marque — limpiarlo cuando se retome (no es grave, pero es ruido).
- Commiteado y pusheado a GitHub (`a6c5993 "hicimos el nav"`).

### ⚠️ Pendiente inmediato para retomar mañana

1. **`src/components/Footer.tsx` — todavía no se creó.** Ya se le pasó al usuario la referencia HTML
   original y las pistas de Tailwind, pero no llegó a escribirlo. Referencia HTML original (de
   `index.html`):
   ```html
   <footer class="py-5 mt-5">
     <hr class="my-4">
     <div class="container">
       <div class="row g-4">
         <div class="col-md-4 text-center text-md-start">
           <img src="img/logo.png" alt="El Mas Riko" height="50">
           <p>Sanguches de milanesa tucumana, como tienen que ser...</p>
         </div>
         <div class="col-md-8 text-center text-md-end">
           <h5>CONTACTO</h5>
           <p>Peru 2973</p>
           <p>381-650-5653</p>
           <p>Desde 08 AM a 12 PM</p>
         </div>
       </div>
     </div>
     <hr class="my-4">
     <p class="text-center small">&copy; 2026 El Mas Riko. Todos los derechos reservados.</p>
   </footer>
   ```
   Pistas de Tailwind ya dadas: `flex flex-col md:flex-row justify-between gap-6` para las dos columnas
   (apiladas en mobile, lado a lado en `md:`+), `border-t` en vez de `<hr>`, y **`mt-auto`** en el `<footer>`
   — importante porque el `<body>` en `layout.tsx` tiene `flex flex-col`, así que `mt-auto` es lo que empuja
   el footer al fondo de la ventana aunque el contenido de la página sea corto.
2. Una vez escrito `Footer.tsx`, conectarlo en `layout.tsx` igual que `Navbar` (esta vez **después** de
   `{children}`, no antes).
3. Después del footer: construir el contenido real de `src/app/page.tsx` (Home) — Hero, sección "Nosotros",
   sección "Especialidades". Referencia HTML original completa en
   `elmasrico/ElMasRico/frontend/index.html`. Punto a decidir con el usuario cuando se llegue: el hero
   original tiene un carrusel de Bootstrap (JS con `data-bs-*`, requiere el JS bundle de Bootstrap) — como
   el proyecto usa Tailwind y no Bootstrap, hay que decidir entre (a) hero estático con una sola imagen,
   o (b) armar un carrusel simple como Client Component (primer uso real de `"use client"` + `useState` en
   el proyecto, podría ser una buena oportunidad pedagógica). Todavía no se habló de esto con el usuario.
4. Recién ahí, fase 4 del roadmap (Carta con datos reales de Prisma).

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
  `useState`/`onClick`/APIs de navegador) requiere `"use client"` como primera línea del archivo — no usado
  todavía en el proyecto, va a aparecer recién si se hace el carrusel del hero como Client Component.
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
  detectarlo a ojo comparando con lo esperado.

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
