# Plantilla de ADR (Architecture Decision Record)

Este documento es una plantilla de ADR (Architecture Decision Record): un formato breve y estandarizado para capturar una decision de diseno (o arquitectonica) importante del proyecto y dejar constancia de por que se tomo, que alternativas se evaluaron y que implicaciones tendra a partir de ahora. La idea es que cada ADR viva dentro del repositorio (por ejemplo en `/docs/adr/`) con un identificador (`ADR-XXX`) para poder referenciarlo en PRs, issues y revisiones, y asi mantener la arquitectura "explicable" y trazable a lo largo del tiempo.

La plantilla guia al equipo para contar la historia completa de la decision sin convertirla en un ensayo: primero situa el contexto (que problema o restriccion obliga a decidir), despues obliga a enumerar opciones realistas (incluyendo, si procede, "no hacer nada") y a explicitar los criterios de evaluacion (mantenibilidad, acoplamiento, coste, riesgo, etc.). Con eso, la decision final queda justificada de forma transparente y comparable, evitando "decisiones por intuicion" que luego nadie recuerda o entiende.

Por ultimo, el ADR registra las consecuencias (beneficios, trade-offs, riesgos y mitigaciones) y ancla la decision a evidencias del repositorio (PR/commit, diagramas, tests). Incluso se puede enlazar el AI Usage Log del sprint si la IA influyo en el razonamiento, reforzando la trazabilidad y la rendicion de cuentas.

---

**Ubicacion sugerida:** `/docs/adr/ADR-XXX-titulo.md`

# ADR-XXX: [Titulo de la decision]

**Fecha:** DD-MM-YYYY  
**Sprint:** S1 / S2 / S3 / ...  
**Estado:** Propuesto | Aprobado | Deprecado

## 1) Contexto

Describe el problema y el contexto que obligan a decidir un cambio en el diseno (requisitos, restricciones, dependencias, riesgos).

## 2) Opciones consideradas

Lista 2-4 alternativas de diseno realistas (incluye "no hacer nada" si aplica).

- **Opcion A:** ...
- **Opcion B:** ...
- **Opcion C:** ...

## 3) Criterios de decision

Indica que criterios has usado (ejemplos: mantenibilidad, extensibilidad, acoplamiento, testabilidad, complejidad, rendimiento, riesgo, coste).

## 4) Decision tomada

Que opcion se elige y por que (1-2 parrafos claros).

## 5) Consecuencias

- **Positivas:** que mejora o habilita.
- **Negativas / trade-offs:** que se pierde o que deuda se asume.
- **Riesgos y mitigaciones:** que puede salir mal y como lo controlas.

## 6) Evidencia

PR/commit relevante, diagrama, o tests.

Si hubo IA: referencia al AI Usage Log del sprint (solo si aplica).
