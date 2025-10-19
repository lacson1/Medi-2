--
-- PostgreSQL database dump
--

\restrict 0DPLLYWMFHUlV6Gc42VvlhwA6Ms1J6J7nfNDEulJVbA8GMGaoJOb52YSyLslBc1

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: public; Owner: medi_2
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    organization_id uuid,
    job_title character varying(100),
    department character varying(100),
    specialization character varying(100),
    phone character varying(20),
    mobile character varying(20),
    bio text,
    permissions jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['SuperAdmin'::character varying, 'Admin'::character varying, 'Doctor'::character varying, 'Nurse'::character varying, 'Receptionist'::character varying, 'Patient'::character varying, 'Billing'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO medi_2;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: medi_2
--

COPY public.users (id, first_name, last_name, email, password_hash, role, organization_id, job_title, department, specialization, phone, mobile, bio, permissions, is_active, last_login, created_at, updated_at, created_by) FROM stdin;
b9f98175-d258-4054-9e98-500c24508bc7	Dev	User	dev@medi-2.com	$2a$10$02nTsAgdwwGJxMw0YeqWQe.XGZF4vKQDZQwUWthatlO2r0J6zXCNy	SuperAdmin	\N	\N	\N	\N	\N	\N	\N	[]	t	2025-10-18 13:50:05.627317	2025-10-18 13:19:20.449433	2025-10-18 13:19:20.449433	\N
\.


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: medi_2
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: medi_2
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict 0DPLLYWMFHUlV6Gc42VvlhwA6Ms1J6J7nfNDEulJVbA8GMGaoJOb52YSyLslBc1

