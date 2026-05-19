```mermaid
graph TD
    classDef pantalla fill:#1A3834,stroke:#FBFAF4,stroke-width:2px,color:#FBFAF4;
    classDef accion fill:#FF5A1F,stroke:#1A3834,stroke-width:1px,color:#FBFAF4;
    classDef decision fill:#F5F3EB,stroke:#1A3834,stroke-width:2px,color:#1A3834;
    classDef sistema fill:#1A2B42,stroke:#FBFAF4,stroke-width:1px,color:#FBFAF4;

    A[acceso_plataforma.html <br> Landing Split Screen]:::pantalla --> B(Click en 'Continuar con Google'):::accion
    B --> C[API Google Auth]:::sistema
    C --> D{¿Usuario Registrado?}:::decision
    
    D -- No (Nuevo) --> E[API: Registrar Atleta <br> con Nombre e Email]:::sistema
    D -- Sí (Existente) --> F[API: Verificar Roles y Permisos]:::sistema
    
    E --> G[home_principal.html <br> Welcome Hub]:::pantalla
    F --> G
    
    G --> H(Click en 'Equipos'):::accion
    H --> I[explorador_equipos.html]:::pantalla
    
    I --> J(Click en 'Solicitar Unirse' a un Equipo):::accion
    J --> K{¿Datos de Seguridad <br> Completos?}:::decision
    
    K -- No --> L[Mostrar Modal <br> popup_datos_atleta.html]:::pantalla
    L --> M(Ingresar Teléfono, Nacimiento <br> y Contacto de Emergencia):::accion
    M --> N(Click en 'Guardar y Enviar'):::accion
    N --> O[API: Guardar Perfil y <br> Registrar Solicitud]:::sistema
    
    K -- Sí --> P[API: Registrar Solicitud]:::sistema
    
    O --> Q[explorador_equipos.html <br> Estado: Solicitud Enviada]:::pantalla
    P --> Q
    
    Q --> R{¿Aprobado por Admin <br> - Ruta B, Paso 3?}:::decision
    
    R -- Espera / No --> Q
    R -- Sí --> S[pagina_equipo.html <br> Panel de Club del Atleta]:::pantalla
    
    S --> T{Interactuar en el Equipo}:::decision
    T --> T1[eventos.html <br> Buscador de Eventos]:::pantalla
    T --> T2[dashboard_atleta.html <br> Pestaña: Mis tickets]:::pantalla
    T --> T3[dashboard_atleta.html <br> Pestaña: Mi perfil <br> (Datos Google, Seguridad, Apto)]:::pantalla
    T --> T4[pagina_equipo.html <br> Pestaña: Mi Suscripción]:::pantalla
    
    T3 --> U(Subir PDF/JPG de Apto Médico):::accion
    U --> V[API: Subir Archivo y <br> Actualizar Estado de Apto]:::sistema
    V --> W[Estado Apto: Pendiente de Revisión]:::pantalla

    T4 --> X(Subir comprobante de pago):::accion
    X --> Y[API: Guardar Comprobante <br> y cambiar estado de cuota]:::sistema
    Y --> Z[Estado Cuota: Pendiente]:::pantalla
```
