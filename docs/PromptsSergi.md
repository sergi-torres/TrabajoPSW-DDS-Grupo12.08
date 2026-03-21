### Prompt para ADR

> Tengo un problema de diseño en el backend: actualmente el rol de un usuario (Organizador, Jurado, Participante) está definido directamente en la clase Usuario, pero ahora un usuario puede tener distintos roles según el evento.
Necesito analizar cómo rediseñar esto para soportar una relación muchos a muchos entre usuarios y eventos (por ejemplo con una tabla intermedia EventoUsuario).
Me gustaría comparar varias opciones, entender pros y contras, y definir una solución clara, incluyendo los cambios necesarios en el modelo, repositorios y controladores en .NET y la base de datos.


### Prompt para AI Usage Log

> Estoy implementando el Dashboard principal de eventos en React @DashboardPage.jsx. Necesito un componente funcional que cargue los eventos desde la API usando el token JWT guardado en localStorage y la ID del usuario.
Debe mostrar una lista de componentes EventCard, incluir estado de carga y manejo de errores, y añadir un buscador que filtre los eventos por nombre usando useMemo.
Además, quiero que el diseño use únicamente las variables CSS definidas en index.css.
