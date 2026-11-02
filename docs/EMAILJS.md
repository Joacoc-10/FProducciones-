# Formulario de presupuesto (EmailJS) y Speed Insights

## Cómo funciona
- `src/components/quote/QuoteForm.tsx` usa el SDK oficial `@emailjs/browser` (`send`, con la clave pública por llamada, sin `init` global).
- La lógica de envío vive en `src/lib/quote-submit.ts` (configuración, parámetros de plantilla, un solo envío en curso, clasificación de errores).
- **Éxito** = EmailJS respondió HTTP 200 (aceptó el envío). No confirma que el correo haya llegado a la bandeja.
- **Sin reintentos automáticos** (podrían duplicar el correo). El botón «Reintentar envío» es manual; ante un error de red se recomienda WhatsApp porque no se sabe si el correo salió.
- **Sin configuración** (falta cualquiera de las tres variables): no se intenta enviar y se muestra la alternativa de WhatsApp.
- **Antispam:** honeypot (`website`, simula éxito sin enviar) y bloqueo local de envíos simultáneos. No se usa `blockHeadless` (bloquea Playwright y no aporta mucho) ni CAPTCHA (fricción). Las restricciones fuertes van en el panel de EmailJS (orígenes permitidos, ver abajo).

## Variables
```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
```
Se leen en el build (`NEXT_PUBLIC_*`): al cambiarlas en Vercel hay que **redeployar**. Cargarlas en `.env.local` y en Vercel (Production y, si querés probar, Preview).

## Configurar EmailJS
1. **Email Services → Add New Service**: conectá la casilla que envía (Gmail, Outlook, SMTP…). Copiá el *Service ID*.
2. **Email Templates → Create New Template**: copiá el *Template ID*.
3. **Account → General**: copiá la *Public Key*.
4. En la plantilla, pestaña de ajustes (Settings/Content):
   - **To Email**: la casilla de Fabio Producciones, escrita fija. Nunca una variable.
   - **From Name**: `Web Fabio Producciones`.
   - **Reply To**: `{{reply_to}}`.
   - **Subject**: `{{subject}}`.
   (Si tu plantilla no admite variables en esos campos, el editor lo indicará; en ese caso el asunto queda fijo, p. ej. `Nuevo pedido de presupuesto`.)

### Parámetros que envía el sitio
| Variable | Contenido |
|---|---|
| `{{subject}}` | `Nuevo pedido de presupuesto — <tipo de evento>` |
| `{{name}}` | Nombre |
| `{{phone}}` | Teléfono / WhatsApp |
| `{{email}}` | Email, o `No informado` |
| `{{reply_to}}` | Email crudo; **vacío** si no lo informó (solo para Reply To) |
| `{{event_type}}` | Tipo de evento |
| `{{event_date}}` | `yyyy-mm-dd` o `Sin definir` |
| `{{location}}` | Lugar |
| `{{services}}` | Servicios separados por coma |
| `{{guests}}` | Invitados o `Sin definir` |
| `{{comment}}` | Comentario o `—` |

### Cuerpo sugerido
```
Nuevo pedido de presupuesto desde la web

Nombre: {{name}}
Teléfono / WhatsApp: {{phone}}
Email: {{email}}

Evento: {{event_type}}
Fecha: {{event_date}}
Lugar: {{location}}
Servicios: {{services}}
Invitados: {{guests}}

Comentario:
{{comment}}
```
Usá `{{ }}` (escapa HTML), no `{{{ }}}`.

## Restringir orígenes
En el panel de EmailJS (**Account → Security**) cargá los dominios permitidos (el de producción y, si hace falta, `localhost` para probar) y activá lo que ofrezca tu plan (p. ej. reCAPTCHA o clave privada, que **no** se pueden usar desde el navegador sin exponerlas). Las opciones varían según el plan: verificá en tu cuenta qué está disponible. La clave pública es visible en el sitio por diseño; esta restricción es la defensa principal.

## Prueba real (pendiente)
Todavía no se envió ningún correo real. Una vez cargadas las variables, hacé un envío desde un deploy o `npm run dev` y comprobá: llegada a la bandeja correcta, asunto, Reply-To con y sin email, y revisión de spam. Si Reply To queda vacío cuando no hay email y EmailJS rechaza el envío, avisá y se ajusta.

## Speed Insights
- `@vercel/speed-insights` se monta una sola vez en `src/app/layout.tsx` (raíz, incluye la 404) mediante `src/components/analytics/SiteSpeedInsights.tsx`.
- `beforeSend` deja solo origen + ruta (sin query ni hash; ver `src/lib/speed-insights.ts`). No se envían datos del formulario.
- **Activación en Vercel:** Proyecto → Speed Insights → *Enable*; luego redeploy. Verificación tras el deploy: en la pestaña Network aparece una petición a `/_vercel/speed-insights/script.js` (o la ruta `/<unique-path>/script.js`) y POST a `.../vitals`; los datos tardan en aparecer en el panel (necesitan visitas reales).
- No se usa Web Analytics.
