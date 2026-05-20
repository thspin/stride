# Ciclo de Vida del Apto Médico (Aprobación Relacional)

El apto médico tiene un estado de aprobación **relacional** (por membresía). Aunque el atleta sube el documento de forma global en su perfil, cada administrador de club evalúa y audita de forma independiente el certificado para su propia institución, determinando su vigencia de 1 a 12 meses.

```mermaid
stateDiagram-v2
    [*] --> No_Entregado : Alta en el equipo
    No_Entregado --> En_Revision : Atleta sube PDF/JPG
    En_Revision --> Vigente : Administrador valida PDF y define vigencia (1-12 meses)
    En_Revision --> Rechazado : Administrador rechaza e ingresa motivo de rechazo
    Rechazado --> En_Revision : Atleta visualiza motivo y sube archivo corregido
    Vigente --> Vencido : Fecha actual > Fecha de vencimiento (Cálculo dinámico al vuelo)
    Vencido --> En_Revision : Atleta sube renovación
```
