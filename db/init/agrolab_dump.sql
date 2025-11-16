--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

-- Started on 2025-05-29 13:42:56

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

--
-- TOC entry 5 (class 2615 OID 65862)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 5044 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 272 (class 1255 OID 66144)
-- Name: add_reagent(character varying); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.add_reagent(IN p_name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.reagent WHERE name = p_name) THEN
        RAISE EXCEPTION 'Реагент с именем "%" уже существует', p_name;
    END IF;
    INSERT INTO public.reagent (name) VALUES (p_name);
END;
$$;


ALTER PROCEDURE public.add_reagent(IN p_name character varying) OWNER TO postgres;

--
-- TOC entry 266 (class 1255 OID 66132)
-- Name: archive_expired_reagents(); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.archive_expired_reagents()
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO public.audit_log (table_name, record_id, action, old_data)
    SELECT 'chemical_parish', id, 'ARCHIVE', row_to_json(chemical_parish)::text
    FROM public.chemical_parish
    WHERE expiration_date < CURRENT_DATE;

    DELETE FROM public.chemical_parish WHERE expiration_date < CURRENT_DATE;
END;
$$;


ALTER PROCEDURE public.archive_expired_reagents() OWNER TO postgres;

--
-- TOC entry 271 (class 1255 OID 66142)
-- Name: audit_customers_changes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.audit_customers_changes() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_log (table_name, record_id, action, old_data)
        VALUES ('customers', OLD.id, 'DELETE', row_to_json(OLD)::text);
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_log (table_name, record_id, action, old_data, new_data)
        VALUES ('customers', NEW.id, 'UPDATE', row_to_json(OLD)::text, row_to_json(NEW)::text);
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_log (table_name, record_id, action, new_data)
        VALUES ('customers', NEW.id, 'INSERT', row_to_json(NEW)::text);
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.audit_customers_changes() OWNER TO postgres;

--
-- TOC entry 269 (class 1255 OID 66138)
-- Name: check_positive_quantity(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_positive_quantity() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.quantity_used <= 0 THEN
        RAISE EXCEPTION 'Количество использованного реагента должно быть положительным';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.check_positive_quantity() OWNER TO postgres;

--
-- TOC entry 264 (class 1255 OID 66128)
-- Name: check_unique_inn_kpp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_unique_inn_kpp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.customers 
        WHERE inn = NEW.inn AND kpp = NEW.kpp AND id <> NEW.id
    ) THEN
        RAISE EXCEPTION 'Комбинация ИНН и КПП должна быть уникальной';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.check_unique_inn_kpp() OWNER TO postgres;

--
-- TOC entry 265 (class 1255 OID 66130)
-- Name: generate_sample_code(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_sample_code() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.sample_code = 'POT-' || to_char(NEW.upload_date, 'YYYYMMDD') || '-' || NEW.id;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.generate_sample_code() OWNER TO postgres;

--
-- TOC entry 268 (class 1255 OID 66135)
-- Name: get_equipment_usage_stats(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_equipment_usage_stats() RETURNS TABLE(equipment_id integer, last_inspection_date date, days_since_inspection integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        id, 
        inspection_date,
        EXTRACT(DAY FROM CURRENT_DATE - inspection_date)::INT
    FROM public.equipment
    WHERE inspection_date IS NOT NULL;
END;
$$;


ALTER FUNCTION public.get_equipment_usage_stats() OWNER TO postgres;

--
-- TOC entry 274 (class 1255 OID 66147)
-- Name: get_reagent_usage(integer, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_reagent_usage(p_reagent_id integer, p_start_date date, p_end_date date) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    total_usage NUMERIC(10,2);
BEGIN
    SELECT SUM(quantity_used)
    INTO total_usage
    FROM public.chemical_expenses
    WHERE reagent_id = p_reagent_id
        AND expense_date BETWEEN p_start_date AND p_end_date;

    RETURN COALESCE(total_usage, 0);
END;
$$;


ALTER FUNCTION public.get_reagent_usage(p_reagent_id integer, p_start_date date, p_end_date date) OWNER TO postgres;

--
-- TOC entry 270 (class 1255 OID 66140)
-- Name: set_next_inspection_date(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_next_inspection_date() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.inspection_date IS NOT NULL THEN
        NEW.next_inspection_date = NEW.inspection_date + INTERVAL '1 year';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_next_inspection_date() OWNER TO postgres;

--
-- TOC entry 273 (class 1255 OID 66145)
-- Name: validate_expiration_date(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validate_expiration_date() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.expiration_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Срок годности не может быть в прошлом';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.validate_expiration_date() OWNER TO postgres;

--
-- TOC entry 267 (class 1255 OID 66133)
-- Name: validate_harvest_year(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validate_harvest_year() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.harvest_year > EXTRACT(YEAR FROM CURRENT_DATE) THEN
        RAISE EXCEPTION 'Год урожая не может быть в будущем';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.validate_harvest_year() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 65863)
-- Name: audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_log (
    id integer NOT NULL,
    table_name character varying(255) NOT NULL,
    record_id integer NOT NULL,
    action character varying(50) NOT NULL,
    old_data text,
    new_data text,
    user_id integer,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_log OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 66157)
-- Name: audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.audit_log ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.audit_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 218 (class 1259 OID 65869)
-- Name: auth_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_users (
    id integer NOT NULL,
    login character varying(255) NOT NULL,
    password text NOT NULL,
    user_id integer
);


ALTER TABLE public.auth_users OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 66150)
-- Name: auth_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_users ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 219 (class 1259 OID 65874)
-- Name: chemical_expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chemical_expenses (
    id integer NOT NULL,
    reagent_id integer,
    expense_date date NOT NULL,
    quantity_used numeric(10,2) NOT NULL,
    gost_method character varying(255),
    solution character varying(255),
    solution_quantity numeric(10,2),
    storage character varying(255),
    expiration_date date
);


ALTER TABLE public.chemical_expenses OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 66195)
-- Name: chemical_expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.chemical_expenses ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.chemical_expenses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 220 (class 1259 OID 65879)
-- Name: chemical_parish; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chemical_parish (
    id integer NOT NULL,
    reagent_id integer,
    receipt_date date NOT NULL,
    quantity_received numeric(10,2) NOT NULL,
    received_from character varying(255) NOT NULL,
    approval_date date,
    expiration_date date,
    supplier_id integer,
    batch_number character varying(255)
);


ALTER TABLE public.chemical_parish OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 66196)
-- Name: chemical_parish_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.chemical_parish ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.chemical_parish_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 221 (class 1259 OID 65884)
-- Name: cultures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cultures (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.cultures OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 66197)
-- Name: cultures_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.cultures ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.cultures_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 222 (class 1259 OID 65889)
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    name character varying NOT NULL,
    inn character varying NOT NULL,
    org_and_legal_form character varying,
    address character varying,
    kpp character varying
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 66198)
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.customers ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.customers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 223 (class 1259 OID 65894)
-- Name: equipment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    category character varying(255),
    line_name character varying(255),
    factory_name character varying(255),
    commissioning_date date,
    certificate_name character varying(255),
    inspection_date date,
    next_inspection_date date,
    diameter numeric(10,2),
    depth numeric(10,2),
    height numeric(10,2),
    width numeric(10,2),
    goods_entry_date date,
    inventory_number character varying(255)
);


ALTER TABLE public.equipment OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 66199)
-- Name: equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.equipment ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.equipment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 224 (class 1259 OID 65899)
-- Name: logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logs (
    id integer NOT NULL,
    user_id integer,
    action text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.logs OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 66200)
-- Name: logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.logs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 225 (class 1259 OID 65905)
-- Name: plants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plants (
    id integer NOT NULL,
    culture_id integer,
    upload_date timestamp without time zone DEFAULT now(),
    acceptance_file text NOT NULL,
    customer_id integer,
    inn character varying NOT NULL,
    kpp character varying,
    test_basis character varying(255),
    sample_receipt_date date,
    test_duration character varying(100),
    test_object_name character varying(255),
    sample_code character varying(50),
    sample_selection character varying(100),
    sampling_act character varying(100),
    sampling_nd character varying(100),
    research_direction character varying(100),
    sampling_plan character varying(100),
    additional_info character varying(255),
    date_contract date,
    contract_1c character varying(255)
);


ALTER TABLE public.plants OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 66201)
-- Name: plants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.plants ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.plants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 226 (class 1259 OID 65911)
-- Name: potato_analyses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.potato_analyses (
    id integer NOT NULL,
    potato_id integer,
    norm_id integer,
    value character varying(255)
);


ALTER TABLE public.potato_analyses OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 66202)
-- Name: potato_analyses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.potato_analyses ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.potato_analyses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 227 (class 1259 OID 65914)
-- Name: potato_norms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.potato_norms (
    id integer NOT NULL,
    culture_id integer,
    reproduction_id integer,
    analysis text NOT NULL,
    accept_value character varying(255)
);


ALTER TABLE public.potato_norms OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 66203)
-- Name: potato_norms_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.potato_norms ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.potato_norms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 228 (class 1259 OID 65919)
-- Name: potatoes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.potatoes (
    id integer NOT NULL,
    culture_id integer,
    reproduction_id integer,
    upload_date timestamp without time zone DEFAULT now(),
    acceptance_file text,
    customer_id integer,
    inn character varying NOT NULL,
    kpp character varying,
    test_basis character varying(255),
    sample_receipt_date date,
    test_duration date,
    test_object_name character varying(255),
    sample_code character varying(50),
    sample_selection character varying(100),
    sampling_act character varying(100),
    sampling_nd character varying(100),
    harvest_year integer,
    seed_category character varying(50),
    research_direction character varying(100),
    sampling_plan character varying(100),
    additional_info character varying(255),
    tuber_count integer,
    batch_number character varying(100),
    batch_weight character varying(100),
    storage_location character varying(100),
    results_distribution character varying(100),
    sample_storage_period character varying(100),
    date_contract date,
    contract_1c character varying(255),
    passes_standard boolean,
    notes text
);


ALTER TABLE public.potatoes OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 66204)
-- Name: potatoes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.potatoes ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.potatoes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 229 (class 1259 OID 65925)
-- Name: protocol; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.protocol (
    id integer NOT NULL,
    protocol bytea NOT NULL
);


ALTER TABLE public.protocol OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 66205)
-- Name: protocol_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.protocol ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.protocol_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 230 (class 1259 OID 65930)
-- Name: provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.provider (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    adress character varying(255),
    contact_info character varying(255)
);


ALTER TABLE public.provider OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 66206)
-- Name: provider_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.provider ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.provider_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 231 (class 1259 OID 65935)
-- Name: reagent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reagent (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.reagent OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 66207)
-- Name: reagent_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.reagent ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.reagent_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 232 (class 1259 OID 65938)
-- Name: reproductions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reproductions (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.reproductions OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 66208)
-- Name: reproductions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.reproductions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.reproductions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 233 (class 1259 OID 65943)
-- Name: role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role (
    id integer NOT NULL,
    role character varying(255) NOT NULL
);


ALTER TABLE public.role OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 65946)
-- Name: seed_analyses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seed_analyses (
    id integer NOT NULL,
    seeds_id integer,
    norm_id integer,
    value character varying(255)
);


ALTER TABLE public.seed_analyses OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 66209)
-- Name: seed_analyses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.seed_analyses ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.seed_analyses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 235 (class 1259 OID 65949)
-- Name: seed_norms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seed_norms (
    id integer NOT NULL,
    culture_id integer,
    reproduction_id integer,
    analysis text NOT NULL,
    accept_value character varying(255)
);


ALTER TABLE public.seed_norms OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 66210)
-- Name: seed_norms_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.seed_norms ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.seed_norms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 236 (class 1259 OID 65954)
-- Name: seeds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seeds (
    id integer NOT NULL,
    culture_id integer,
    reproduction_id integer,
    upload_date timestamp without time zone DEFAULT now(),
    acceptance_file text NOT NULL,
    customer_id integer,
    inn integer,
    kpp integer,
    test_basis character varying(255),
    sample_receipt_date date,
    test_duration character varying(100),
    test_object_name character varying(255),
    sample_code character varying(50),
    sample_selection character varying(100),
    sampling_act character varying(100),
    sampling_nd character varying(100),
    research_direction character varying(100),
    sampling_plan character varying(100),
    additional_info character varying(255),
    tuber_count integer,
    batch_number character varying(100),
    batch_weight character varying(100),
    storage_location character varying(100),
    results_distribution character varying(100),
    sample_storage_period character varying(100),
    date_contract date,
    contract_1c character varying(255),
    harvest_year integer,
    seed_category character varying(50),
    passes_standard boolean,
    notes text
);


ALTER TABLE public.seeds OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 66211)
-- Name: seeds_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.seeds ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.seeds_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 237 (class 1259 OID 65960)
-- Name: soil; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.soil (
    id integer NOT NULL,
    culture_id integer,
    upload_date timestamp without time zone DEFAULT now(),
    acceptance_file text NOT NULL,
    customer_id integer,
    inn character varying NOT NULL,
    kpp character varying,
    test_basis character varying(255),
    test_object_name character varying(255),
    sample_selection character varying(100),
    sample_receipt_date date,
    test_duration character varying(100),
    sampling_act character varying(100),
    research_direction character varying(100),
    test_conditions character varying(255),
    date_contract date,
    contract_1c character varying(255),
    passes_standard boolean,
    notes text
);


ALTER TABLE public.soil OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 65966)
-- Name: soil_analyses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.soil_analyses (
    id integer NOT NULL,
    soil_id integer,
    norm_id integer,
    value character varying(255)
);


ALTER TABLE public.soil_analyses OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 66213)
-- Name: soil_analyses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.soil_analyses ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.soil_analyses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 261 (class 1259 OID 66212)
-- Name: soil_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.soil ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.soil_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 239 (class 1259 OID 65969)
-- Name: soil_norms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.soil_norms (
    id integer NOT NULL,
    culture_id integer,
    analysis text NOT NULL,
    accept_value character varying(255)
);


ALTER TABLE public.soil_norms OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 66214)
-- Name: soil_norms_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.soil_norms ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.soil_norms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 240 (class 1259 OID 65974)
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    surname character varying(255) NOT NULL,
    patronymic character varying(255),
    role_id integer
);


ALTER TABLE public.staff OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 66148)
-- Name: staff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.staff ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.staff_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 4992 (class 0 OID 65863)
-- Dependencies: 217
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_log (id, table_name, record_id, action, old_data, new_data, user_id, "timestamp") FROM stdin;
97	customers	1	INSERT	\N	{"id":1,"name":"пупупу","inn":"0","org_and_legal_form":null,"address":null,"kpp":null}	\N	2025-05-12 06:35:18.313725
98	customers	1	DELETE	{"id":1,"name":"пупупу","inn":"0","org_and_legal_form":null,"address":null,"kpp":null}	\N	\N	2025-05-12 06:40:56.337483
99	customers	4	INSERT	\N	{"id":4,"name":"пупупу","inn":"23434578","org_and_legal_form":"ооо","address":"пушкина дом колотушкина","kpp":"23434578"}	\N	2025-05-12 07:05:00.286886
100	customers	4	DELETE	{"id":4,"name":"пупупу","inn":"23434578","org_and_legal_form":"ооо","address":"пушкина дом колотушкина","kpp":"23434578"}	\N	\N	2025-05-12 07:05:28.850496
101	customers	5	INSERT	\N	{"id":5,"name":"пупупу","inn":"23434578","org_and_legal_form":"ооо","address":"пушкина дом колотушкина","kpp":"23434578"}	\N	2025-05-12 08:47:53.487114
102	customers	5	DELETE	{"id":5,"name":"пупупу","inn":"23434578","org_and_legal_form":"ооо","address":"пушкина дом колотушкина","kpp":"23434578"}	\N	\N	2025-05-12 08:55:34.824017
103	customers	6	INSERT	\N	{"id":6,"name":"пупупу","inn":"23434578","org_and_legal_form":"ооо","address":"пушкина дом колотушкина","kpp":"23434578"}	\N	2025-05-12 08:55:38.557102
104	customers	7	INSERT	\N	{"id":7,"name":"пвапвапвапва","inn":"423423423","org_and_legal_form":"ао","address":"пушкина дом колотушкина","kpp":"423423423"}	\N	2025-05-12 13:01:55.696527
105	customers	8	INSERT	\N	{"id":8,"name":"гзлдгхшдзл","inn":"3466789","org_and_legal_form":"пао","address":"рнрнрнрнр","kpp":"3466789"}	\N	2025-05-12 13:35:41.665047
106	customers	8	DELETE	{"id":8,"name":"гзлдгхшдзл","inn":"3466789","org_and_legal_form":"пао","address":"рнрнрнрнр","kpp":"3466789"}	\N	\N	2025-05-12 13:35:50.669903
107	customers	7	DELETE	{"id":7,"name":"пвапвапвапва","inn":"423423423","org_and_legal_form":"ао","address":"пушкина дом колотушкина","kpp":"423423423"}	\N	\N	2025-05-12 18:19:18.90761
108	customers	6	UPDATE	{"id":6,"name":"пупупу","inn":"23434578","org_and_legal_form":"ооо","address":"пушкина дом колотушкина","kpp":"23434578"}	{"id":6,"name":"пупупу","inn":"23434578","org_and_legal_form":"ао","address":"пушкина дом колотушкина","kpp":"23434578"}	\N	2025-05-13 07:31:05.447511
109	customers	6	UPDATE	{"id":6,"name":"пупупу","inn":"23434578","org_and_legal_form":"ао","address":"пушкина дом колотушкина","kpp":"23434578"}	{"id":6,"name":"пупупу","inn":"23434578","org_and_legal_form":"ао","address":"пушкина дом пердушкина","kpp":"23434578"}	\N	2025-05-13 07:33:53.357381
110	customers	6	DELETE	{"id":6,"name":"пупупу","inn":"23434578","org_and_legal_form":"ао","address":"пушкина дом пердушкина","kpp":"23434578"}	\N	\N	2025-05-13 07:33:59.507747
111	customers	9	INSERT	\N	{"id":9,"name":"заказчик","inn":"123456789","org_and_legal_form":"зао","address":"пупупу","kpp":"123456789"}	\N	2025-05-13 07:34:22.941478
112	customers	10	INSERT	\N	{"id":10,"name":"попа муравья","inn":"123345234","org_and_legal_form":"зао","address":"пушкина дом колотушкина","kpp":"123345234"}	\N	2025-05-13 12:27:38.570342
113	customers	10	DELETE	{"id":10,"name":"попа муравья","inn":"123345234","org_and_legal_form":"зао","address":"пушкина дом колотушкина","kpp":"123345234"}	\N	\N	2025-05-13 12:29:04.731521
114	customers	11	INSERT	\N	{"id":11,"name":"попа муравья","inn":"3466789","org_and_legal_form":"зао","address":"пушкина дом колотушкина","kpp":"3466789"}	\N	2025-05-13 12:29:12.095599
115	customers	9	DELETE	{"id":9,"name":"заказчик","inn":"123456789","org_and_legal_form":"зао","address":"пупупу","kpp":"123456789"}	\N	\N	2025-05-13 12:40:01.594568
116	customers	11	UPDATE	{"id":11,"name":"попа муравья","inn":"3466789","org_and_legal_form":"зао","address":"пушкина дом колотушкина","kpp":"3466789"}	{"id":11,"name":"попа муравья","inn":"3466789","org_and_legal_form":"зао","address":"колотушкина дом пушкина","kpp":"3466789"}	\N	2025-05-15 16:27:25.599864
117	customers	12	INSERT	\N	{"id":12,"name":"газпром","inn":"1234567890","org_and_legal_form":"123321","address":"спбкт","kpp":"0987654321"}	\N	2025-05-19 02:58:51.943863
118	customers	11	DELETE	{"id":11,"name":"попа муравья","inn":"3466789","org_and_legal_form":"зао","address":"колотушкина дом пушкина","kpp":"3466789"}	\N	\N	2025-05-19 03:26:51.860472
119	customers	13	INSERT	\N	{"id":13,"name":"спбгут","inn":"123321","org_and_legal_form":"ао","address":"спб мойки 61","kpp":"1233456"}	\N	2025-05-19 04:42:57.193387
120	customers	13	DELETE	{"id":13,"name":"спбгут","inn":"123321","org_and_legal_form":"ао","address":"спб мойки 61","kpp":"1233456"}	\N	\N	2025-05-19 04:44:25.634578
121	customers	14	INSERT	\N	{"id":14,"name":"спбгут","inn":"123321","org_and_legal_form":"ао","address":"спб мойки 61","kpp":"1222"}	\N	2025-05-19 04:44:53.461553
122	customers	12	DELETE	{"id":12,"name":"газпром","inn":"1234567890","org_and_legal_form":"123321","address":"спбкт","kpp":"0987654321"}	\N	\N	2025-05-19 04:44:58.168738
123	customers	15	INSERT	\N	{"id":15,"name":"газпром","inn":"123321","org_and_legal_form":"зао","address":"спб","kpp":"32"}	\N	2025-05-19 04:45:19.422937
\.


--
-- TOC entry 4993 (class 0 OID 65869)
-- Dependencies: 218
-- Data for Name: auth_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_users (id, login, password, user_id) FROM stdin;
1	bla	$2a$11$yYtluHFLlmUQX/lBh/ZiCeEiQIHippvzecv0viHaKzyo2QVeX00cu	1
2	qwerty	$2a$11$LGB99/zz2gu9tbEdioGEieXoeRh/e4qISNtPAl8sweMzt0ggru.cS	2
3	ytrewq	$2a$11$glbm8111RG/0dtcHyXU80.uStPgj7O/Nde4P5spObRVIqIm7/YSgS	3
4	fdsfs	$2a$11$L78r1TkC6EWa4MLyNyyaFu8J4nd10rZyV52X.1xilYDj6.BQMpXpy	4
5	ivanov.ivan	$2a$11$bLUrgbjSr4yzaA6JpDKrs.eWBAwkbF.f17axd36XFhLyacwlKzgri	5
6	we	$2a$11$rO0QN7wQ5iXNPVigthdGHOEqYghTDpAuSHR4rWKMxmY3/MWwJCcdG	6
7	radek	$2a$11$.mMniE2l.kBfz6V.Wjd12.9C34eT5pmc1Q.ZOisoeRKI6lRNMRlny	7
8	bebebe	$2a$11$5gEXuYNwqN3FCWPgVrio7uk5lSo.gW4m/BU8xey7/TgzcJJEhMpGu	8
9	bda	$2a$11$0jnzhF.zAKZ.waSBoEJvyOY.F6xM7mVN.kcFQ9xxnA.StF5hVLAKO	9
10	petrov	$2a$11$01UAcbRAWvazQdnL8Wwppes51oPgjvXTjD1IhPHDuoWJF448MIUA6	10
\.


--
-- TOC entry 4994 (class 0 OID 65874)
-- Dependencies: 219
-- Data for Name: chemical_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chemical_expenses (id, reagent_id, expense_date, quantity_used, gost_method, solution, solution_quantity, storage, expiration_date) FROM stdin;
2	16	2025-05-19	7.00	\N	\N	\N	\N	\N
\.


--
-- TOC entry 4995 (class 0 OID 65879)
-- Dependencies: 220
-- Data for Name: chemical_parish; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chemical_parish (id, reagent_id, receipt_date, quantity_received, received_from, approval_date, expiration_date, supplier_id, batch_number) FROM stdin;
13	20	2025-05-15	18.00	-	\N	2025-05-21	11	123
10	16	2025-05-07	15.00	неизвестно	\N	2025-05-30	10	23
\.


--
-- TOC entry 4996 (class 0 OID 65884)
-- Dependencies: 221
-- Data for Name: cultures; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cultures (id, name) FROM stdin;
12	картошка белая
13	семена льна
\.


--
-- TOC entry 4997 (class 0 OID 65889)
-- Dependencies: 222
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, name, inn, org_and_legal_form, address, kpp) FROM stdin;
14	спбгут	123321	ао	спб мойки 61	1222
15	газпром	123321	зао	спб	32
\.


--
-- TOC entry 4998 (class 0 OID 65894)
-- Dependencies: 223
-- Data for Name: equipment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment (id, name, category, line_name, factory_name, commissioning_date, certificate_name, inspection_date, next_inspection_date, diameter, depth, height, width, goods_entry_date, inventory_number) FROM stdin;
14	стулья	1111	1111	1111	2025-05-16	1111	2025-05-26	2026-05-26	1111.00	1111.00	1111.00	1111.00	2025-05-31	1111
\.


--
-- TOC entry 4999 (class 0 OID 65899)
-- Dependencies: 224
-- Data for Name: logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logs (id, user_id, action, "timestamp") FROM stdin;
1	\N	Вход пользователя	2025-05-12 02:43:20.876205
2	\N	Добавление нового реагента	2025-05-12 02:44:02.202919
3	\N	Добавление культуры	2025-05-12 02:44:43.847205
4	\N	Удаление реагента	2025-05-12 02:45:43.069378
5	\N	Удаление культуры	2025-05-12 02:46:10.007638
6	\N	Вход пользователя	2025-05-12 03:00:51.325169
7	\N	Вход пользователя	2025-05-12 03:11:44.248361
9	\N	Вход пользователя	2025-05-12 03:17:14.919478
8	\N	Вход пользователя	2025-05-12 03:17:14.919471
10	\N	Вход пользователя	2025-05-12 03:29:51.736727
11	\N	Вход пользователя	2025-05-12 03:34:29.42562
12	\N	Вход пользователя	2025-05-12 03:37:19.581181
14	\N	Вход пользователя	2025-05-12 03:40:28.604343
13	\N	Вход пользователя	2025-05-12 03:40:28.604827
15	\N	Вход пользователя	2025-05-12 03:40:38.711262
16	\N	Вход пользователя	2025-05-12 03:47:18.305702
17	\N	Вход пользователя	2025-05-12 03:53:01.822598
18	\N	Вход пользователя	2025-05-12 04:01:59.207542
19	\N	Вход пользователя	2025-05-12 04:04:51.473548
20	\N	Вход пользователя	2025-05-12 04:04:51.473556
21	\N	Добавление нового реагента	2025-05-12 04:05:54.712325
22	\N	Удаление реагента	2025-05-12 04:05:57.337853
23	\N	Вход пользователя	2025-05-12 04:09:44.86956
24	\N	Вход пользователя	2025-05-12 04:09:44.869569
25	\N	Добавление оборудования	2025-05-12 04:11:45.060364
26	\N	Удаление оборудования	2025-05-12 04:12:15.045446
27	\N	Добавление нового реагента	2025-05-12 04:13:13.635269
28	\N	Вход пользователя	2025-05-12 04:31:57.626936
29	\N	Удаление реагента	2025-05-12 04:32:03.608198
30	\N	Добавление нового реагента	2025-05-12 04:32:10.96807
31	\N	Вход пользователя	2025-05-12 04:41:34.803691
32	\N	Вход пользователя	2025-05-12 04:44:25.723231
33	\N	Вход пользователя	2025-05-12 05:00:57.046837
34	\N	Добавление нового реагента	2025-05-12 05:01:27.237705
35	\N	Вход пользователя	2025-05-12 05:07:53.71593
36	\N	Добавление нового реагента с приходом	2025-05-12 05:08:25.970724
37	\N	Удаление реагента	2025-05-12 05:08:29.923001
38	\N	Удаление реагента	2025-05-12 05:16:50.592994
39	\N	Вход пользователя	2025-05-12 05:25:05.191944
40	\N	Вход пользователя	2025-05-12 05:29:47.346059
41	\N	Добавление оборудования	2025-05-12 05:31:20.629867
42	\N	Вход пользователя	2025-05-12 05:39:19.879333
43	\N	Добавление оборудования	2025-05-12 05:40:04.223871
44	\N	Удаление оборудования	2025-05-12 05:40:12.165513
45	\N	Удаление оборудования	2025-05-12 05:44:27.122672
46	\N	Вход пользователя	2025-05-12 05:44:50.414532
47	\N	Добавление оборудования	2025-05-12 05:47:31.007767
48	\N	Вход пользователя	2025-05-12 05:52:07.387474
49	\N	Вход пользователя	2025-05-12 05:55:27.39633
50	\N	Вход пользователя	2025-05-12 05:55:27.722176
51	\N	Добавление культуры	2025-05-12 06:38:45.381431
52	\N	Вход пользователя	2025-05-12 07:25:53.134909
53	\N	Вход пользователя	2025-05-12 07:44:32.986791
54	\N	Вход пользователя	2025-05-12 08:49:36.357588
55	\N	Вход пользователя	2025-05-12 08:59:37.7513
56	\N	Вход пользователя	2025-05-12 09:05:13.139426
57	\N	Вход пользователя	2025-05-12 09:49:36.048627
58	\N	Вход пользователя	2025-05-12 09:51:49.66815
59	\N	Вход пользователя	2025-05-12 09:59:32.526151
60	\N	Добавление нового реагента	2025-05-12 10:00:11.76173
61	\N	Удаление реагента	2025-05-12 10:00:25.828363
62	\N	Добавление культуры	2025-05-12 10:00:44.376902
63	\N	Удаление культуры	2025-05-12 10:00:49.583152
64	\N	Добавление оборудования	2025-05-12 10:01:25.277408
65	\N	Удаление оборудования	2025-05-12 10:01:33.377246
66	\N	Добавление нового реагента	2025-05-12 10:03:25.232861
67	\N	Регистрация нового пользователя	2025-05-12 10:04:27.842701
68	\N	Регистрация нового пользователя	2025-05-12 10:04:32.757901
69	\N	Вход пользователя	2025-05-12 10:04:47.317739
70	\N	Регистрация нового пользователя	2025-05-12 10:04:58.283381
71	\N	Регистрация нового пользователя	2025-05-12 10:04:59.945303
72	\N	Вход пользователя	2025-05-12 10:16:42.60727
73	\N	Удаление реагента	2025-05-12 10:16:48.570871
74	\N	Добавление нового реагента	2025-05-12 10:17:06.986113
75	\N	Вход пользователя	2025-05-12 10:24:41.0148
76	\N	Добавление нового реагента	2025-05-12 10:25:03.988139
77	\N	Удаление реагента	2025-05-12 10:25:42.784519
78	\N	Добавление нового реагента	2025-05-12 10:25:53.072192
79	\N	Добавление нового реагента	2025-05-12 10:25:53.974526
80	\N	Удаление реагента	2025-05-12 10:26:16.088435
81	\N	Добавление нового реагента	2025-05-12 10:27:11.296437
82	\N	Вход пользователя	2025-05-12 10:28:38.492151
83	\N	Добавление нового реагента	2025-05-12 10:29:09.177655
84	\N	Удаление реагента	2025-05-12 10:29:27.99413
85	\N	Удаление реагента	2025-05-12 10:29:30.056783
86	\N	Удаление реагента	2025-05-12 10:29:31.834494
87	\N	Добавление культуры	2025-05-12 10:30:31.633327
88	\N	Вход пользователя	2025-05-12 10:31:56.819423
89	\N	Добавление культуры	2025-05-12 10:32:04.406366
90	\N	Удаление культуры	2025-05-12 10:32:07.267734
91	\N	Добавление оборудования	2025-05-12 10:33:11.583627
92	\N	Вход пользователя	2025-05-12 10:41:02.996217
93	\N	Вход пользователя	2025-05-12 10:59:38.636638
94	\N	Вход пользователя	2025-05-12 11:03:17.768429
95	\N	Вход пользователя	2025-05-12 11:41:17.596729
96	\N	Вход пользователя	2025-05-12 12:02:21.584102
97	\N	Вход пользователя	2025-05-12 14:22:54.972955
98	\N	Регистрация нового пользователя	2025-05-12 14:23:25.70988
99	\N	Регистрация нового пользователя	2025-05-12 14:25:09.153195
100	\N	Вход пользователя	2025-05-12 14:26:01.672635
101	\N	Регистрация нового пользователя	2025-05-12 14:26:10.351756
102	\N	Регистрация нового пользователя	2025-05-12 14:26:15.158836
103	\N	Вход пользователя	2025-05-12 14:28:37.115363
104	\N	Вход пользователя	2025-05-12 14:32:26.18893
105	\N	Вход пользователя	2025-05-12 14:34:45.986126
106	\N	Вход пользователя	2025-05-12 14:35:00.670872
107	\N	Вход пользователя	2025-05-12 14:38:40.803335
108	\N	Удаление реагента	2025-05-12 14:38:49.17491
109	\N	Вход пользователя	2025-05-12 14:48:46.933455
110	\N	Вход пользователя	2025-05-12 14:48:59.073056
111	\N	Вход пользователя	2025-05-12 14:49:04.508288
112	\N	Вход пользователя	2025-05-12 14:49:18.62842
113	\N	Вход пользователя	2025-05-12 15:06:29.847828
114	\N	Вход пользователя	2025-05-12 15:19:13.995171
115	\N	Вход пользователя	2025-05-12 15:29:05.499217
116	\N	Удаление культуры	2025-05-12 15:29:18.096595
117	\N	Вход пользователя	2025-05-12 15:40:05.522466
118	\N	Вход пользователя	2025-05-12 15:40:05.522472
119	\N	Вход пользователя	2025-05-12 15:40:16.758869
120	\N	Вход пользователя	2025-05-12 15:42:10.38831
121	\N	Вход пользователя	2025-05-12 15:48:26.704753
122	\N	Вход пользователя	2025-05-12 15:55:15.864286
123	\N	Вход пользователя	2025-05-12 15:59:12.045643
124	\N	Вход пользователя	2025-05-12 18:02:38.251558
125	\N	Вход пользователя	2025-05-12 18:02:56.834437
126	\N	Вход пользователя	2025-05-12 18:10:36.475143
127	\N	Вход пользователя	2025-05-12 18:32:44.966236
128	\N	Вход пользователя	2025-05-12 18:34:19.346431
129	\N	Вход пользователя	2025-05-12 18:48:24.170554
130	\N	Вход пользователя	2025-05-12 18:56:44.340612
131	\N	Вход пользователя	2025-05-12 19:03:13.243837
132	\N	Вход пользователя	2025-05-12 19:15:33.413557
133	\N	Вход пользователя	2025-05-12 19:20:41.299886
134	\N	Вход пользователя	2025-05-12 19:21:13.696572
135	\N	Вход пользователя	2025-05-12 19:33:34.938579
136	\N	Вход пользователя	2025-05-12 19:33:48.223534
137	\N	Вход пользователя	2025-05-12 19:42:14.84939
138	\N	Вход пользователя	2025-05-12 19:51:01.773165
139	\N	Вход пользователя	2025-05-12 19:51:30.597922
140	\N	Вход пользователя	2025-05-12 20:07:52.754416
141	\N	Вход пользователя	2025-05-12 20:08:04.64279
142	\N	Вход пользователя	2025-05-12 20:14:42.367018
143	\N	Вход пользователя	2025-05-12 20:14:58.913729
144	\N	Вход пользователя	2025-05-12 20:15:37.458961
145	\N	Вход пользователя	2025-05-12 20:16:55.792376
146	\N	Вход пользователя	2025-05-12 20:17:19.897403
147	\N	Вход пользователя	2025-05-12 20:25:30.875098
148	\N	Вход пользователя	2025-05-12 20:37:58.599968
149	\N	Вход пользователя	2025-05-12 20:54:31.471736
150	\N	Вход пользователя	2025-05-12 20:58:42.689518
151	\N	Вход пользователя	2025-05-12 20:58:42.689511
152	\N	Регистрация нового пользователя	2025-05-12 20:59:12.610037
153	\N	Вход пользователя	2025-05-12 20:59:51.202256
154	\N	Вход пользователя	2025-05-13 01:06:02.095909
155	\N	Обновление реагента	2025-05-13 01:07:09.415283
156	\N	Вход пользователя	2025-05-13 01:19:14.830016
157	\N	Обновление реагента	2025-05-13 01:19:33.810145
158	\N	Обновление реагента	2025-05-13 01:19:47.005057
159	\N	Вход пользователя	2025-05-13 01:25:54.637147
160	\N	Обновление реагента	2025-05-13 01:26:30.478564
161	\N	Обновление реагента	2025-05-13 01:27:42.298134
162	\N	Вход пользователя	2025-05-13 01:37:50.027638
163	\N	Вход пользователя	2025-05-13 01:37:51.554941
164	\N	Обновление реагента	2025-05-13 01:38:03.447469
165	\N	Обновление реагента	2025-05-13 01:38:11.556916
166	\N	Обновление реагента	2025-05-13 01:38:23.042044
167	\N	Вход пользователя	2025-05-13 01:43:09.117072
168	\N	Удаление реагента	2025-05-13 01:43:15.318057
169	\N	Добавление нового реагента	2025-05-13 01:43:41.527566
170	\N	Вход пользователя	2025-05-13 02:01:09.445283
171	\N	Обновление культуры	2025-05-13 02:01:50.22505
172	\N	Обновление культуры	2025-05-13 02:01:58.829463
173	\N	Вход пользователя	2025-05-13 02:23:17.136326
174	\N	Обновление культуры	2025-05-13 02:23:35.43116
175	\N	Обновление культуры	2025-05-13 02:24:27.844415
176	\N	Вход пользователя	2025-05-13 02:33:13.962947
177	\N	Вход пользователя	2025-05-13 02:48:07.30503
178	\N	Вход пользователя	2025-05-13 02:58:19.139672
179	\N	Обновление культуры	2025-05-13 02:58:28.874366
180	\N	Удаление культуры	2025-05-13 02:58:55.698177
181	\N	Добавление культуры	2025-05-13 02:59:08.553569
182	\N	Обновление культуры	2025-05-13 02:59:14.721721
183	\N	Вход пользователя	2025-05-13 03:06:42.385775
184	\N	Обновление культуры	2025-05-13 03:06:54.122077
185	\N	Обновление культуры	2025-05-13 03:07:01.433158
186	\N	Удаление культуры	2025-05-13 03:07:04.205881
187	\N	Добавление культуры	2025-05-13 03:07:10.408277
188	\N	Вход пользователя	2025-05-13 03:13:32.074761
189	\N	Вход пользователя	2025-05-13 03:23:59.846042
190	\N	Вход пользователя	2025-05-13 03:30:40.513607
191	\N	Добавление оборудования	2025-05-13 03:32:50.434209
192	\N	Вход пользователя	2025-05-13 03:37:01.840199
193	\N	Обновление данных оборудования	2025-05-13 03:37:19.422943
194	\N	Удаление оборудования	2025-05-13 03:38:58.749695
195	\N	Обновление данных оборудования	2025-05-13 03:39:09.949342
196	\N	Обновление данных оборудования	2025-05-13 03:39:32.770569
197	\N	Обновление данных оборудования	2025-05-13 03:43:47.261954
198	\N	Добавление оборудования	2025-05-13 03:46:16.289993
199	\N	Обновление данных оборудования	2025-05-13 03:46:35.845309
200	\N	Вход пользователя	2025-05-13 03:58:20.481301
201	\N	Обновление данных оборудования	2025-05-13 03:58:35.563529
202	\N	Обновление данных оборудования	2025-05-13 03:59:33.346309
203	\N	Вход пользователя	2025-05-13 04:04:22.552367
204	\N	Обновление данных оборудования	2025-05-13 04:04:50.823545
205	\N	Удаление оборудования	2025-05-13 04:04:55.985001
206	\N	Удаление оборудования	2025-05-13 04:04:57.193483
207	\N	Удаление оборудования	2025-05-13 04:04:59.129832
208	\N	Добавление оборудования	2025-05-13 04:05:49.586903
209	\N	Вход пользователя	2025-05-13 04:13:51.784118
210	\N	Обновление данных оборудования	2025-05-13 04:14:11.504137
211	\N	Вход пользователя	2025-05-13 04:18:52.075397
212	\N	Вход пользователя	2025-05-13 04:19:01.096451
213	\N	Вход пользователя	2025-05-13 04:26:09.934157
214	\N	Вход пользователя	2025-05-13 04:30:07.182766
215	\N	Вход пользователя	2025-05-13 08:00:32.932525
216	\N	Вход пользователя	2025-05-13 08:29:51.100673
217	\N	Вход пользователя	2025-05-13 08:31:47.177746
218	\N	Вход пользователя	2025-05-13 08:41:59.948511
219	\N	Вход пользователя	2025-05-13 08:47:35.925106
220	\N	Вход пользователя	2025-05-13 09:01:29.715031
221	\N	Вход пользователя	2025-05-13 09:14:12.721674
222	\N	Вход пользователя	2025-05-13 09:18:45.313737
223	\N	Вход пользователя	2025-05-13 09:21:43.6218
224	\N	Вход пользователя	2025-05-13 09:22:31.240537
225	\N	Обновление реагента	2025-05-13 09:26:46.820824
226	\N	Добавление нового реагента	2025-05-13 09:30:42.458893
227	\N	Обновление реагента	2025-05-13 09:30:51.822153
228	\N	Обновление реагента	2025-05-13 09:31:05.906177
229	\N	Добавление культуры	2025-05-13 09:34:13.808435
230	\N	Обновление культуры	2025-05-13 09:34:24.727926
231	\N	Удаление культуры	2025-05-13 09:34:28.458321
232	\N	Добавление культуры	2025-05-13 09:34:34.937105
233	\N	Обновление данных оборудования	2025-05-13 09:35:29.553247
234	\N	Обновление данных оборудования	2025-05-13 09:36:07.727104
235	\N	Добавление оборудования	2025-05-13 09:37:28.637621
236	\N	Удаление оборудования	2025-05-13 09:37:35.050502
237	\N	Регистрация нового пользователя	2025-05-13 09:41:32.158791
238	\N	Вход пользователя	2025-05-13 09:41:43.793077
239	\N	Вход пользователя	2025-05-13 09:47:06.208152
240	\N	Вход пользователя	2025-05-13 12:23:18.246943
241	\N	Вход пользователя	2025-05-14 10:06:09.090527
242	\N	Вход пользователя	2025-05-14 10:20:02.015098
243	\N	Вход пользователя	2025-05-14 10:20:02.015066
244	\N	Вход пользователя	2025-05-14 10:22:18.549871
245	\N	Вход пользователя	2025-05-14 10:40:45.219176
246	\N	Вход пользователя	2025-05-14 10:46:41.595033
247	\N	Вход пользователя	2025-05-14 11:19:34.387019
248	\N	Вход пользователя	2025-05-14 11:24:42.600434
249	\N	Вход пользователя	2025-05-14 11:28:51.17887
250	\N	Вход пользователя	2025-05-14 11:35:53.903044
251	\N	Вход пользователя	2025-05-14 11:40:04.81476
252	\N	Вход пользователя	2025-05-14 11:45:34.815545
253	\N	Вход пользователя	2025-05-14 11:49:56.204619
254	\N	Вход пользователя	2025-05-14 12:38:46.273572
255	\N	Вход пользователя	2025-05-14 13:11:47.191469
256	\N	Вход пользователя	2025-05-14 13:18:44.310063
257	\N	Вход пользователя	2025-05-15 07:42:28.522511
258	\N	Вход пользователя	2025-05-15 07:53:18.921654
259	\N	Вход пользователя	2025-05-15 08:26:50.848791
260	\N	Вход пользователя	2025-05-15 09:24:34.779535
261	\N	Вход пользователя	2025-05-15 09:34:18.438641
262	\N	Вход пользователя	2025-05-15 12:36:53.782193
263	\N	Вход пользователя	2025-05-15 12:52:07.617989
264	\N	Вход пользователя	2025-05-17 08:30:04.775893
265	\N	Вход пользователя	2025-05-17 08:36:42.193664
266	\N	Вход пользователя	2025-05-18 11:29:41.306416
267	\N	Вход пользователя	2025-05-18 14:35:09.927034
268	\N	Вход пользователя	2025-05-18 14:42:40.41416
269	\N	Вход пользователя	2025-05-18 14:43:36.648011
270	\N	Вход пользователя	2025-05-18 14:55:56.927962
271	\N	Вход пользователя	2025-05-18 15:04:25.651164
272	\N	Вход пользователя	2025-05-18 15:09:18.084754
273	\N	Вход пользователя	2025-05-18 15:15:48.636218
274	\N	Вход пользователя	2025-05-18 15:37:18.081599
275	\N	Вход пользователя	2025-05-18 15:40:30.777543
276	\N	Добавление нового реагента	2025-05-18 15:41:31.468116
277	\N	Вход пользователя	2025-05-18 15:46:09.592416
278	\N	Вход пользователя	2025-05-18 15:51:22.781545
279	\N	Вход пользователя	2025-05-18 15:54:31.415371
280	\N	Удаление реагента	2025-05-18 15:54:42.665679
281	\N	Добавление нового реагента	2025-05-18 15:54:52.722238
282	\N	Удаление реагента	2025-05-18 15:54:58.073621
283	\N	Добавление нового реагента	2025-05-18 15:55:01.511124
284	\N	Обновление реагента	2025-05-18 15:55:52.235589
285	\N	Обновление реагента	2025-05-18 15:55:58.291292
286	\N	Обновление реагента	2025-05-18 15:56:03.549015
287	\N	Вход пользователя	2025-05-18 15:59:16.506138
288	\N	Обновление культуры	2025-05-18 16:15:17.382266
289	\N	Удаление культуры	2025-05-18 16:22:39.168173
290	\N	Вход пользователя	2025-05-18 22:48:35.230052
291	\N	Вход пользователя	2025-05-18 22:55:27.594891
292	\N	Вход пользователя	2025-05-18 23:03:57.081521
293	\N	Вход пользователя	2025-05-18 23:05:56.602876
294	\N	Регистрация нового пользователя	2025-05-18 23:06:19.745428
295	\N	Вход пользователя	2025-05-18 23:07:17.565695
296	\N	Вход пользователя	2025-05-18 23:08:04.887471
297	\N	Добавление культуры	2025-05-18 23:08:23.582519
298	\N	Вход пользователя	2025-05-18 23:19:25.632729
299	\N	Вход пользователя	2025-05-18 23:29:04.323211
300	\N	Вход пользователя	2025-05-18 23:32:58.517873
301	\N	Обновление культуры	2025-05-18 23:33:14.022641
302	\N	Вход пользователя	2025-05-18 23:41:45.564731
303	\N	Вход пользователя	2025-05-18 23:42:58.337368
304	\N	Вход пользователя	2025-05-18 23:47:13.749461
305	\N	Вход пользователя	2025-05-18 23:48:38.031221
306	\N	Вход пользователя	2025-05-18 23:57:32.373065
307	\N	Вход пользователя	2025-05-18 23:58:40.906208
308	\N	Вход пользователя	2025-05-19 00:14:41.563441
309	\N	Вход пользователя	2025-05-19 00:22:10.632022
310	\N	Обновление данных оборудования	2025-05-19 00:22:25.979673
311	\N	Добавление оборудования	2025-05-19 00:23:21.0424
312	\N	Удаление оборудования	2025-05-19 00:26:45.953578
313	\N	Удаление оборудования	2025-05-19 00:26:48.085696
314	\N	Вход пользователя	2025-05-19 00:41:03.299072
315	\N	Добавление оборудования	2025-05-19 00:41:13.529237
316	\N	Добавление оборудования	2025-05-19 00:41:52.773089
317	\N	Удаление оборудования	2025-05-19 00:42:47.160647
318	\N	Вход пользователя	2025-05-19 01:02:07.889863
319	\N	Вход пользователя	2025-05-19 01:05:53.466777
320	\N	Вход пользователя	2025-05-19 01:33:10.039238
321	\N	Вход пользователя	2025-05-19 01:34:02.940251
322	\N	Регистрация нового пользователя	2025-05-19 01:34:21.322456
323	\N	Вход пользователя	2025-05-19 01:34:41.027854
324	\N	Вход пользователя	2025-05-19 01:35:40.034642
325	\N	Удаление реагента	2025-05-19 01:35:49.039517
326	\N	Обновление реагента	2025-05-19 01:36:06.26399
327	\N	Обновление реагента	2025-05-19 01:36:18.490283
328	\N	Вход пользователя	2025-05-19 01:36:37.705472
329	\N	Добавление нового реагента	2025-05-19 01:37:21.064774
330	\N	Обновление реагента	2025-05-19 01:37:33.1888
331	\N	Обновление реагента	2025-05-19 01:37:43.788808
332	\N	Удаление реагента	2025-05-19 01:38:39.158454
333	\N	Удаление культуры	2025-05-19 01:39:53.937198
334	\N	Добавление культуры	2025-05-19 01:40:19.595425
335	\N	Удаление культуры	2025-05-19 01:40:31.352076
336	\N	Добавление оборудования	2025-05-19 01:41:11.056126
337	\N	Удаление оборудования	2025-05-19 01:41:26.168212
338	\N	Обновление данных оборудования	2025-05-19 01:41:36.098133
339	\N	Вход пользователя	2025-05-25 14:26:38.453159
340	\N	Вход пользователя	2025-05-25 14:26:38.453148
341	\N	Вход пользователя	2025-05-25 14:45:38.017732
342	\N	Вход пользователя	2025-05-25 19:33:03.767436
343	\N	Вход пользователя	2025-05-25 19:33:06.077321
344	\N	Вход пользователя	2025-05-25 19:34:15.690239
345	\N	Вход пользователя	2025-05-25 21:01:21.066404
346	\N	Вход пользователя	2025-05-26 00:13:42.559842
347	\N	Вход пользователя	2025-05-26 18:03:16.759488
348	\N	Вход пользователя	2025-05-26 19:19:24.166561
349	\N	Вход пользователя	2025-05-27 11:52:43.587995
350	\N	Вход пользователя	2025-05-27 12:37:56.605575
351	\N	Вход пользователя	2025-05-27 18:19:55.040231
352	\N	Удаление культуры	2025-05-27 18:21:13.041024
353	\N	Добавление культуры	2025-05-27 18:47:03.103388
354	\N	Добавление культуры	2025-05-27 18:50:00.522263
\.


--
-- TOC entry 5000 (class 0 OID 65905)
-- Dependencies: 225
-- Data for Name: plants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plants (id, culture_id, upload_date, acceptance_file, customer_id, inn, kpp, test_basis, sample_receipt_date, test_duration, test_object_name, sample_code, sample_selection, sampling_act, sampling_nd, research_direction, sampling_plan, additional_info, date_contract, contract_1c) FROM stdin;
\.


--
-- TOC entry 5001 (class 0 OID 65911)
-- Dependencies: 226
-- Data for Name: potato_analyses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.potato_analyses (id, potato_id, norm_id, value) FROM stdin;
\.


--
-- TOC entry 5002 (class 0 OID 65914)
-- Dependencies: 227
-- Data for Name: potato_norms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.potato_norms (id, culture_id, reproduction_id, analysis, accept_value) FROM stdin;
97	12	6	dryRotTotal	
98	12	6	dryRotPhoma	
99	12	6	dryRotFusarium	
100	12	6	dryRotAlternaria	
101	12	6	dryRotPhytophthora	
102	12	6	wetRot	
103	12	6	scabTotal	
104	12	6	commonScab	
105	12	6	netScab	
106	12	6	powderyScab	
107	12	6	wrinkledTubers	
108	12	6	rhizoctonia	
109	12	6	ringRot	
110	12	6	stemNematode	
111	12	6	rustySpots	
112	12	6	mechanicalDamage	
113	12	6	pestDamage	
114	12	6	suffocationSigns	
115	12	6	frozenTubers	
116	12	6	burnedTubers	
117	12	6	deformedTubers	
118	12	6	tuberOutgrowths	
119	12	6	cutCrushedTubers	
120	12	6	peeledSkinTubers	
121	12	7	dryRotTotal	0.1
122	12	7	dryRotPhoma	0.1
123	12	7	dryRotFusarium	0.1
124	12	7	dryRotAlternaria	0.1
125	12	7	dryRotPhytophthora	0.1
126	12	7	wetRot	1
127	12	7	scabTotal	1
128	12	7	commonScab	0.1
129	12	7	netScab	0.1
130	12	7	powderyScab	0.1
131	12	7	wrinkledTubers	0.1
132	12	7	rhizoctonia	2
133	12	7	ringRot	2
134	12	7	stemNematode	1
135	12	7	rustySpots	1
136	12	7	mechanicalDamage	1
137	12	7	pestDamage	1
138	12	7	suffocationSigns	1
139	12	7	frozenTubers	3
140	12	7	burnedTubers	3
141	12	7	deformedTubers	3
142	12	7	tuberOutgrowths	2
143	12	7	cutCrushedTubers	3
144	12	7	peeledSkinTubers	2
145	12	8	dryRotTotal	0.2
146	12	8	dryRotPhoma	0.2
147	12	8	dryRotFusarium	0.2
148	12	8	dryRotAlternaria	0.2
149	12	8	dryRotPhytophthora	0.2
150	12	8	wetRot	12
151	12	8	scabTotal	12
152	12	8	commonScab	0.2
153	12	8	netScab	
154	12	8	powderyScab	0.2
155	12	8	wrinkledTubers	0.2
156	12	8	rhizoctonia	22
157	12	8	ringRot	23
158	12	8	stemNematode	12
159	12	8	rustySpots	12
160	12	8	mechanicalDamage	12
161	12	8	pestDamage	12
162	12	8	suffocationSigns	12
163	12	8	frozenTubers	32
164	12	8	burnedTubers	31
165	12	8	deformedTubers	31
166	12	8	tuberOutgrowths	21
167	12	8	cutCrushedTubers	31
168	12	8	peeledSkinTubers	21
169	12	9	dryRotTotal	0.4
170	12	9	dryRotPhoma	0.3
171	12	9	dryRotFusarium	0.3
172	12	9	dryRotAlternaria	0.1
173	12	9	dryRotPhytophthora	1.5
174	12	9	wetRot	2
175	12	9	scabTotal	2.1
176	12	9	commonScab	0.3
177	12	9	netScab	
178	12	9	powderyScab	0.3
179	12	9	wrinkledTubers	1
180	12	9	rhizoctonia	3
181	12	9	ringRot	234
182	12	9	stemNematode	123
183	12	9	rustySpots	123
184	12	9	mechanicalDamage	123
185	12	9	pestDamage	123
186	12	9	suffocationSigns	11.9
187	12	9	frozenTubers	321
188	12	9	burnedTubers	312
189	12	9	deformedTubers	313
190	12	9	tuberOutgrowths	212
191	12	9	cutCrushedTubers	30.9
192	12	9	peeledSkinTubers	213
\.


--
-- TOC entry 5003 (class 0 OID 65919)
-- Dependencies: 228
-- Data for Name: potatoes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.potatoes (id, culture_id, reproduction_id, upload_date, acceptance_file, customer_id, inn, kpp, test_basis, sample_receipt_date, test_duration, test_object_name, sample_code, sample_selection, sampling_act, sampling_nd, harvest_year, seed_category, research_direction, sampling_plan, additional_info, tuber_count, batch_number, batch_weight, storage_location, results_distribution, sample_storage_period, date_contract, contract_1c, passes_standard, notes) FROM stdin;
10	12	2	2025-05-27 18:52:22.742184	34	15			договор	2025-05-25	2025-05-30	Картошка проверочная	POT-20250527-10	21	12	12	2021	\N				\N						2025-05-22	12	\N	\N
\.


--
-- TOC entry 5004 (class 0 OID 65925)
-- Dependencies: 229
-- Data for Name: protocol; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.protocol (id, protocol) FROM stdin;
\.


--
-- TOC entry 5005 (class 0 OID 65930)
-- Dependencies: 230
-- Data for Name: provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.provider (id, name, adress, contact_info) FROM stdin;
1	qwertyyuioip	\N	\N
2	43	\N	\N
3	4	\N	\N
4	0	\N	\N
5	пупупу	\N	\N
6	заказчик	\N	\N
7	бебебе	\N	\N
8	цккпсс	\N	\N
9	агроторг	\N	\N
10	продукты	\N	\N
11	газпром	\N	\N
\.


--
-- TOC entry 5006 (class 0 OID 65935)
-- Dependencies: 231
-- Data for Name: reagent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reagent (id, name) FROM stdin;
16	картошка
20	подсолнух
\.


--
-- TOC entry 5007 (class 0 OID 65938)
-- Dependencies: 232
-- Data for Name: reproductions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reproductions (id, name) FROM stdin;
1	репродукция
2	ОС - оригинальная
3	ЭС - элитная
4	РС - 1 репродукция
5	РСт - 2 репродукция
6	original
7	elite
8	first
9	second
\.


--
-- TOC entry 5008 (class 0 OID 65943)
-- Dependencies: 233
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role (id, role) FROM stdin;
1	Admin
2	User
\.


--
-- TOC entry 5009 (class 0 OID 65946)
-- Dependencies: 234
-- Data for Name: seed_analyses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seed_analyses (id, seeds_id, norm_id, value) FROM stdin;
\.


--
-- TOC entry 5010 (class 0 OID 65949)
-- Dependencies: 235
-- Data for Name: seed_norms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seed_norms (id, culture_id, reproduction_id, analysis, accept_value) FROM stdin;
1	13	6	germinationEnergy	0.1
2	13	6	germination	0.4
3	13	6	seedPurity	0.3
4	13	6	waste	0.4
5	13	6	otherCropSeeds	1
6	13	6	oatSeeds	3
7	13	6	weedSeeds	4
8	13	6	quarantineSeeds	4
9	13	6	ergotSclerotia	4
10	13	6	wheatNematodeGalls	0.1321
11	13	6	smutFormations	1
12	13	6	thousandSeedWeight	4
13	13	6	alternaria	32
14	13	6	fusarium	51
15	13	6	helminthosporium	0.123321
16	13	6	septoria	0.5
17	13	6	yellowSpot	0.5
18	13	6	nigrosporiosis	23
19	13	6	blackEar	43
20	13	6	mold	21
21	13	6	totalDiseaseInfection	54
22	13	7	germinationEnergy	0.2
23	13	7	germination	0.3
24	13	7	seedPurity	0.2
25	13	7	waste	0.1
26	13	7	otherCropSeeds	2
27	13	7	oatSeeds	4
28	13	7	weedSeeds	3
29	13	7	quarantineSeeds	1
30	13	7	ergotSclerotia	2
31	13	7	wheatNematodeGalls	0.1123
32	13	7	smutFormations	2
33	13	7	thousandSeedWeight	1
34	13	7	alternaria	23
35	13	7	fusarium	14
36	13	7	helminthosporium	0.434
37	13	7	septoria	1
38	13	7	yellowSpot	12
39	13	7	nigrosporiosis	32
40	13	7	blackEar	34
41	13	7	mold	12
42	13	7	totalDiseaseInfection	45
43	13	8	germinationEnergy	0.3
44	13	8	germination	0.2
45	13	8	seedPurity	0.1
46	13	8	waste	0.1
47	13	8	otherCropSeeds	3
48	13	8	oatSeeds	2
49	13	8	weedSeeds	2
50	13	8	quarantineSeeds	2
51	13	8	ergotSclerotia	1
52	13	8	wheatNematodeGalls	0.2
53	13	8	smutFormations	4
54	13	8	thousandSeedWeight	2
55	13	8	alternaria	12
56	13	8	fusarium	32
57	13	8	helminthosporium	0.2132
58	13	8	septoria	0.6
59	13	8	yellowSpot	21
60	13	8	nigrosporiosis	23
61	13	8	blackEar	43
62	13	8	mold	21
63	13	8	totalDiseaseInfection	54
64	13	9	germinationEnergy	0.4
65	13	9	germination	0.1
66	13	9	seedPurity	0.3
67	13	9	waste	0.3
68	13	9	otherCropSeeds	4
69	13	9	oatSeeds	1
70	13	9	weedSeeds	1
71	13	9	quarantineSeeds	3
72	13	9	ergotSclerotia	2.8
73	13	9	wheatNematodeGalls	0.23
74	13	9	smutFormations	3
75	13	9	thousandSeedWeight	3
76	13	9	alternaria	32
77	13	9	fusarium	15
78	13	9	helminthosporium	0.212
79	13	9	septoria	0.7
80	13	9	yellowSpot	23
81	13	9	nigrosporiosis	32
82	13	9	blackEar	34
83	13	9	mold	12
84	13	9	totalDiseaseInfection	45
\.


--
-- TOC entry 5011 (class 0 OID 65954)
-- Dependencies: 236
-- Data for Name: seeds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seeds (id, culture_id, reproduction_id, upload_date, acceptance_file, customer_id, inn, kpp, test_basis, sample_receipt_date, test_duration, test_object_name, sample_code, sample_selection, sampling_act, sampling_nd, research_direction, sampling_plan, additional_info, tuber_count, batch_number, batch_weight, storage_location, results_distribution, sample_storage_period, date_contract, contract_1c, harvest_year, seed_category, passes_standard, notes) FROM stdin;
\.


--
-- TOC entry 5012 (class 0 OID 65960)
-- Dependencies: 237
-- Data for Name: soil; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.soil (id, culture_id, upload_date, acceptance_file, customer_id, inn, kpp, test_basis, test_object_name, sample_selection, sample_receipt_date, test_duration, sampling_act, research_direction, test_conditions, date_contract, contract_1c, passes_standard, notes) FROM stdin;
\.


--
-- TOC entry 5013 (class 0 OID 65966)
-- Dependencies: 238
-- Data for Name: soil_analyses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.soil_analyses (id, soil_id, norm_id, value) FROM stdin;
\.


--
-- TOC entry 5014 (class 0 OID 65969)
-- Dependencies: 239
-- Data for Name: soil_norms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.soil_norms (id, culture_id, analysis, accept_value) FROM stdin;
\.


--
-- TOC entry 5015 (class 0 OID 65974)
-- Dependencies: 240
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff (id, name, surname, patronymic, role_id) FROM stdin;
1	bla	bla	\N	1
2	qwerty	qwerty	\N	2
3	qwerty123	выаыв	\N	2
4	fsdf	sdfdsf	\N	2
5	иван	иванов	\N	2
6	we	we	\N	2
7	Родион	Радек	\N	1
8	bebebe	bebebe	\N	2
9	Дмитрий	Бондарев	\N	1
10	Петр	Петров	\N	2
\.


--
-- TOC entry 5046 (class 0 OID 0)
-- Dependencies: 243
-- Name: audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_log_id_seq', 123, true);


--
-- TOC entry 5047 (class 0 OID 0)
-- Dependencies: 242
-- Name: auth_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_users_id_seq', 10, true);


--
-- TOC entry 5048 (class 0 OID 0)
-- Dependencies: 244
-- Name: chemical_expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chemical_expenses_id_seq', 2, true);


--
-- TOC entry 5049 (class 0 OID 0)
-- Dependencies: 245
-- Name: chemical_parish_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chemical_parish_id_seq', 13, true);


--
-- TOC entry 5050 (class 0 OID 0)
-- Dependencies: 246
-- Name: cultures_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cultures_id_seq', 13, true);


--
-- TOC entry 5051 (class 0 OID 0)
-- Dependencies: 247
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 15, true);


--
-- TOC entry 5052 (class 0 OID 0)
-- Dependencies: 248
-- Name: equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipment_id_seq', 14, true);


--
-- TOC entry 5053 (class 0 OID 0)
-- Dependencies: 249
-- Name: logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.logs_id_seq', 354, true);


--
-- TOC entry 5054 (class 0 OID 0)
-- Dependencies: 250
-- Name: plants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.plants_id_seq', 5, true);


--
-- TOC entry 5055 (class 0 OID 0)
-- Dependencies: 251
-- Name: potato_analyses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.potato_analyses_id_seq', 10, true);


--
-- TOC entry 5056 (class 0 OID 0)
-- Dependencies: 252
-- Name: potato_norms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.potato_norms_id_seq', 192, true);


--
-- TOC entry 5057 (class 0 OID 0)
-- Dependencies: 253
-- Name: potatoes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.potatoes_id_seq', 10, true);


--
-- TOC entry 5058 (class 0 OID 0)
-- Dependencies: 254
-- Name: protocol_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.protocol_id_seq', 1, false);


--
-- TOC entry 5059 (class 0 OID 0)
-- Dependencies: 255
-- Name: provider_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.provider_id_seq', 11, true);


--
-- TOC entry 5060 (class 0 OID 0)
-- Dependencies: 256
-- Name: reagent_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reagent_id_seq', 20, true);


--
-- TOC entry 5061 (class 0 OID 0)
-- Dependencies: 257
-- Name: reproductions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reproductions_id_seq', 9, true);


--
-- TOC entry 5062 (class 0 OID 0)
-- Dependencies: 258
-- Name: seed_analyses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seed_analyses_id_seq', 1, true);


--
-- TOC entry 5063 (class 0 OID 0)
-- Dependencies: 259
-- Name: seed_norms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seed_norms_id_seq', 84, true);


--
-- TOC entry 5064 (class 0 OID 0)
-- Dependencies: 260
-- Name: seeds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seeds_id_seq', 6, true);


--
-- TOC entry 5065 (class 0 OID 0)
-- Dependencies: 262
-- Name: soil_analyses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.soil_analyses_id_seq', 1, true);


--
-- TOC entry 5066 (class 0 OID 0)
-- Dependencies: 261
-- Name: soil_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.soil_id_seq', 4, true);


--
-- TOC entry 5067 (class 0 OID 0)
-- Dependencies: 263
-- Name: soil_norms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.soil_norms_id_seq', 1, false);


--
-- TOC entry 5068 (class 0 OID 0)
-- Dependencies: 241
-- Name: staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.staff_id_seq', 10, true);


--
-- TOC entry 4773 (class 2606 OID 65980)
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- TOC entry 4775 (class 2606 OID 65982)
-- Name: auth_users auth_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_users
    ADD CONSTRAINT auth_users_pkey PRIMARY KEY (id);


--
-- TOC entry 4777 (class 2606 OID 65984)
-- Name: chemical_expenses chemical_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chemical_expenses
    ADD CONSTRAINT chemical_expenses_pkey PRIMARY KEY (id);


--
-- TOC entry 4779 (class 2606 OID 65986)
-- Name: chemical_parish chemical_parish_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chemical_parish
    ADD CONSTRAINT chemical_parish_pkey PRIMARY KEY (id);


--
-- TOC entry 4781 (class 2606 OID 65988)
-- Name: cultures cultures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cultures
    ADD CONSTRAINT cultures_pkey PRIMARY KEY (id);


--
-- TOC entry 4783 (class 2606 OID 65990)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 4785 (class 2606 OID 65992)
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (id);


--
-- TOC entry 4787 (class 2606 OID 65994)
-- Name: logs logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4809 (class 2606 OID 65996)
-- Name: seed_norms norms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seed_norms
    ADD CONSTRAINT norms_pkey PRIMARY KEY (id);


--
-- TOC entry 4789 (class 2606 OID 65998)
-- Name: plants plants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_pkey PRIMARY KEY (id);


--
-- TOC entry 4791 (class 2606 OID 66000)
-- Name: potato_analyses potato_analyses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.potato_analyses
    ADD CONSTRAINT potato_analyses_pkey PRIMARY KEY (id);


--
-- TOC entry 4793 (class 2606 OID 66002)
-- Name: potato_norms potato_norms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.potato_norms
    ADD CONSTRAINT potato_norms_pkey PRIMARY KEY (id);


--
-- TOC entry 4795 (class 2606 OID 66004)
-- Name: potatoes potatoes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.potatoes
    ADD CONSTRAINT potatoes_pkey PRIMARY KEY (id);


--
-- TOC entry 4797 (class 2606 OID 66006)
-- Name: protocol protocol_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.protocol
    ADD CONSTRAINT protocol_pkey PRIMARY KEY (id);


--
-- TOC entry 4799 (class 2606 OID 66008)
-- Name: provider provider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provider
    ADD CONSTRAINT provider_pkey PRIMARY KEY (id);


--
-- TOC entry 4801 (class 2606 OID 66010)
-- Name: reagent reagent_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reagent
    ADD CONSTRAINT reagent_pkey PRIMARY KEY (id);


--
-- TOC entry 4803 (class 2606 OID 66012)
-- Name: reproductions reproductions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reproductions
    ADD CONSTRAINT reproductions_pkey PRIMARY KEY (id);


--
-- TOC entry 4805 (class 2606 OID 66014)
-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (id);


--
-- TOC entry 4807 (class 2606 OID 66016)
-- Name: seed_analyses seed_analyses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seed_analyses
    ADD CONSTRAINT seed_analyses_pkey PRIMARY KEY (id);


--
-- TOC entry 4811 (class 2606 OID 66018)
-- Name: seeds seeds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seeds
    ADD CONSTRAINT seeds_pkey PRIMARY KEY (id);


--
-- TOC entry 4815 (class 2606 OID 66020)
-- Name: soil_analyses soil_analyses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.soil_analyses
    ADD CONSTRAINT soil_analyses_pkey PRIMARY KEY (id);


--
-- TOC entry 4817 (class 2606 OID 66022)
-- Name: soil_norms soil_norms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.soil_norms
    ADD CONSTRAINT soil_norms_pkey PRIMARY KEY (id);


--
-- TOC entry 4813 (class 2606 OID 66024)
-- Name: soil soil_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.soil
    ADD CONSTRAINT soil_pkey PRIMARY KEY (id);


--
-- TOC entry 4819 (class 2606 OID 66026)
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- TOC entry 4840 (class 2620 OID 66139)
-- Name: chemical_expenses chemical_expenses_positive_check; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER chemical_expenses_positive_check BEFORE INSERT OR UPDATE ON public.chemical_expenses FOR EACH ROW EXECUTE FUNCTION public.check_positive_quantity();


--
-- TOC entry 4841 (class 2620 OID 66146)
-- Name: chemical_parish chemical_parish_expiration_check; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER chemical_parish_expiration_check BEFORE INSERT OR UPDATE ON public.chemical_parish FOR EACH ROW EXECUTE FUNCTION public.validate_expiration_date();


--
-- TOC entry 4842 (class 2620 OID 66143)
-- Name: customers customers_audit_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER customers_audit_trigger AFTER INSERT OR DELETE OR UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.audit_customers_changes();


--
-- TOC entry 4843 (class 2620 OID 66129)
-- Name: customers customers_unique_inn_kpp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER customers_unique_inn_kpp BEFORE INSERT OR UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.check_unique_inn_kpp();


--
-- TOC entry 4844 (class 2620 OID 66141)
-- Name: equipment equipment_next_inspection; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER equipment_next_inspection BEFORE INSERT OR UPDATE OF inspection_date ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.set_next_inspection_date();


--
-- TOC entry 4845 (class 2620 OID 66131)
-- Name: potatoes potatoes_sample_code_gen; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER potatoes_sample_code_gen BEFORE INSERT ON public.potatoes FOR EACH ROW EXECUTE FUNCTION public.generate_sample_code();


--
-- TOC entry 4846 (class 2620 OID 66134)
-- Name: seeds seeds_harvest_year_check; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER seeds_harvest_year_check BEFORE INSERT OR UPDATE ON public.seeds FOR EACH ROW EXECUTE FUNCTION public.validate_harvest_year();


--
-- TOC entry 4820 (class 2606 OID 66027)
-- Name: audit_log audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.auth_users(id) ON DELETE SET NULL;


--
-- TOC entry 4821 (class 2606 OID 66032)
-- Name: chemical_expenses chemical_expenses_reagent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chemical_expenses
    ADD CONSTRAINT chemical_expenses_reagent_id_fkey FOREIGN KEY (reagent_id) REFERENCES public.reagent(id) ON DELETE CASCADE;


--
-- TOC entry 4822 (class 2606 OID 66037)
-- Name: chemical_parish chemical_parish_reagent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chemical_parish
    ADD CONSTRAINT chemical_parish_reagent_id_fkey FOREIGN KEY (reagent_id) REFERENCES public.reagent(id) ON DELETE CASCADE;


--
-- TOC entry 4823 (class 2606 OID 66042)
-- Name: chemical_parish chemical_parish_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chemical_parish
    ADD CONSTRAINT chemical_parish_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.provider(id) ON DELETE SET NULL;


--
-- TOC entry 4824 (class 2606 OID 66047)
-- Name: logs logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.auth_users(id) ON DELETE CASCADE;


--
-- TOC entry 4834 (class 2606 OID 66052)
-- Name: seed_norms norms_culture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seed_norms
    ADD CONSTRAINT norms_culture_id_fkey FOREIGN KEY (culture_id) REFERENCES public.cultures(id) ON DELETE CASCADE;


--
-- TOC entry 4835 (class 2606 OID 66057)
-- Name: seed_norms norms_reproduction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seed_norms
    ADD CONSTRAINT norms_reproduction_id_fkey FOREIGN KEY (reproduction_id) REFERENCES public.reproductions(id) ON DELETE SET NULL;


--
-- TOC entry 4825 (class 2606 OID 66062)
-- Name: plants plants_culture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_culture_id_fkey FOREIGN KEY (culture_id) REFERENCES public.cultures(id) ON DELETE SET NULL;


--
-- TOC entry 4826 (class 2606 OID 66067)
-- Name: potato_analyses potato_analyses_norm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.potato_analyses
    ADD CONSTRAINT potato_analyses_norm_id_fkey FOREIGN KEY (norm_id) REFERENCES public.potato_norms(id) ON DELETE SET NULL;


--
-- TOC entry 4827 (class 2606 OID 66072)
-- Name: potato_analyses potato_analyses_potato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.potato_analyses
    ADD CONSTRAINT potato_analyses_potato_id_fkey FOREIGN KEY (potato_id) REFERENCES public.potatoes(id) ON DELETE CASCADE;


--
-- TOC entry 4828 (class 2606 OID 66077)
-- Name: potato_norms potato_norms_culture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.potato_norms
    ADD CONSTRAINT potato_norms_culture_id_fkey FOREIGN KEY (culture_id) REFERENCES public.cultures(id) ON DELETE CASCADE;


--
-- TOC entry 4829 (class 2606 OID 66082)
-- Name: potato_norms potato_norms_reproduction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.potato_norms
    ADD CONSTRAINT potato_norms_reproduction_id_fkey FOREIGN KEY (reproduction_id) REFERENCES public.reproductions(id) ON DELETE SET NULL;


--
-- TOC entry 4830 (class 2606 OID 66087)
-- Name: potatoes potatoes_culture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.potatoes
    ADD CONSTRAINT potatoes_culture_id_fkey FOREIGN KEY (culture_id) REFERENCES public.cultures(id) ON DELETE CASCADE;


--
-- TOC entry 4831 (class 2606 OID 66092)
-- Name: potatoes potatoes_reproduction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.potatoes
    ADD CONSTRAINT potatoes_reproduction_id_fkey FOREIGN KEY (reproduction_id) REFERENCES public.reproductions(id) ON DELETE SET NULL;


--
-- TOC entry 4832 (class 2606 OID 66097)
-- Name: seed_analyses seed_analyses_norm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seed_analyses
    ADD CONSTRAINT seed_analyses_norm_id_fkey FOREIGN KEY (norm_id) REFERENCES public.seed_norms(id) ON DELETE SET NULL;


--
-- TOC entry 4833 (class 2606 OID 66102)
-- Name: seed_analyses seed_analyses_seeds_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seed_analyses
    ADD CONSTRAINT seed_analyses_seeds_id_fkey FOREIGN KEY (seeds_id) REFERENCES public.seeds(id) ON DELETE CASCADE;


--
-- TOC entry 4836 (class 2606 OID 66107)
-- Name: seeds seeds_culture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seeds
    ADD CONSTRAINT seeds_culture_id_fkey FOREIGN KEY (culture_id) REFERENCES public.cultures(id) ON DELETE CASCADE;


--
-- TOC entry 4837 (class 2606 OID 66112)
-- Name: seeds seeds_reproduction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seeds
    ADD CONSTRAINT seeds_reproduction_id_fkey FOREIGN KEY (reproduction_id) REFERENCES public.reproductions(id) ON DELETE SET NULL;


--
-- TOC entry 4838 (class 2606 OID 66117)
-- Name: soil_analyses soil_analyses_norm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.soil_analyses
    ADD CONSTRAINT soil_analyses_norm_id_fkey FOREIGN KEY (norm_id) REFERENCES public.soil_norms(id) ON DELETE SET NULL;


--
-- TOC entry 4839 (class 2606 OID 66122)
-- Name: soil_analyses soil_analyses_soil_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.soil_analyses
    ADD CONSTRAINT soil_analyses_soil_id_fkey FOREIGN KEY (soil_id) REFERENCES public.soil(id) ON DELETE CASCADE;


--
-- TOC entry 5045 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;

ALTER USER postgres WITH PASSWORD '0000';

-- Completed on 2025-05-29 13:42:56

--
-- PostgreSQL database dump complete
--

