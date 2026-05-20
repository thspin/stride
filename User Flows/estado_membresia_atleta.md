# Ciclo de Vida de la Membresía (Relación Atleta-Club)

Un usuario puede pertenecer a varios clubes en paralelo como atleta. Por lo tanto, este ciclo de vida se evalúa de manera independiente para cada relación específica entre un Atleta y un Club. Además, el mismo usuario puede tener roles administrativos en otros clubes.

```mermaid
stateDiagram-v2
    [*] --> Registrado : Google Auth (Sin membresía activa en este club)
    Registrado --> Solicitud_Pendiente : Clic en Unirse (Formulario Seguridad OK en popup_datos_atleta.html)
    Solicitud_Pendiente --> Miembro_Activo : Administrador aprueba en admin_dashboard.html (Admitir)
    Solicitud_Pendiente --> Solicitud_Rechazada : Administrador rechaza
    Solicitud_Rechazada --> Registrado : Reintento (Permite postular a este u otro club)
    Miembro_Activo --> [*] : Baja Autónoma del Atleta (Confirmación UI)
    Miembro_Activo --> [*] : Expulsión por Administrador (Confirmación UI)
```
