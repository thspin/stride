# Stride — Stack Tecnológico

Este documento define la arquitectura y el conjunto de tecnologías (Tech Stack) seleccionados para el desarrollo de la plataforma **Stride**. Esta decisión tecnológica se ajusta perfectamente a la arquitectura de sistema previamente definida: soporte para dos actores principales (Atletas y Administradores), rutas autenticadas, estados dinámicos controlados vía API, y un diseño enfocado en la experiencia móvil (*mobile-first*).

---

## 🛠 Framework Principal y Arquitectura
### Next.js 14 (con App Router)
Next.js actuará como el corazón del proyecto, centralizando tanto el Frontend como la API en un solo repositorio y despliegue (Full-stack Framework).
*   **Server Components**: Se utilizarán para renderizar vistas públicas y de poco cambio interactivo desde el servidor, como la *Landing Page* y el *Explorador de Equipos/Eventos*, mejorando radicalmente la carga inicial y el SEO.
*   **Client Components**: Se utilizarán para las vistas altamente interactivas, como el *Dashboard del Atleta* o los formularios de administración.
*   **Route Handlers**: Reemplazarán la necesidad de contar con un servidor de backend independiente (como Express o NestJS) durante la fase inicial. Facilitarán la gestión de los estados lógicos de las bases de datos.

## 🎨 Interfaz de Usuario (UI) y Diseño
### shadcn/ui
Alineado de forma directa con nuestro requerimiento de consistencia y reutilización (componentes en forma de tarjetas, badges, botones unificados, y modos oscuro/claro).
*   **Posesión del código**: No se instala como una dependencia estándar, sino que copia el código fuente de los componentes al proyecto.
*   **Reutilización**: Un componente base como `<Card>`, `<Button>` o `<Badge>` será exactamente el mismo en el panel del Atleta que en la bandeja de entrada del Administrador.
*   **Personalización**: Permite modificar la estética base sin riesgos de romper la UI en futuras actualizaciones del paquete.

### CSS View Transitions
Se incluye soporte nativo y experimental para micro-interacciones de la interfaz entre cambios de vista, mejorando la percepción de calidad del producto (sensación de app nativa).
```css
::view-transition-group(*),
::view-transition-old(*),
::view-transition-new(*) {
  animation-duration: 0.25s;
  animation-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
}
```

## 🔐 Autenticación y Autorización
### NextAuth.js (Inicio de Sesión Unificado)
Proporciona integración rápida, nativa y segura para nuestra capa de acceso.
*   **Google OAuth (Cero Fricción)**: Todos los usuarios (atletas y administradores) iniciarán sesión a través del proveedor de Google OAuth de NextAuth.js. No existe un login clásico de contraseñas.
*   **Detección Dinámica de Roles**: Al iniciar sesión, el sistema verifica el email en la base de datos de Stride y valida sus permisos y relaciones.
*   **Soporte Multi-Club y Multi-Rol**: La arquitectura de base de datos admite que un usuario tenga múltiples registros de membresía en paralelo (atleta en club X, atleta en club Y) y posea simultáneamente roles de administración (administrador del club Z, atleta en club X). El token JWT y la sesión del usuario reflejan dinámicamente estos permisos cruzados.
*   **Seguridad y Middleware**: Las llamadas a API y las páginas protegidas se aseguran mediante Middleware de Next.js, previniendo accesos no autorizados basados en los roles detectados.

## 🗄️ Base de Datos, Backend y Almacenamiento
### Supabase
Actuará como nuestro motor de persistencia de datos (Backend as a Service).
*   **PostgreSQL**: Base de datos relacional gestionada y robusta, fundamental para rastrear las relaciones entre *Atletas*, *Equipos*, *Cuotas* e *Inscripciones*.
*   **Supabase Storage**: Integración inmediata de contenedores en la nube (Buckets), solucionando la necesidad crítica de almacenar los archivos de *Certificados Médicos* (PDF o imágenes jpg/png) enviados por el atleta.
*   **Escalabilidad**: Provee una API auto-generada ideal para las iteraciones tempranas. Al basarse en PostgreSQL, permite migrar la información sin penalización técnica si el proyecto requiere un ORM o instancia propia en el futuro.
