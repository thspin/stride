# Ciclo de Vida de la Suscripción (Pagos)

Los estados de cobro mensuales se definen de manera particular para cada atleta por su membresía en un club. Los estados posibles son **Pagado**, **Vencido** y **Pendiente** (de verificación).

```mermaid
stateDiagram-v2
    [*] --> Pendiente : Admisión en Equipo (Pago Inicial Requerido)
    Pagado --> Vencido : Fin de ciclo mensual sin cobro registrado
    Vencido --> Pendiente : Atleta sube comprobante de pago en pagina_equipo.html
    Pendiente --> Pagado : Administrador aprueba comprobante en admin_dashboard.html (Confirma y elige medio de pago)
    Pendiente --> Vencido : Administrador rechaza comprobante (Confirma rechazo, pide nueva carga)
    Vencido --> Pagado : Administrador verifica pago manual directo (Confirma y elige medio de pago directo)
```
