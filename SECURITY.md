# Política de seguridad

## Alcance

Este repositorio contiene una versión de estudio para un grupo cerrado de compañeros. El acceso es un filtro básico, no un sistema de autenticación de nivel profesional.

## Modelo de acceso

- Hay 10 usuarios de la aplicación, no cuentas de GitHub.
- Cada usuario tiene una sal aleatoria y una clave verificada con PBKDF2-SHA-256 y 210.000 iteraciones.
- `usuarios.js` solo contiene sales y hashes. No contiene claves en texto plano.
- La sesión dura 8 horas, se guarda en `sessionStorage` y se pierde al cerrar el navegador.
- El botón **Salir** elimina la sesión.
- Después de 5 intentos fallidos, el usuario se bloquea durante 5 minutos.

## Manejo de credenciales

- `usuarios-clase.txt` contiene las claves para entregar a los compañeros. Está incluido en `.gitignore` y no debe subirse al repositorio.
- No se deben publicar claves en issues, capturas, chats grupales ni commits.
- Si una clave se filtra, se debe generar una nueva, actualizar `usuarios.js` y volver a entregarla por un canal privado.

## Límites conocidos

GitHub Pages es un servicio de archivos estáticos. Por eso:

- El control de acceso se ejecuta en el navegador y puede ser evadido por una persona con conocimientos técnicos.
- Los archivos del sitio son públicos aunque la pantalla de acceso bloquee la interfaz.
- El bloqueo por intentos se guarda en el navegador y no puede impedir un ataque externo.
- Este sitio no debe usarse para datos personales, pagos, calificaciones oficiales ni información confidencial.

Para autenticación real se necesita un servicio con servidor, por ejemplo Supabase Auth, Cloudflare Access o un repositorio privado con GitHub Pages de pago.

## Privacidad

- No se solicitan correos, teléfonos ni datos personales.
- El avance de estudio se guarda solo en `localStorage` del dispositivo de cada persona.
- No hay analítica, publicidad ni rastreadores.

## Reporte

Si encuentras una falla o una clave expuesta, informa en privado a la persona que administra el repositorio. No publiques credenciales en un issue.
