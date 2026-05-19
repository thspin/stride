# Stride — Diagrama Técnico de Flujos de Usuario (User Flows)

Este documento contiene la especificación de flujo unificada para la plataforma **Stride**. Integra el frontend del atleta, el backend/base de datos y el panel del administrador en un diagrama único y profundo que describe la arquitectura del sistema, el ciclo de vida de los datos y las transiciones de estado.

---

## 🗺️ Diagrama de Flujo Unificado y Profundo

Este diagrama representa las interacciones de punta a punta entre los **Atletas**, el **Sistema central (Backend/DB)** y el **Administrador (SaaS)**.

```mermaid
graph TD
    %% Definición de estilos CSS
    classDef atleta fill:#1A3834,stroke:#FBFAF4,stroke-width:2px,color:#FBFAF4;
    classDef admin fill:#FF5A1F,stroke:#1A3834,stroke-width:2px,color:#FBFAF4;
    classDef backend fill:#1A2B42,stroke:#FBFAF4,stroke-width:1.5px,color:#FBFAF4;
    classDef decision fill:#FBFAF4,stroke:#1A3834,stroke-width:2px,color:#1A3834;
    classDef estado fill:#F5F3EB,stroke:#FF5A1F,stroke-width:1px,color:#1A3834;

    %% --- SUBGRAFO: ATLETA (FRONTEND) ---
    subgraph Atleta ["🏃‍♂️ CAPA ATLETA (FRONTEND)"]
        A1["Landing Page acceso_plataforma.html"]:::atleta
        A2("Hacer clic en 'Continuar con Google'"):::atleta
        A3["Home Principal home_principal.html"]:::atleta
        A4["Explorador de Equipos explorador_equipos.html"]:::atleta
        A5("Clic en 'Solicitar Unirse'"):::atleta
        A6["Modal: popup_datos_atleta.html"]:::atleta
        A7("Enviar Formulario de Seguridad"):::atleta
        A8["explorador_equipos.html (Estado: Solicitud Enviada)"]:::atleta
        A9["Página de Club pagina_equipo.html"]:::atleta
        A10["Mi perfil dashboard_atleta.html"]:::atleta
        A11("Subir Archivo PDF/JPG (Apto Médico)"):::atleta
        A12["pagina_equipo.html (Pestaña Suscripción)"]:::atleta
        A13("Subir Comprobante de Pago (PDF/JPG)"):::atleta
    end

    %% --- SUBGRAFO: BACKEND & DATABASE ---
    subgraph Backend ["🖥️ CAPA SISTEMA (BACKEND & DATABASE)"]
        S1["Autenticación Google OAuth API"]:::backend
        S2{"¿Email registrado en DB?"}:::decision
        S3["Crear registro en DB <br>(Nombre, Email) <br> Estado de Membresías: 'Vacío'"]:::backend
        S4["Iniciar Sesión de Atleta <br>(Generar Token JWT y verificar Roles)"]:::backend
        S5{"¿Atleta tiene <br> Teléfono, Nac. <br> y Emergencia en DB?"}:::decision
        S6["Guardar datos de seguridad y <br> Registrar Solicitud de Club <br> Estado Solicitud: 'Pendiente'"]:::backend
        S7{"¿Estado de Solicitud <br> de Club en DB?"}:::decision
        S8["Registrar Solicitud de Club <br> Estado Solicitud: 'Pendiente'"]:::backend
        S9["Almacenar Certificado Médico <br>(Cloud Storage & URL en DB) <br> Estado Apto: 'En Revisión'"]:::backend
        S10["Crear Relación Atleta-Equipo <br> Estado Solicitud: 'Aprobada' <br> Membresía: 'Activo' <br> Estado Pago: 'Pendiente'"]:::backend
        S11["Actualizar Relación Atleta-Equipo <br> Estado Solicitud: 'Rechazada'"]:::backend
        S12["Almacenar Comprobante de Pago <br>(Cloud Storage) <br> Estado Pago: 'Pendiente'"]:::backend
        S13["Actualizar Estado de Pago <br> Estado Pago: 'Pagado' <br> Guardar Medio de Pago (Efectivo/Transfer/etc.)"]:::backend
        S14["Actualizar Estado de Apto <br> Calcular vencimiento (hoy + N meses) <br> Estado Apto: 'Vigente'"]:::backend
        S15["Actualizar Estado de Apto <br> Estado Apto: 'Rechazado'"]:::backend
        S16["Actualizar Estado de Pago <br> Estado Pago: 'Vencido' <br> Notificar comprobante rechazado"]:::backend
    end

    %% --- SUBGRAFO: ADMINISTRADOR (FRONTEND) ---
    subgraph Admin ["💼 CAPA ADMINISTRADOR (FRONTEND)"]
        AD1["Landing Page acceso_plataforma.html"]:::admin
        AD2("Hacer clic en 'Continuar con Google'"):::admin
        AD4["Dashboard Principal Admin admin_dashboard.html"]:::admin
        AD5{"¿Admitir o Rechazar Solicitud?"}:::decision
        AD6["Tabla: Atletas y Suscripciones (admin_dashboard.html)"]:::admin
        AD7("Auditar Pago: Comprobante y selector de medio de pago"):::admin
        AD12{"¿Aprobar o Rechazar Pago?"}:::decision
        AD8("Marcar como 'Pagado' (Elegir método)"):::admin
        AD13("Hacer clic en 'Rechazar Pago'"):::admin
        AD9["Tabla: Aptos Médicos (admin_dashboard.html)"]:::admin
        AD10{"¿Aprobar o Rechazar Certificado?"}:::decision
        AD11("Configurar vigencia del Apto: Selector 1 a 12 meses"):::admin
    end

    %% --- FLUJO DE CONEXIÓN ---
    
    %% Flujo 1: Acceso del Atleta
    A1 --> A2
    A2 --> S1
    S1 --> S2
    S2 -- No --> S3
    S3 --> S4
    S2 -- Sí --> S4
    S4 --> A3

    %% Flujo 2: Navegación & Selección de Equipo
    A3 --> |"Ir a Equipos"| A4
    A4 --> A5
    A5 --> S5
    
    %% Flujo 3: Evaluación de Datos del Atleta
    S5 -- No --> A6
    A6 --> A7
    A7 --> S6
    S5 -- Sí --> S8
    
    S6 --> A8
    S8 --> A8

    %% Sincronización 1: El Atleta espera a que el Administrador actúe
    A8 --> S7
    S7 -- Pendiente --> A8
    S7 -- Aprobada --> A9
    
    %% Flujo 4: Acceso y Control del Administrador
    AD1 --> AD2
    AD2 --> S1
    S1 --> S4
    S4 --> |"Si tiene rol Admin"| AD4
    
    %% Sincronización 2: El Administrador resuelve la solicitud del Atleta
    S6 -.-> |"Disparador: <br> Nueva Solicitud en DB"| AD4
    S8 -.-> |"Disparador: <br> Nueva Solicitud en DB"| AD4
    
    AD4 --> |"Pestaña Solicitudes"| AD5
    AD5 -- Admitir --> S10
    AD5 -- Rechazar --> S11
    S10 -.-> |"Notificación / Refresco de Estado"| S7
    
    %% Flujo 5: Gestión de Suscripciones por el Administrador
    AD4 --> |"Pestaña Atletas"| AD6
    A9 --> |"Renovar cuota"| A12
    A12 --> A13
    A13 --> S12
    S12 -.-> |"Disparador: Pago Pendiente"| AD6
    AD6 --> AD7
    AD7 --> AD12
    AD12 -- Aprobar --> AD8
    AD12 -- Rechazar --> AD13
    AD8 --> S13
    AD13 --> S16
    S13 -.-> |"Reflejo de Pago Exitoso (Pagado)"| A12
    S16 -.-> |"Reflejo de Pago Fallido (Vencido)"| A12
    
    %% Flujo 6: Carga de Apto Médico por el Atleta
    A10 --> A11
    A11 --> S9
    
    %% Sincronización 3: Auditoría Médica por el Administrador
    S9 -.-> |"Disparador: Apto en 'En Revisión'"| AD9
    AD4 --> |"Pestaña Aptos"| AD9
    AD9 --> AD10
    AD10 -- Aprobar --> AD11
    AD11 --> S14
    AD10 -- Rechazar --> S15
    S14 -.-> |"Cambio de Estado en UI"| A10
    S15 -.-> |"Notificación de Rechazo en UI"| A10
```

---

## 🔄 Estados de Base de Datos y Ciclos de Vida

El backend de Stride opera bajo tres ciclos de vida de estado independientes por cada relación atleta-club.

### 1. Ciclo de Vida de la Membresía del Atleta (Relación Atleta-Equipo)

Un atleta puede pertenecer a múltiples equipos en paralelo. En cada uno, la membresía mantiene su propio estado lógico:

```mermaid
stateDiagram-v2
    [*] --> Registrado : Google Auth (Sin membresías en este club)
    Registrado --> Solicitud_Pendiente : Clic en Unirse (Formulario Seguridad OK)
    Solicitud_Pendiente --> Miembro_Activo : Administrador aprueba (Admitir)
    Solicitud_Pendiente --> Solicitud_Rechazada : Administrador rechaza
    Solicitud_Rechazada --> Registrado : Reintento / Selección de otro club
    Miembro_Activo --> [*] : Salir del Equipo / Baja
```

### 2. Ciclo de Vida del Apto Médico (Certificado Relacional)

El apto médico vive en el perfil del atleta, pero es auditado de forma independiente por el administrador de cada club al que pertenece. La vigencia calculada es variable (de 1 a 12 meses):

```mermaid
stateDiagram-v2
    [*] --> No_Entregado : Alta en el equipo
    No_Entregado --> En_Revision : Atleta sube PDF/JPG en dashboard_atleta.html
    En_Revision --> Vigente : Admin aprueba indicando meses de validez (Calcula: Hoy + N meses)
    En_Revision --> Rechazado : Admin invalida PDF (ilegible/incorrecto)
    Rechazado --> En_Revision : Atleta vuelve a subir archivo corregido
    Vigente --> Vencido : Fecha actual > Fecha de vencimiento calculada
    Vencido --> En_Revision : Atleta sube renovación
```

### 3. Ciclo de Vida de la Suscripción (Pagos del Club)

El ciclo de facturación es particular de cada relación Atleta-Club y gestiona los estados de cobro del mes corriente:

```mermaid
stateDiagram-v2
    [*] --> Pendiente : Admisión en Equipo (Pago Inicial Requerido)
    Pagado --> Vencido : Fin del ciclo de facturación mensual sin cobro registrado
    Vencido --> Pendiente : Atleta sube comprobante de pago en pagina_equipo.html
    Pendiente --> Pagado : Administrador aprueba comprobante (Confirma y elige medio de pago)
    Pendiente --> Vencido : Administrador rechaza comprobante (Confirma y notifica)
    Vencido --> Pagado : Administrador verifica pago manual directo (Confirma y elige medio de pago)
```

---

## 🚦 Gestión de Excepciones y Flujos Alternos

1. **Fallo en Google Auth:**
   * **Problema:** El usuario cancela la selección de cuenta de Google o la API externa no responde.
   * **Resolución:** El frontend atrapa la promesa fallida del SDK de Google, no realiza ninguna petición al backend y permanece en [acceso_plataforma.html](file:///c:/Users/pnm19/OneDrive/Documents/stride/Wireframes%20UI/acceso_plataforma.html) permitiéndole reintentar.

2. **Formulario de Seguridad Incompleto:**
   * **Problema:** El Atleta intenta unirse a un club sin datos de seguridad mínimos.
   * **Resolución:** El backend realiza validaciones estrictas a nivel de API (validación de esquemas). Si los campos obligatorios están ausentes o vacíos, la API devuelve `400 Bad Request` y el frontend abre el modal [popup_datos_atleta.html](file:///c:/Users/pnm19/OneDrive/Documents/stride/Wireframes%20UI/popup_datos_atleta.html).

3. **Rechazo de Documento Médico:**
   * **Problema:** Un atleta sube un PDF vacío o una foto borrosa.
   * **Resolución:** El administrador presiona "Rechazar" en el panel. El backend cambia el estado de la propiedad `medical_certificate_status` a `Rejected`. En la próxima recarga del Atleta, la pestaña *Mi perfil* de [dashboard_atleta.html](file:///c:/Users/pnm19/OneDrive/Documents/stride/Wireframes%20UI/dashboard_atleta.html) muestra el error en color rojo con opción de volver a cargar.

4. **Persistencia en Estado Vencido de Cobro:**
   * **Problema:** El atleta acumula facturas sin pagar o su comprobante es rechazado.
   * **Resolución:** El sistema cambia automáticamente el estado de su cuota a `Vencido` en ese club. El atleta visualiza en su pestaña *Mi Suscripción* en [pagina_equipo.html](file:///c:/Users/pnm19/OneDrive/Documents/stride/Wireframes%20UI/pagina_equipo.html) un banner con advertencia en color rojo y el cargador de comprobante habilitado.

5. **Rechazo de Comprobante de Pago por el Administrador:**
   * **Problema:** El atleta carga un archivo incorrecto o inválido como comprobante.
   * **Resolución:** El administrador hace clic en "Rechazar Pago" (previa confirmación por pop-up). El backend cambia el estado del cobro a `Vencido` e invalida el comprobante actual. En la próxima sesión, el atleta verá en su pestaña *Mi Suscripción* el estado de deuda y una alerta indicando que su comprobante fue rechazado, solicitando una nueva carga.
