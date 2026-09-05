-- USUARIOS

INSERT INTO usuarios (email, imagen_perfil, nombre, password, telefono, usuario, rol_global, bloqueado)
VALUES (
    'fatima@gmail.com',
    'https://ui-avatars.com/api/?name=Fatima&background=3d5a80&color=fff&size=150&length=1',
    'Fatima',
    '$2a$10$QHDShqnOT7y/H5sNNQ27aeRbJ6UTTsyLc1g60Ybu1a.vcKkN4gTAG',
    '+34611222333',
    'fatima',
    'USER',
    FALSE
);

INSERT INTO usuarios (email, imagen_perfil, nombre, password, telefono, usuario, rol_global, bloqueado)
VALUES (
    'carlos@gmail.com',
    'https://ui-avatars.com/api/?name=Carlos&background=3d5a80&color=fff&size=150&length=1',
    'Carlos',
    '$2a$10$eMG5P0Wz9tHsL/CIpDfsXOchgCaN9ZAckWSy84lyedTL.3MnZflCa',
    '+34622333444',
    'carlos_dev',
    'USER',
    FALSE
);

INSERT INTO usuarios (email, imagen_perfil, nombre, password, telefono, usuario, rol_global, bloqueado)
VALUES (
    'ana.martinez@gmail.com',
    'https://ui-avatars.com/api/?name=Ana&background=ef476f&color=fff&size=150&length=1',
    'Ana',
    '$2a$10$2TPZ3ZFxWX9Sgtp8Hz.1JuyrWZsS8.NEFMcdtokZNm4lBAJ2B4iTC',
    '+34644555666',
    'ana_hogar',
    'USER',
    FALSE
);

INSERT INTO usuarios (email, imagen_perfil, nombre, password, telefono, usuario, rol_global, bloqueado)
VALUES (
    'miguel88@gmail.com',
    'https://ui-avatars.com/api/?name=Miguel&background=06d6a0&color=fff&size=150&length=1',
    'Miguel',
    '$2a$10$cTld1xG3K3eUiiW3fEoyTe0rJreW1i4c7wJVB3bJ.j.lBipIgD7ze',
    '+34677888999',
    'miguelito',
    'USER',
    FALSE
);

-- Usuario SUPERVISOR
INSERT INTO usuarios (email, imagen_perfil, nombre, password, telefono, usuario, rol_global, bloqueado)
VALUES (
    'jaime@uahogar.com',
    'https://ui-avatars.com/api/?name=Jaime&background=e76f51&color=fff&size=150&length=1',
    'Jaime',
    '$2a$10$n817CDA9qaLfX/2KI.LXOu6aGN6yFzfmXJYT8pQ4WhkOcYZGS4vxm',
    '+34600000000',
    'Jaime',
    'SUPERVISOR',
    FALSE
);
-- HOGARES
INSERT INTO hogares (id, nombre, codigo_invitacion, apariencia_id, fecha_creacion)
VALUES (101, 'Piso Compartido', 'PISO101X', 'azul-noche', DATEADD('DAY', -365, CURRENT_DATE));

INSERT INTO hogares (id, nombre, codigo_invitacion, apariencia_id, fecha_creacion)
VALUES (102, 'Casa Familiar', 'CASA102Y', 'verde-bosque', DATEADD('DAY', -30, CURRENT_DATE));


-- MIEMBROS
INSERT INTO miembros_hogar (hogar_id, usuario_id, rol) VALUES (101, 1, 'ADMIN');
INSERT INTO miembros_hogar (hogar_id, usuario_id, rol) VALUES (101, 2, 'MIEMBRO');
INSERT INTO miembros_hogar (hogar_id, usuario_id, rol) VALUES (101, 3, 'MIEMBRO');
INSERT INTO miembros_hogar (hogar_id, usuario_id, rol) VALUES (102, 1, 'MIEMBRO');
INSERT INTO miembros_hogar (hogar_id, usuario_id, rol) VALUES (102, 4, 'ADMIN');


-- TAREAS

-- Piso Compartido
INSERT INTO tareas (nombre, descripcion, puntos, tiempo_estimado, tipo, frecuencia, hogar_id, usuario_asignado_id, fecha_inicio, activa)
VALUES ('Hacer la compra semanal', 'Comprar frutas, verduras, lácteos y productos de limpieza para toda la semana.', 100, '60', 'COMPRAS', 'SEMANAL', 101, 1, CURRENT_DATE, TRUE);

INSERT INTO tareas (nombre, descripcion, puntos, tiempo_estimado, tipo, frecuencia, hogar_id, usuario_asignado_id, fecha_inicio, activa)
VALUES ('Limpiar el baño', 'Limpiar la ducha, el inodoro, el lavabo y los espejos con los productos bajo el fregadero.', 80, '45', 'LIMPIEZA', 'SEMANAL', 101, 2, CURRENT_DATE, TRUE);

INSERT INTO tareas (nombre, descripcion, puntos, tiempo_estimado, tipo, frecuencia, hogar_id, usuario_asignado_id, fecha_inicio, activa)
VALUES ('Fregar el suelo de la cocina', 'Barrer primero y después pasar la fregona con el producto azul.', 50, '30', 'LIMPIEZA', 'SEMANAL', 101, 3, CURRENT_DATE, TRUE);

INSERT INTO tareas (nombre, descripcion, puntos, tiempo_estimado, tipo, frecuencia, hogar_id, usuario_asignado_id, fecha_inicio, activa)
VALUES ('Limpiar los electrodomésticos', 'Limpiar el microondas por dentro la vitrocerámica y la encimera.', 60, '40', 'LIMPIEZA', 'SEMANAL', 101, 1, CURRENT_DATE, TRUE);

INSERT INTO tareas (nombre, descripcion, puntos, tiempo_estimado, tipo, frecuencia, hogar_id, usuario_asignado_id, fecha_inicio, activa)
VALUES ('Pasar el aspirador al salón', 'Aspirar sofá alfombra y rincones. Mover los cojines.', 40, '25', 'LIMPIEZA', 'SEMANAL', 101, 2, CURRENT_DATE, TRUE);

INSERT INTO tareas (nombre, descripcion, puntos, tiempo_estimado, tipo, frecuencia, hogar_id, usuario_asignado_id, fecha_inicio, activa)
VALUES ('Sacar la basura y reciclar', 'Bajar las bolsas de orgánica plásticos y papel a sus contenedores correspondientes.', 20, '10', 'LIMPIEZA', 'SEMANAL', 101, 3, CURRENT_DATE, TRUE);

-- Casa Familiar
INSERT INTO tareas (nombre, descripcion, puntos, tiempo_estimado, tipo, frecuencia, hogar_id, usuario_asignado_id, fecha_inicio, activa)
VALUES ('Limpiar el salón y el comedor', 'Quitar el polvo de los muebles limpiar la mesa y pasar la fregona.', 70, '50', 'LIMPIEZA', 'SEMANAL', 102, 1, CURRENT_DATE, TRUE);

INSERT INTO tareas (nombre, descripcion, puntos, tiempo_estimado, tipo, frecuencia, hogar_id, usuario_asignado_id, fecha_inicio, activa)
VALUES ('Cambiar las sábanas', 'Cambiar sábanas y fundas de almohada de todas las camas y ponerlas a lavar.', 60, '35', 'LIMPIEZA', 'SEMANAL', 102, 4, CURRENT_DATE, TRUE);

INSERT INTO tareas (nombre, descripcion, puntos, tiempo_estimado, tipo, frecuencia, hogar_id, usuario_asignado_id, fecha_inicio, activa)
VALUES ('Hacer la colada y tender', 'Poner una colada de ropa oscura y otra de ropa clara. Tender cuando acabe.', 50, '20', 'LIMPIEZA', 'SEMANAL', 102, 1, CURRENT_DATE, TRUE);

INSERT INTO tareas (nombre, descripcion, puntos, tiempo_estimado, tipo, frecuencia, hogar_id, usuario_asignado_id, fecha_inicio, activa)
VALUES ('Limpiar los baños de casa', 'Limpiar los dos baños ducha bañera inodoros y lavabos.', 90, '60', 'LIMPIEZA', 'SEMANAL', 102, 4, CURRENT_DATE, TRUE);

INSERT INTO tareas (nombre, descripcion, puntos, tiempo_estimado, tipo, frecuencia, hogar_id, usuario_asignado_id, fecha_inicio, activa)
VALUES ('Planchar la ropa de la semana', 'Planchar la ropa tendida de la semana anterior y guardarla.', 55, '45', 'LIMPIEZA', 'SEMANAL', 102, 1, CURRENT_DATE, TRUE);


-- REGISTROS DE TAREAS

-- Piso Compartido pendientes normales
INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (1, 1, NULL, 101, 'PENDIENTE', DATEADD('DAY', 7, NOW()), NULL, 0, FALSE, FALSE);

INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (2, 2, NULL, 101, 'PENDIENTE', DATEADD('DAY', 7, NOW()), NULL, 0, FALSE, FALSE);

INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (3, 3, NULL, 101, 'PENDIENTE', DATEADD('DAY', 7, NOW()), NULL, 0, FALSE, FALSE);

-- urgentes
INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (4, 1, NULL, 101, 'PENDIENTE', DATEADD('DAY', 1, NOW()), NULL, 0, FALSE, FALSE);

INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (5, 2, NULL, 101, 'PENDIENTE', DATEADD('DAY', 2, NOW()), NULL, 0, FALSE, FALSE);

-- a tiempo casi para Ana (vencida hace 10h, entra en el margen de gracia)
INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (6, 3, NULL, 101, 'PENDIENTE', DATEADD('HOUR', -10, NOW()), NULL, 0, FALSE, FALSE);

-- Piso Compartido historial completadas
INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, fecha_completada, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (1, 1, 1, 101, 'COMPLETADA', DATEADD('DAY', -7, NOW()), DATEADD('DAY', -6, NOW()), 100, 0, FALSE, FALSE);

INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, fecha_completada, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (2, 2, 2, 101, 'COMPLETADA', DATEADD('DAY', -7, NOW()), DATEADD('DAY', -5, NOW()), 80, 0, FALSE, FALSE);

INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, fecha_completada, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (3, 3, 3, 101, 'COMPLETADA', DATEADD('DAY', -7, NOW()), DATEADD('DAY', -4, NOW()), 50, 0, FALSE, FALSE);

-- esta se entregó tarde con penalizacion (14 pts en lugar de 20)
INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, fecha_completada, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (6, 3, 3, 101, 'COMPLETADA', DATEADD('DAY', -8, NOW()), DATEADD('DAY', -7, NOW()), 14, 6, FALSE, FALSE);

-- historial hace 1 mes para que el ranking mensual tenga datos
INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, fecha_completada, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (1, 2, 2, 101, 'COMPLETADA', DATEADD('MONTH', -1, NOW()), DATEADD('MONTH', -1, NOW()), 100, 0, FALSE, FALSE);

INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, fecha_completada, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (2, 3, 3, 101, 'COMPLETADA', DATEADD('MONTH', -1, NOW()), DATEADD('MONTH', -1, NOW()), 80, 0, FALSE, FALSE);

INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, fecha_completada, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (4, 1, 1, 101, 'COMPLETADA', DATEADD('MONTH', -1, NOW()), DATEADD('MONTH', -1, NOW()), 60, 0, FALSE, FALSE);

INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, fecha_completada, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (5, 2, 2, 101, 'COMPLETADA', DATEADD('MONTH', -1, NOW()), DATEADD('MONTH', -1, NOW()), 40, 0, FALSE, FALSE);

INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, fecha_completada, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (6, 1, 1, 101, 'COMPLETADA', DATEADD('MONTH', -1, NOW()), DATEADD('MONTH', -1, NOW()), 20, 0, FALSE, FALSE);

-- hace 2 meses
INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, fecha_completada, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (1, 3, 3, 101, 'COMPLETADA', DATEADD('MONTH', -2, NOW()), DATEADD('MONTH', -2, NOW()), 100, 0, FALSE, FALSE);

INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, fecha_completada, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (2, 1, 1, 101, 'COMPLETADA', DATEADD('MONTH', -2, NOW()), DATEADD('MONTH', -2, NOW()), 80, 0, FALSE, FALSE);

INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, fecha_completada, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (3, 2, 2, 101, 'COMPLETADA', DATEADD('MONTH', -2, NOW()), DATEADD('MONTH', -2, NOW()), 50, 0, FALSE, FALSE);

-- Casa Familiar pendientes
INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (7, 1, NULL, 102, 'PENDIENTE', DATEADD('DAY', 7, NOW()), NULL, 0, FALSE, FALSE);

INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (8, 4, NULL, 102, 'PENDIENTE', DATEADD('DAY', 7, NOW()), NULL, 0, FALSE, FALSE);

INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (9, 1, NULL, 102, 'PENDIENTE', DATEADD('DAY', 3, NOW()), NULL, 0, FALSE, FALSE);

-- Casa Familiar historial completadas
INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, fecha_completada, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (7, 1, 1, 102, 'COMPLETADA', DATEADD('DAY', -7, NOW()), DATEADD('DAY', -5, NOW()), 70, 0, FALSE, FALSE);

INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, fecha_completada, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (8, 4, 4, 102, 'COMPLETADA', DATEADD('DAY', -7, NOW()), DATEADD('DAY', -4, NOW()), 60, 0, FALSE, FALSE);

-- a tiempo casi para Miguel (vencida hace 20h)
INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (11, 4, NULL, 102, 'PENDIENTE', DATEADD('HOUR', -20, NOW()), NULL, 0, FALSE, FALSE);

-- vencida definitivamente para probar el estado VENCIDA
INSERT INTO registros_tareas (tarea_id, usuario_asignado_id, usuario_id, hogar_id, estado, fecha_limite, puntos_sumados, penalizacion, notificacion_urgencia_enviada, notificacion_gracia_enviada)
VALUES (10, 4, NULL, 102, 'VENCIDA', DATEADD('DAY', -3, NOW()), NULL, 11, FALSE, FALSE);


-- MENSAJES DE GRUPO

-- Piso Compartido
INSERT INTO mensajes (tipo_mensaje, contenido, fecha_envio, remitente_id, hogar_id, receptor_id)
VALUES ('GRUPO', 'Esta semana toca limpieza general. Os recuerdo las tareas asignadas.', DATEADD('DAY', -5, NOW()), 1, 101, NULL);

INSERT INTO mensajes (tipo_mensaje, contenido, fecha_envio, remitente_id, hogar_id, receptor_id)
VALUES ('GRUPO', 'De acuerdo yo me encargo del baño el jueves por la tarde.', DATEADD('DAY', -5, NOW()), 2, 101, NULL);

INSERT INTO mensajes (tipo_mensaje, contenido, fecha_envio, remitente_id, hogar_id, receptor_id)
VALUES ('GRUPO', 'Yo hago la compra el miércoles. Alguien necesita algo en especial.', DATEADD('DAY', -4, NOW()), 1, 101, NULL);

INSERT INTO mensajes (tipo_mensaje, contenido, fecha_envio, remitente_id, hogar_id, receptor_id)
VALUES ('GRUPO', 'Detergente y papel de cocina por favor que nos queda poco.', DATEADD('DAY', -4, NOW()), 3, 101, NULL);

INSERT INTO mensajes (tipo_mensaje, contenido, fecha_envio, remitente_id, hogar_id, receptor_id)
VALUES ('GRUPO', 'Apuntado lo traigo todo el miércoles.', DATEADD('DAY', -4, NOW()), 1, 101, NULL);

INSERT INTO mensajes (tipo_mensaje, contenido, fecha_envio, remitente_id, hogar_id, receptor_id)
VALUES ('GRUPO', 'He pasado el aspirador al salón queda genial.', DATEADD('DAY', -2, NOW()), 2, 101, NULL);

INSERT INTO mensajes (tipo_mensaje, contenido, fecha_envio, remitente_id, hogar_id, receptor_id)
VALUES ('GRUPO', 'Genial Carlos. Yo friego el suelo mañana.', DATEADD('DAY', -2, NOW()), 3, 101, NULL);

-- Casa Familiar
INSERT INTO mensajes (tipo_mensaje, contenido, fecha_envio, remitente_id, hogar_id, receptor_id)
VALUES ('GRUPO', 'Esta semana yo me encargo del salón y la colada.', DATEADD('DAY', -4, NOW()), 1, 102, NULL);

INSERT INTO mensajes (tipo_mensaje, contenido, fecha_envio, remitente_id, hogar_id, receptor_id)
VALUES ('GRUPO', 'Perfecto yo cambio las sábanas y limpio los baños.', DATEADD('DAY', -4, NOW()), 4, 102, NULL);

INSERT INTO mensajes (tipo_mensaje, contenido, fecha_envio, remitente_id, hogar_id, receptor_id)
VALUES ('GRUPO', 'La colada ya está tendida en el patio.', DATEADD('DAY', -2, NOW()), 1, 102, NULL);

INSERT INTO mensajes (tipo_mensaje, contenido, fecha_envio, remitente_id, hogar_id, receptor_id)
VALUES ('GRUPO', 'La recojo esta tarde y la plancho mañana sin falta.', DATEADD('DAY', -2, NOW()), 4, 102, NULL);


-- MENSAJES PRIVADOS
INSERT INTO mensajes (tipo_mensaje, contenido, fecha_envio, remitente_id, receptor_id, hogar_id)
VALUES ('PRIVADO', 'Carlos puedes encargarte del baño esta semana. Te lo compenso la siguiente.', DATEADD('DAY', -5, NOW()), 1, 2, NULL);

INSERT INTO mensajes (tipo_mensaje, contenido, fecha_envio, remitente_id, receptor_id, hogar_id)
VALUES ('PRIVADO', 'Sin problema Fatima ya lo tenía en mente.', DATEADD('DAY', -5, NOW()), 2, 1, NULL);

INSERT INTO mensajes (tipo_mensaje, contenido, fecha_envio, remitente_id, receptor_id, hogar_id)
VALUES ('PRIVADO', 'Miguel recuerda que también toca limpiar los baños esta semana.', DATEADD('DAY', -3, NOW()), 1, 4, NULL);

INSERT INTO mensajes (tipo_mensaje, contenido, fecha_envio, remitente_id, receptor_id, hogar_id)
VALUES ('PRIVADO', 'Sí lo tengo apuntado. Lo hago el fin de semana.', DATEADD('DAY', -3, NOW()), 4, 1, NULL);

INSERT INTO mensajes (tipo_mensaje, contenido, fecha_envio, remitente_id, receptor_id, hogar_id)
VALUES ('PRIVADO', 'Ana mañana te toca sacar la basura antes de las 8.', DATEADD('DAY', -1, NOW()), 1, 3, NULL);

INSERT INTO mensajes (tipo_mensaje, contenido, fecha_envio, remitente_id, receptor_id, hogar_id)
VALUES ('PRIVADO', 'Vale lo pongo en el móvil para no olvidarme.', DATEADD('DAY', -1, NOW()), 3, 1, NULL);