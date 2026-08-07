# LANCER — qué transfiere, qué corregir del plan y qué de-riskear

Notas sacadas de leer el `PLANNING.md` de LANCER contra lo aprendido en ElMasRico, para no perderlas
entre sesiones. Ver `PROGRESS.md` para el contexto de por qué existe este proyecto.

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
