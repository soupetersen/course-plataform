-- Script de inicialização do banco de dados
-- Este arquivo é executado automaticamente quando o container PostgreSQL é criado
-- Criar o banco de dados de desenvolvimento
CREATE DATABASE course_platform_dev;
-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";
-- Criar schema se não existir
CREATE SCHEMA IF NOT EXISTS public;
-- Dar permissões ao usuário
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
-- Definir configurações padrão
SET TIME ZONE 'UTC';
-- Conectar ao banco de dados de desenvolvimento e configurá-lo
\ c course_platform_dev;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE SCHEMA IF NOT EXISTS public;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
SET TIME ZONE 'UTC';
-- Inserir dados básicos se necessário
-- (Os dados serão inseridos via Prisma migrations e seeds)