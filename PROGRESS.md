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
2. **Modelo de datos con Prisma** 🚧 EN CURSO (2026-08-01) — ver detalle en "Estado de la fase 2" abajo
   - Instalar Prisma ✅, definir `schema.prisma` con las 6 tablas (ver esquema abajo) ⬅️ acá quedamos.
   - Conectar a la MySQL de XAMPP (credenciales confirmadas: `root`, sin password, base `elmasrico`).
3. Landing pública (Server Components, layout)
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
4. **Siguiente paso real: conectar el schema contra la base `elmasrico` ya existente y confirmar que
   coincide.** Como la base ya tiene datos, NO correr `migrate dev` a ciegas — usar `npx prisma db pull`
   (introspección, comparar contra lo escrito a mano) o `npx prisma migrate diff` primero.

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

### Dónde retomar exactamente

Los 6 modelos ya están escritos, validados y formateados en `prisma/schema.prisma` (ver el archivo, no hace
falta repetirlos acá). Lo que sigue es **verificar el schema escrito a mano contra la base real
`elmasrico`** (que ya tiene datos) antes de generar el Prisma Client:

- Opción segura: `npx prisma db pull` sobre una copia de la base, comparar el resultado contra lo que se
  escribió a mano.
- Alternativa: `npx prisma migrate diff` para ver diferencias sin tocar nada.
- Evitar `npx prisma migrate dev` a ciegas — podría intentar alterar una base con datos existentes.

Una vez confirmado que coincide, el paso lógico siguiente es `npx prisma generate` (genera el Prisma Client
en `src/generated/prisma`) y probar una query real desde código — eso empalma con la fase 3 del roadmap
(landing pública / primer uso de Prisma Client en una página).

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
