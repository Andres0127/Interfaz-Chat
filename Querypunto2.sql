-- ================================
-- 2.1 Poblar TIPOCONTENIDO y TIPOARCHIVO
-- ================================
BEGIN
   -- Tipos de contenido
   INSERT INTO TIPOCONTENIDO (IDTIPOCONTENIDO, DESCTIPOCONTENIDO) VALUES ('1','Imagen');
   INSERT INTO TIPOCONTENIDO (IDTIPOCONTENIDO, DESCTIPOCONTENIDO) VALUES ('2','Texto');
   INSERT INTO TIPOCONTENIDO (IDTIPOCONTENIDO, DESCTIPOCONTENIDO) VALUES ('3','Emoticons');
   INSERT INTO TIPOCONTENIDO (IDTIPOCONTENIDO, DESCTIPOCONTENIDO) VALUES ('4','URL');
   INSERT INTO TIPOCONTENIDO (IDTIPOCONTENIDO, DESCTIPOCONTENIDO) VALUES ('5','Video');

   -- Tipos de archivo
   INSERT INTO TIPOARCHIVO (IDTIPOARCHIVO, DESCTIPOARCHIVO) VALUES ('PDF','Documento Portable');
   INSERT INTO TIPOARCHIVO (IDTIPOARCHIVO, DESCTIPOARCHIVO) VALUES ('DOC','Documento Word');
   INSERT INTO TIPOARCHIVO (IDTIPOARCHIVO, DESCTIPOARCHIVO) VALUES ('XLS','Hoja Cálculo');
   INSERT INTO TIPOARCHIVO (IDTIPOARCHIVO, DESCTIPOARCHIVO) VALUES ('GIF','Imagen');
   INSERT INTO TIPOARCHIVO (IDTIPOARCHIVO, DESCTIPOARCHIVO) VALUES ('BMP','Imagen');
   INSERT INTO TIPOARCHIVO (IDTIPOARCHIVO, DESCTIPOARCHIVO) VALUES ('MP4','Video');
   INSERT INTO TIPOARCHIVO (IDTIPOARCHIVO, DESCTIPOARCHIVO) VALUES ('AVI','Video');
   INSERT INTO TIPOARCHIVO (IDTIPOARCHIVO, DESCTIPOARCHIVO) VALUES ('MP3','Música');
   INSERT INTO TIPOARCHIVO (IDTIPOARCHIVO, DESCTIPOARCHIVO) VALUES ('EXE','Ejecutable');
   COMMIT;
END;
/
  
-- ================================
-- 2.3 Insertar 10 usuarios y sus 3 amistades
-- ================================
BEGIN
  -- 10 usuarios (consecuser de ejemplo U001…U010)
  FOR i IN 1..10 LOOP
    INSERT INTO USUARIO (
      CONSECUSER, USU_CONSECUSER, NOMBRE, APELLIDO, "USER", PASSWORD,
      FECHAREGISTRO, EMAIL, CELULAR
    ) VALUES (
      LPAD(i,3,'0'),
      NULL,
      'Nombre_'||LPAD(i,3,'0'),
      'Apellido_'||LPAD(i,3,'0'),
      'usr'||LPAD(i,3,'0'),
      'pwd'||LPAD(i,3,'0'),
      SYSDATE,
      'user'||LPAD(i,3,'0')||'@mail.com',
      '300000'||LPAD(i,4,'0')
    );
  END LOOP;
  COMMIT;

  -- Cada usuario tendrá 3 amigos (relaciones simétricas no duplicadas)
  FOR i IN 1..10 LOOP
    FOR j IN 1..3 LOOP
      -- amigo = siguiente en el ciclo, con wrap-around
      DECLARE
        v_u VARCHAR2(3) := LPAD(i,3,'0');
        v_f VARCHAR2(3) := LPAD(MOD(i+j-1,10)+1,3,'0');
      BEGIN
        INSERT INTO AMIG_ (CONSECUSER, USU_CONSECUSER)
        VALUES (v_u, v_f);
      END;
    END LOOP;
  END LOOP;
  COMMIT;
END;
/
-- ================================
-- 2.4 Crear 3 grupos y asignarles 6 usuarios cada uno
-- ================================
BEGIN
  -- 3 grupos (codgrupo 1 a 3), creados por el usuario '001'
  FOR g IN 1..3 LOOP
    INSERT INTO GRUPO (CODGRUPO, CONSECUSER, GRU_CODGRUPO, NOMGRUPO, FECHAREGGRUPO)
    VALUES (g, '001', NULL, 'Grupo_'||g, SYSDATE);
  END LOOP;
  COMMIT;

  -- PERTENECE: 6 usuarios por grupo (usuarios 001–006 al grupo 1, 007–010+001–002 al 2, etc.)
  FOR g IN 1..3 LOOP
    FOR k IN 1..6 LOOP
      DECLARE
        v_user VARCHAR2(3) := LPAD(MOD((g-1)*6 + k -1,10)+1,3,'0');
      BEGIN
        INSERT INTO PERTENECE (CONSECUSER, CODGRUPO)
        VALUES (v_user, g);
      END;
    END LOOP;
  END LOOP;
  COMMIT;
END;
/
  
-- ================================
-- 2.5 Insertar 10 mensajes por grupo (3 en hilo), con al menos 1 imagen y 1 archivo
-- ================================
DECLARE
  TYPE t_msg IS RECORD (
    usu   VARCHAR2(36),
    grp   INTEGER,
    consm INTEGER
  );
  msgs t_msg;
BEGIN
  FOR g IN 1..3 LOOP
    -- Inserta 10 mensajes en cada grupo
    FOR m IN 1..10 LOOP
      -- Elige un emisor al azar de los miembros del grupo
      SELECT CONSECUSER
        INTO msgs.usu
        FROM (
          SELECT CONSECUSER
            FROM PERTENECE
           WHERE CODGRUPO = g
        )
       WHERE ROWNUM = 1;

      msgs.grp   := g;
      msgs.consm := m;

      -- Inserta el mensaje
      INSERT INTO MENSAJE (
        USU_CONSECUSER,
        CONSECUSER,
        CONSMENSAJE,
        CODGRUPO,
        MEN_USU_CONSECUSER,
        MEN_CONSECUSER,
        MEN_CONSMENSAJE,
        FECHAREGMEN
      ) VALUES (
        msgs.usu,
        msgs.usu,
        m,
        g,
        CASE WHEN m IN (2,3,4) THEN msgs.usu ELSE NULL END,
        CASE WHEN m IN (2,3,4) THEN msgs.usu ELSE NULL END,
        CASE WHEN m IN (2,3,4) THEN 1          ELSE NULL END,
        SYSDATE + m/1440
      );

      -- Inserta el contenido asociado a ese mensaje
      INSERT INTO CONTENIDO (
        USU_CONSECUSER,
        CONSECUSER,
        CONSMENSAJE,
        CONSECONTENIDO,
        IDTIPOARCHIVO,
        IDTIPOCONTENIDO,
        LOCALIZACONTENIDO
      ) VALUES (
        msgs.usu,
        msgs.usu,
        m,
        1,
        CASE WHEN m = 5 THEN 'PDF' ELSE NULL END,
        CASE WHEN m = 6 THEN '1'   -- Imagen
             ELSE '2'             -- Texto para el resto
        END,
        'Contenido del mensaje '||m||' en grupo '||g
      );
    END LOOP;
  END LOOP;

  COMMIT;
END;
/