# El Mas Riko → Next.js — Progreso y contexto

Reescritura de [ElMasRico](/Users/ramirouehara/Desktop/elmasrico/ElMasRico) (sistema de gestión para una
sangucheria) usando Next.js, como proyecto de aprendizaje. La app original está documentada en
`elmasrico/ElMasRico/DOCUMENTACION.md` (frontend HTML/CSS/JS vanilla + Bootstrap, backend Express + MySQL,
auth JWT+bcrypt).

**Este archivo es el resumen corto.** El detalle fase por fase (qué se hizo, errores cometidos y corregidos)
está en [`docs/bitacora-fases.md`](docs/bitacora-fases.md), los conceptos de Next/React/Prisma ya explicados
en [`docs/conceptos-next.md`](docs/conceptos-next.md), y las notas de transferencia a LANCER en
[`docs/lancer-transferencia.md`](docs/lancer-transferencia.md).

## ⭐ Para qué existe este proyecto

**No es un proyecto en sí mismo: es la Fase 0 de LANCER**, la app de gestión que el usuario está armando de
verdad (inbox unificado de WhatsApp/Instagram/Facebook + IA para filtrar leads + CRM + métricas + stock;
`PLANNING.md` propio, 8 fases, ~235h). Stack de LANCER: Next.js App Router, PostgreSQL, Prisma, Socket.io,
API de Claude, deploy en Railway/Render como servidor persistente (no serverless).

ElMasRico es el vehículo de aprendizaje: el usuario ya conoce el dominio de memoria, así que lo único nuevo
es el framework. **Lo que importa es el flujo de Next.js, no terminar la sangucheria ni pulir el CSS** — sus
preguntas fueron todas sobre routing, layouts, `children`, Server vs Client, de dónde salen los datos;
ninguna sobre Tailwind. Priorizar conceptos transferibles a LANCER por sobre completitud del proyecto. Ver
[`docs/lancer-transferencia.md`](docs/lancer-transferencia.md) para el detalle de qué transfiere y qué
corregir del plan original.

## Cómo se trabaja esto (importante para retomar)

- El usuario sabe algo de React/Next/TypeScript pero no a fondo. El objetivo es que **programe él**,
  entendiendo cada paso — no que Claude escriba todo el código de una.
- Guiar fase por fase del roadmap de abajo, explicando conceptos de Next.js a medida que aparecen, y dejar
  que el usuario escriba el código, revisando/corrigiendo. No avanzar de fase sin que la anterior esté
  entendida y funcionando.
- **Boilerplate vs. lógica de la app**: la infraestructura (`lib/prisma.ts`, config) se pasa por el chat con
  explicación línea por línea, no se espera que la escriba de memoria; la lógica (queries, `.map()`,
  formularios, CRUD) sí la escribe él.
- ⭐ **Respuestas CORTAS y directas** (pedido explícito el 2026-08-04): por default 3-5 líneas, la respuesta
  primero, sin recapitular lo ya visto; extenderse solo para un concepto genuinamente nuevo.
- ⭐ **Código EXPLÍCITO, sin atajos idiomáticos** (2026-08-04): enumerar las claves de un objeto una por una
  en vez de `...spread`, tipo literal en vez de `Omit`/`&`/genéricos, variables intermedias en vez de
  encadenar. El atajo solo si lo pide él — el costo de comprensión es mayor que lo que ahorra en tipeo.

## Decisiones tomadas

- **Alcance**: full-stack en Next.js (App Router), backend con Route Handlers/Server Actions, no se reutiliza
  `backend2` (Express) tal cual — sirve de referencia para la lógica de negocio.
- **DB**: Prisma sobre la misma MySQL (XAMPP) del proyecto original. **Estilos**: Tailwind (reemplaza
  Bootstrap 5). **Lenguaje**: TypeScript en todo.

## Roadmap

1. **Setup del proyecto** ✅ DONE (2026-07-31)
2. **Modelo de datos con Prisma** ✅ DONE (2026-08-02)
3. **Landing pública** ✅ DONE (2026-08-04) — Navbar, Footer, Hero, Nosotros, Especialidades
4. **Carta** ✅ DONE (2026-08-04) — `/carta`, productos agrupados por categoría desde Prisma
5. **Formulario de pedido público** 🟡 **CASI DONE** — `/pedidos` anda de punta a punta, quedan 3 pendientes
   menores. ⬅️ **ACÁ RETOMAR**, ver abajo.
6. **Login/Auth** — JWT en cookie httpOnly + middleware. Alta prioridad: es la Fase 1 de LANCER.
7. **Dashboard: CRUD de categorías** — el patrón completo (leer, crear, editar, borrar, revalidar). Última
   fase con contenido nuevo.
8. ~~CRUD de productos/clientes/pedidos/usuarios~~ ❌ SE SALTEA — mismo patrón de la fase 7 repetido, cero
   conceptos nuevos. Al terminar la fase 7 se salta directo a LANCER.
9. **`<Suspense>` + streaming** — ~30 min, se puede hacer en cualquier momento. Único concepto central de
   LANCER (streaming de respuestas de IA) que el roadmap no cubría.

### Estado del flujo de Next.js (lo que de verdad se está midiendo)

- ✅ **Lectura completa**: request → Server Component `async` → Prisma → HTML.
- ✅ **Escritura abierta**: form → Server Action → Prisma → base. Verificado contra MySQL. Falta
  revalidación/feedback y la transacción (fase 5).
- ❌ **Revalidación** (`revalidatePath`/`redirect`/`useActionState`): fases 5 y 7.
- ❌ **Streaming/Suspense**: fase 9.

## Estado actual del proyecto Next.js

Creado con `create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`.

- `next@16.2.12`, `react@19.2.4`, `tailwindcss@4`, `prisma`/`@prisma/client@7.9.1`,
  `@prisma/adapter-mariadb@7.9.1`, `mariadb@3.5.3`
- Rutas: `/`, `/carta`, `/pedidos` (`/login` da 404 a propósito, fase 6, ya linkeada desde el Navbar)
- Estructura clave: `src/app/layout.tsx`, `src/app/carta/page.tsx`, `src/app/pedidos/page.tsx` +
  `actions.ts`, `src/components/` (Navbar, Footer, HeroCarousel, FormPedido), `src/lib/prisma.ts`
  (singleton, único lugar donde se instancia el cliente)
- Para retomar: `npm run dev` desde la raíz. MySQL de XAMPP tiene que estar prendido.
- `npm audit`: 12 "high" en dependencias transitivas del scaffold, no bloqueante.

## Git / GitHub

- Remoto: `origin` → `https://github.com/ramirouehara/el-mas-riko-nextjs.git`, pusheado y sincronizado.
- Al cierre de la segunda sesión del 2026-08-04 queda sin commitear: este archivo, `src/app/carta/page.tsx`
  (el `force-dynamic`), `src/app/pedidos/page.tsx`, `src/app/pedidos/actions.ts`,
  `src/components/FormPedido.tsx`. El usuario commitea y pushea él.
- El usuario corre los comandos de git él mismo en su terminal, como parte del aprendizaje.
- Si reaparece un 403 al pushear: ver la receta ya usada en
  [`docs/bitacora-fases.md`](docs/bitacora-fases.md#git--github) (credencial vieja en el Keychain de macOS).

## ⬅️ Dónde retomar: fase 5, pendientes en orden de valor

1. **La transacción** (lo más importante, único con contenido nuevo, ~10 min): hoy los tres `create`
   (`cliente`→`pedido`→`detallePedido`) son independientes — si falla el 2do o 3ro, el cliente ya quedó
   escrito. Envolver con `prisma.$transaction`. Transfiere directo a LANCER (crear lead + conversación +
   mensaje tiene la misma forma).
2. **Feedback y refresco**: hoy al enviar el form no pasa nada visible. Entran `revalidatePath`, `redirect`
   y `useActionState` (el `pending`).
3. **Filtrado de productos por categoría** (opcional, se salteó a propósito — es `useState` puro, cero Next).
4. Clases de Tailwind (el form está pelado). Cosmético.
5. Un `const detalle = ...` sin usar en `actions.ts`.

Ver el detalle completo de qué se hizo en la fase 5 (incluido el hallazgo sobre `Decimal` y cómo se resolvió)
en [`docs/bitacora-fases.md`](docs/bitacora-fases.md).
