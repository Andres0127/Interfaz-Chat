/*==============================================================*/
/* DBMS name:      ORACLE Version 11g                           */
/* Created on:     4/07/2025 7:14:10�p.�m.                      */
/*==============================================================*/


alter table AMIG_
   drop constraint FK_AMIG__AMIG__USUARIO;

alter table AMIG_
   drop constraint FK_AMIG__AMIG_2_USUARIO;

alter table CONFGRUPO
   drop constraint FK_CONFGRUP_GRUPO_GRUPO;

alter table CONFGRUPO
   drop constraint FK_CONFGRUP_PROPIEDAD_PROPIEDA;

alter table CONFUSER
   drop constraint FK_CONFUSER_PROPIAUSE_USUARIO;

alter table CONFUSER
   drop constraint FK_CONFUSER_PROPIUSER_PROPIEDA;

alter table CONTENIDO
   drop constraint FK_CONTENID_MENSAJE_MENSAJE;

alter table CONTENIDO
   drop constraint FK_CONTENID_TIPOARCHI_TIPOARCH;

alter table CONTENIDO
   drop constraint FK_CONTENID_TIPOCONTE_TIPOCONT;

alter table GRUPO
   drop constraint FK_GRUPO_CREAADMIN_USUARIO;

alter table GRUPO
   drop constraint FK_GRUPO_MODIFICAG_GRUPO;

alter table MENSAJE
   drop constraint FK_MENSAJE_ENVIA_USUARIO;

alter table MENSAJE
   drop constraint FK_MENSAJE_GRUPOMENS_GRUPO;

alter table MENSAJE
   drop constraint FK_MENSAJE_HILO_MENSAJE;

alter table MENSAJE
   drop constraint FK_MENSAJE_RECIBE_USUARIO;

alter table PERTENECE
   drop constraint FK_PERTENEC_PERTENECE_USUARIO;

alter table PERTENECE
   drop constraint FK_PERTENEC_PERTENECE_GRUPO;

alter table PROPIEDAD
   drop constraint FK_PROPIEDA_PROPIEDAD_PROPIEDA;

alter table SEDUIR
   drop constraint FK_SEDUIR_SEDUIR_USUARIO;

alter table SEDUIR
   drop constraint FK_SEDUIR_SEDUIR2_USUARIO;

alter table UBICACION
   drop constraint FK_UBICACIO_TIPOUBICA_TIPOUBIC;

alter table UBICACION
   drop constraint FK_UBICACIO_UBICASUP_UBICACIO;

alter table USUARIO
   drop constraint FK_USUARIO_ACTUALIZA_USUARIO;

alter table USUARIO
   drop constraint FK_USUARIO_UBICA_UBICACIO;

drop index AMIG_2_FK;

drop index AMIG__FK;

drop table AMIG_ cascade constraints;

drop index GRUPO_FK;

drop index PROPIEDADGRUPO_FK;

drop table CONFGRUPO cascade constraints;

drop index PROPIAUSER_FK;

drop index PROPIUSER_FK;

drop table CONFUSER cascade constraints;

drop index MENSAJE_FK;

drop index TIPOARCHIVO_FK;

drop index TIPOCONTE_FK;

drop table CONTENIDO cascade constraints;

drop index MODIFICAGRUPO_FK;

drop index CREAADMINISTRA_FK;

drop table GRUPO cascade constraints;

drop index HILO_FK;

drop index GRUPOMENSAJE_FK;

drop index RECIBE_FK;

drop index ENVIA_FK;

drop table MENSAJE cascade constraints;

drop index PERTENECE2_FK;

drop index PERTENECE_FK;

drop table PERTENECE cascade constraints;

drop index PROPIEDADSUP_FK;

drop table PROPIEDAD cascade constraints;

drop index SEDUIR2_FK;

drop index SEDUIR_FK;

drop table SEDUIR cascade constraints;

drop table TIPOARCHIVO cascade constraints;

drop table TIPOCONTENIDO cascade constraints;

drop table TIPOUBICA cascade constraints;

drop index UBICASUP_FK;

drop index TIPOUBICA_FK;

drop table UBICACION cascade constraints;

drop index UBICA_FK;

drop index ACTUALIZAPERFIL_FK;

drop table USUARIO cascade constraints;

/*==============================================================*/
/* Table: AMIG_                                                 */
/*==============================================================*/
create table AMIG_ 
(
   CONSECUSER           VARCHAR2(5)          not null,
   USU_CONSECUSER       VARCHAR2(5)          not null,
   constraint PK_AMIG_ primary key (CONSECUSER, USU_CONSECUSER)
);

/*==============================================================*/
/* Index: AMIG__FK                                              */
/*==============================================================*/
create index AMIG__FK on AMIG_ (
   CONSECUSER ASC
);

/*==============================================================*/
/* Index: AMIG_2_FK                                             */
/*==============================================================*/
create index AMIG_2_FK on AMIG_ (
   USU_CONSECUSER ASC
);

/*==============================================================*/
/* Table: CONFGRUPO                                             */
/*==============================================================*/
create table CONFGRUPO 
(
   CODGRUPO             INTEGER              not null,
   NCONFGRUPO           INTEGER              not null,
   IDPROPIEDAD          VARCHAR2(2)          not null,
   ESTADO               SMALLINT,
   constraint PK_CONFGRUPO primary key (CODGRUPO, NCONFGRUPO)
);

/*==============================================================*/
/* Index: PROPIEDADGRUPO_FK                                     */
/*==============================================================*/
create index PROPIEDADGRUPO_FK on CONFGRUPO (
   IDPROPIEDAD ASC
);

/*==============================================================*/
/* Index: GRUPO_FK                                              */
/*==============================================================*/
create index GRUPO_FK on CONFGRUPO (
   CODGRUPO ASC
);

/*==============================================================*/
/* Table: CONFUSER                                              */
/*==============================================================*/
create table CONFUSER 
(
   CONSECUSER           VARCHAR2(5)          not null,
   NCONFUSER            INTEGER              not null,
   IDPROPIEDAD          VARCHAR2(2)          not null,
   ESTADO               SMALLINT,
   VALOR                INTEGER,
   constraint PK_CONFUSER primary key (CONSECUSER, NCONFUSER)
);

/*==============================================================*/
/* Index: PROPIUSER_FK                                          */
/*==============================================================*/
create index PROPIUSER_FK on CONFUSER (
   IDPROPIEDAD ASC
);

/*==============================================================*/
/* Index: PROPIAUSER_FK                                         */
/*==============================================================*/
create index PROPIAUSER_FK on CONFUSER (
   CONSECUSER ASC
);

/*==============================================================*/
/* Table: CONTENIDO                                             */
/*==============================================================*/
create table CONTENIDO 
(
   USU_CONSECUSER       VARCHAR2(5)          not null,
   CONSECUSER           VARCHAR2(5)          not null,
   CONSMENSAJE          INTEGER              not null,
   CONSECONTENIDO       INTEGER              not null,
   IDTIPOARCHIVO        VARCHAR2(2),
   IDTIPOCONTENIDO      VARCHAR2(2)          not null,
   CONTENIDOIMAG        BLOB,
   LOCALIZACONTENIDO    VARCHAR2(255),
   ATTRIBUTE_16         CHAR(10),
   constraint PK_CONTENIDO primary key (USU_CONSECUSER, CONSECUSER, CONSMENSAJE, CONSECONTENIDO)
);

/*==============================================================*/
/* Index: TIPOCONTE_FK                                          */
/*==============================================================*/
create index TIPOCONTE_FK on CONTENIDO (
   IDTIPOCONTENIDO ASC
);

/*==============================================================*/
/* Index: TIPOARCHIVO_FK                                        */
/*==============================================================*/
create index TIPOARCHIVO_FK on CONTENIDO (
   IDTIPOARCHIVO ASC
);

/*==============================================================*/
/* Index: MENSAJE_FK                                            */
/*==============================================================*/
create index MENSAJE_FK on CONTENIDO (
   USU_CONSECUSER ASC,
   CONSECUSER ASC,
   CONSMENSAJE ASC
);

/*==============================================================*/
/* Table: GRUPO                                                 */
/*==============================================================*/
create table GRUPO 
(
   CODGRUPO             INTEGER              not null,
   CONSECUSER           VARCHAR2(5)          not null,
   GRU_CODGRUPO         INTEGER,
   NOMGRUPO             VARCHAR2(30),
   FECHAREGGRUPO        DATE,
   constraint PK_GRUPO primary key (CODGRUPO)
);

/*==============================================================*/
/* Index: CREAADMINISTRA_FK                                     */
/*==============================================================*/
create index CREAADMINISTRA_FK on GRUPO (
   CONSECUSER ASC
);

/*==============================================================*/
/* Index: MODIFICAGRUPO_FK                                      */
/*==============================================================*/
create index MODIFICAGRUPO_FK on GRUPO (
   GRU_CODGRUPO ASC
);

/*==============================================================*/
/* Table: MENSAJE                                               */
/*==============================================================*/
create table MENSAJE 
(
   USU_CONSECUSER       VARCHAR2(5)          not null,
   CONSECUSER           VARCHAR2(5)          not null,
   CONSMENSAJE          INTEGER              not null,
   CODGRUPO             INTEGER,
   MEN_USU_CONSECUSER   VARCHAR2(5),
   MEN_CONSECUSER       VARCHAR2(5),
   MEN_CONSMENSAJE      INTEGER,
   FECHAREGMEN          DATE,
   constraint PK_MENSAJE primary key (USU_CONSECUSER, CONSECUSER, CONSMENSAJE)
);

/*==============================================================*/
/* Index: ENVIA_FK                                              */
/*==============================================================*/
create index ENVIA_FK on MENSAJE (
   USU_CONSECUSER ASC
);

/*==============================================================*/
/* Index: RECIBE_FK                                             */
/*==============================================================*/
create index RECIBE_FK on MENSAJE (
   CONSECUSER ASC
);

/*==============================================================*/
/* Index: GRUPOMENSAJE_FK                                       */
/*==============================================================*/
create index GRUPOMENSAJE_FK on MENSAJE (
   CODGRUPO ASC
);

/*==============================================================*/
/* Index: HILO_FK                                               */
/*==============================================================*/
create index HILO_FK on MENSAJE (
   MEN_USU_CONSECUSER ASC,
   MEN_CONSECUSER ASC,
   MEN_CONSMENSAJE ASC
);

/*==============================================================*/
/* Table: PERTENECE                                             */
/*==============================================================*/
create table PERTENECE 
(
   CONSECUSER           VARCHAR2(5)          not null,
   CODGRUPO             INTEGER              not null,
   constraint PK_PERTENECE primary key (CONSECUSER, CODGRUPO)
);

/*==============================================================*/
/* Index: PERTENECE_FK                                          */
/*==============================================================*/
create index PERTENECE_FK on PERTENECE (
   CONSECUSER ASC
);

/*==============================================================*/
/* Index: PERTENECE2_FK                                         */
/*==============================================================*/
create index PERTENECE2_FK on PERTENECE (
   CODGRUPO ASC
);

/*==============================================================*/
/* Table: PROPIEDAD                                             */
/*==============================================================*/
create table PROPIEDAD 
(
   IDPROPIEDAD          VARCHAR2(2)          not null,
   PRO_IDPROPIEDAD      VARCHAR2(2),
   DESCPROPIEDAD        VARCHAR2(100),
   VALORDEFECTO         SMALLINT,
   VALORPROPIEDAD       VARCHAR2(30),
   constraint PK_PROPIEDAD primary key (IDPROPIEDAD)
);

/*==============================================================*/
/* Index: PROPIEDADSUP_FK                                       */
/*==============================================================*/
create index PROPIEDADSUP_FK on PROPIEDAD (
   PRO_IDPROPIEDAD ASC
);

/*==============================================================*/
/* Table: SEDUIR                                                */
/*==============================================================*/
create table SEDUIR 
(
   CONSECUSER           VARCHAR2(5)          not null,
   USU_CONSECUSER       VARCHAR2(5)          not null,
   constraint PK_SEDUIR primary key (CONSECUSER, USU_CONSECUSER)
);

/*==============================================================*/
/* Index: SEDUIR_FK                                             */
/*==============================================================*/
create index SEDUIR_FK on SEDUIR (
   CONSECUSER ASC
);

/*==============================================================*/
/* Index: SEDUIR2_FK                                            */
/*==============================================================*/
create index SEDUIR2_FK on SEDUIR (
   USU_CONSECUSER ASC
);

/*==============================================================*/
/* Table: TIPOARCHIVO                                           */
/*==============================================================*/
create table TIPOARCHIVO 
(
   IDTIPOARCHIVO        VARCHAR2(2)          not null,
   DESCTIPOARCHIVO      VARCHAR2(30),
   constraint PK_TIPOARCHIVO primary key (IDTIPOARCHIVO)
);

/*==============================================================*/
/* Table: TIPOCONTENIDO                                         */
/*==============================================================*/
create table TIPOCONTENIDO 
(
   IDTIPOCONTENIDO      VARCHAR2(2)          not null,
   DESCTIPOCONTENIDO    VARCHAR2(30),
   constraint PK_TIPOCONTENIDO primary key (IDTIPOCONTENIDO)
);

/*==============================================================*/
/* Table: TIPOUBICA                                             */
/*==============================================================*/
create table TIPOUBICA 
(
   CODTIPOUBICA         VARCHAR2(3)          not null,
   DESCTIPOUBICA        VARCHAR2(20),
   constraint PK_TIPOUBICA primary key (CODTIPOUBICA)
);

/*==============================================================*/
/* Table: UBICACION                                             */
/*==============================================================*/
create table UBICACION 
(
   CODUBICA             VARCHAR2(4)          not null,
   UBI_CODUBICA         VARCHAR2(4),
   CODTIPOUBICA         VARCHAR2(3)          not null,
   NOMUBICA             VARCHAR2(30),
   constraint PK_UBICACION primary key (CODUBICA)
);

/*==============================================================*/
/* Index: TIPOUBICA_FK                                          */
/*==============================================================*/
create index TIPOUBICA_FK on UBICACION (
   CODTIPOUBICA ASC
);

/*==============================================================*/
/* Index: UBICASUP_FK                                           */
/*==============================================================*/
create index UBICASUP_FK on UBICACION (
   UBI_CODUBICA ASC
);

/*==============================================================*/
/* Table: USUARIO                                               */
/*==============================================================*/
create table USUARIO 
(
   CONSECUSER           VARCHAR2(5)          not null,
   USU_CONSECUSER       VARCHAR2(5),
   CODUBICA             VARCHAR2(4)          not null,
   NOMBRE               VARCHAR2(25),
   APELLIDO             VARCHAR2(25),
   "USER"               VARCHAR2(6),
   FECHAREGISTRO        DATE,
   EMAIL                VARCHAR2(50),
   CELULAR              VARCHAR2(16),
   constraint PK_USUARIO primary key (CONSECUSER)
);

/*==============================================================*/
/* Index: ACTUALIZAPERFIL_FK                                    */
/*==============================================================*/
create index ACTUALIZAPERFIL_FK on USUARIO (
   USU_CONSECUSER ASC
);

/*==============================================================*/
/* Index: UBICA_FK                                              */
/*==============================================================*/
create index UBICA_FK on USUARIO (
   CODUBICA ASC
);

alter table AMIG_
   add constraint FK_AMIG__AMIG__USUARIO foreign key (CONSECUSER)
      references USUARIO (CONSECUSER);

alter table AMIG_
   add constraint FK_AMIG__AMIG_2_USUARIO foreign key (USU_CONSECUSER)
      references USUARIO (CONSECUSER);

alter table CONFGRUPO
   add constraint FK_CONFGRUP_GRUPO_GRUPO foreign key (CODGRUPO)
      references GRUPO (CODGRUPO);

alter table CONFGRUPO
   add constraint FK_CONFGRUP_PROPIEDAD_PROPIEDA foreign key (IDPROPIEDAD)
      references PROPIEDAD (IDPROPIEDAD);

alter table CONFUSER
   add constraint FK_CONFUSER_PROPIAUSE_USUARIO foreign key (CONSECUSER)
      references USUARIO (CONSECUSER);

alter table CONFUSER
   add constraint FK_CONFUSER_PROPIUSER_PROPIEDA foreign key (IDPROPIEDAD)
      references PROPIEDAD (IDPROPIEDAD);

alter table CONTENIDO
   add constraint FK_CONTENID_MENSAJE_MENSAJE foreign key (USU_CONSECUSER, CONSECUSER, CONSMENSAJE)
      references MENSAJE (USU_CONSECUSER, CONSECUSER, CONSMENSAJE);

alter table CONTENIDO
   add constraint FK_CONTENID_TIPOARCHI_TIPOARCH foreign key (IDTIPOARCHIVO)
      references TIPOARCHIVO (IDTIPOARCHIVO);

alter table CONTENIDO
   add constraint FK_CONTENID_TIPOCONTE_TIPOCONT foreign key (IDTIPOCONTENIDO)
      references TIPOCONTENIDO (IDTIPOCONTENIDO);

alter table GRUPO
   add constraint FK_GRUPO_CREAADMIN_USUARIO foreign key (CONSECUSER)
      references USUARIO (CONSECUSER);

alter table GRUPO
   add constraint FK_GRUPO_MODIFICAG_GRUPO foreign key (GRU_CODGRUPO)
      references GRUPO (CODGRUPO);

alter table MENSAJE
   add constraint FK_MENSAJE_ENVIA_USUARIO foreign key (USU_CONSECUSER)
      references USUARIO (CONSECUSER);

alter table MENSAJE
   add constraint FK_MENSAJE_GRUPOMENS_GRUPO foreign key (CODGRUPO)
      references GRUPO (CODGRUPO);

alter table MENSAJE
   add constraint FK_MENSAJE_HILO_MENSAJE foreign key (MEN_USU_CONSECUSER, MEN_CONSECUSER, MEN_CONSMENSAJE)
      references MENSAJE (USU_CONSECUSER, CONSECUSER, CONSMENSAJE);

alter table MENSAJE
   add constraint FK_MENSAJE_RECIBE_USUARIO foreign key (CONSECUSER)
      references USUARIO (CONSECUSER);

alter table PERTENECE
   add constraint FK_PERTENEC_PERTENECE_USUARIO foreign key (CONSECUSER)
      references USUARIO (CONSECUSER);

alter table PERTENECE
   add constraint FK_PERTENEC_PERTENECE_GRUPO foreign key (CODGRUPO)
      references GRUPO (CODGRUPO);

alter table PROPIEDAD
   add constraint FK_PROPIEDA_PROPIEDAD_PROPIEDA foreign key (PRO_IDPROPIEDAD)
      references PROPIEDAD (IDPROPIEDAD);

alter table SEDUIR
   add constraint FK_SEDUIR_SEDUIR_USUARIO foreign key (CONSECUSER)
      references USUARIO (CONSECUSER);

alter table SEDUIR
   add constraint FK_SEDUIR_SEDUIR2_USUARIO foreign key (USU_CONSECUSER)
      references USUARIO (CONSECUSER);

alter table UBICACION
   add constraint FK_UBICACIO_TIPOUBICA_TIPOUBIC foreign key (CODTIPOUBICA)
      references TIPOUBICA (CODTIPOUBICA);

alter table UBICACION
   add constraint FK_UBICACIO_UBICASUP_UBICACIO foreign key (UBI_CODUBICA)
      references UBICACION (CODUBICA);

alter table USUARIO
   add constraint FK_USUARIO_ACTUALIZA_USUARIO foreign key (USU_CONSECUSER)
      references USUARIO (CONSECUSER);

alter table USUARIO
   add constraint FK_USUARIO_UBICA_UBICACIO foreign key (CODUBICA)
      references UBICACION (CODUBICA);

