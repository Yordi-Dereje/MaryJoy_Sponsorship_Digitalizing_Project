--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: access_level_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.access_level_enum AS ENUM (
    'admin',
    'moderator',
    'viewer'
);


ALTER TYPE public.access_level_enum OWNER TO postgres;

--
-- Name: access_level_enum_new; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.access_level_enum_new AS ENUM (
    'admin',
    'dbofficer',
    'coordinator'
);


ALTER TYPE public.access_level_enum_new OWNER TO postgres;

--
-- Name: beneficiary_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.beneficiary_status_enum AS ENUM (
    'active',
    'inactive',
    'pending',
    'graduated',
    'deceased'
);


ALTER TYPE public.beneficiary_status_enum OWNER TO postgres;

--
-- Name: beneficiary_status_enum_new; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.beneficiary_status_enum_new AS ENUM (
    'active',
    'waiting_list',
    'pending_reassignment',
    'graduated',
    'terminated'
);


ALTER TYPE public.beneficiary_status_enum_new OWNER TO postgres;

--
-- Name: beneficiary_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.beneficiary_type_enum AS ENUM (
    'child',
    'elderly'
);


ALTER TYPE public.beneficiary_type_enum OWNER TO postgres;

--
-- Name: document_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.document_type_enum AS ENUM (
    'id_card',
    'passport',
    'bank_statement',
    'contract',
    'other'
);


ALTER TYPE public.document_type_enum OWNER TO postgres;

--
-- Name: entity_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.entity_type_enum AS ENUM (
    'sponsor',
    'beneficiary',
    'guardian'
);


ALTER TYPE public.entity_type_enum OWNER TO postgres;

--
-- Name: enum_sponsors_gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_sponsors_gender AS ENUM (
    'male',
    'female',
    'other'
);


ALTER TYPE public.enum_sponsors_gender OWNER TO postgres;

--
-- Name: enum_sponsors_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_sponsors_status AS ENUM (
    'pending_review',
    'active',
    'inactive',
    'suspended'
);


ALTER TYPE public.enum_sponsors_status OWNER TO postgres;

--
-- Name: enum_sponsors_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_sponsors_type AS ENUM (
    'individual',
    'organization'
);


ALTER TYPE public.enum_sponsors_type OWNER TO postgres;

--
-- Name: feedback_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.feedback_status_enum AS ENUM (
    'pending',
    'responded',
    'resolved'
);


ALTER TYPE public.feedback_status_enum OWNER TO postgres;

--
-- Name: gender_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.gender_enum AS ENUM (
    'male',
    'female'
);


ALTER TYPE public.gender_enum OWNER TO postgres;

--
-- Name: request_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.request_status_enum AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.request_status_enum OWNER TO postgres;

--
-- Name: request_status_enum_new; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.request_status_enum_new AS ENUM (
    'pending_review',
    'under_review',
    'approved',
    'rejected'
);


ALTER TYPE public.request_status_enum_new OWNER TO postgres;

--
-- Name: sponsor_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sponsor_status_enum AS ENUM (
    'active',
    'inactive',
    'pending_review',
    'suspended'
);


ALTER TYPE public.sponsor_status_enum OWNER TO postgres;

--
-- Name: sponsor_status_enum_new; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sponsor_status_enum_new AS ENUM (
    'pending_review',
    'under_review',
    'active',
    'inactive'
);


ALTER TYPE public.sponsor_status_enum_new OWNER TO postgres;

--
-- Name: sponsor_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sponsor_type_enum AS ENUM (
    'individual',
    'organization'
);


ALTER TYPE public.sponsor_type_enum OWNER TO postgres;

--
-- Name: sponsorship_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sponsorship_status_enum AS ENUM (
    'active',
    'completed',
    'terminated',
    'pending'
);


ALTER TYPE public.sponsorship_status_enum OWNER TO postgres;

--
-- Name: calculate_cluster_id(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_cluster_id(specific_id_int integer) RETURNS character
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN LPAD(((specific_id_int - 1) / 1000) + 1::TEXT, 2, '0');
END;
$$;


ALTER FUNCTION public.calculate_cluster_id(specific_id_int integer) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.addresses (
    id integer NOT NULL,
    country character varying(100) NOT NULL,
    region character varying(100) NOT NULL,
    sub_region character varying(100),
    woreda character varying(100),
    house_number character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.addresses OWNER TO postgres;

--
-- Name: addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.addresses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.addresses_id_seq OWNER TO postgres;

--
-- Name: addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.addresses_id_seq OWNED BY public.addresses.id;


--
-- Name: bank_information; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_information (
    id integer NOT NULL,
    entity_type public.entity_type_enum NOT NULL,
    sponsor_cluster_id character(2),
    sponsor_specific_id character(4),
    beneficiary_id integer,
    guardian_id integer,
    bank_account_number character varying(100) NOT NULL,
    bank_name character varying(100) NOT NULL,
    bank_book_photo_url character varying(500),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bank_information_check CHECK ((((entity_type = 'sponsor'::public.entity_type_enum) AND (sponsor_cluster_id IS NOT NULL) AND (sponsor_specific_id IS NOT NULL) AND (beneficiary_id IS NULL) AND (guardian_id IS NULL)) OR ((entity_type = 'beneficiary'::public.entity_type_enum) AND (beneficiary_id IS NOT NULL) AND (sponsor_cluster_id IS NULL) AND (sponsor_specific_id IS NULL) AND (guardian_id IS NULL)) OR ((entity_type = 'guardian'::public.entity_type_enum) AND (guardian_id IS NOT NULL) AND (sponsor_cluster_id IS NULL) AND (sponsor_specific_id IS NULL) AND (beneficiary_id IS NULL))))
);


ALTER TABLE public.bank_information OWNER TO postgres;

--
-- Name: bank_information_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bank_information_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bank_information_id_seq OWNER TO postgres;

--
-- Name: bank_information_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bank_information_id_seq OWNED BY public.bank_information.id;


--
-- Name: beneficiaries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.beneficiaries (
    id integer NOT NULL,
    type public.beneficiary_type_enum NOT NULL,
    full_name character varying(255) NOT NULL,
    gender public.gender_enum NOT NULL,
    date_of_birth date NOT NULL,
    photo_url character varying(500),
    status public.beneficiary_status_enum_new NOT NULL,
    guardian_id integer,
    address_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.beneficiaries OWNER TO postgres;

--
-- Name: beneficiaries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.beneficiaries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.beneficiaries_id_seq OWNER TO postgres;

--
-- Name: beneficiaries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.beneficiaries_id_seq OWNED BY public.beneficiaries.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    full_name character varying(255) NOT NULL,
    date_of_birth date,
    gender public.gender_enum,
    department character varying(100) NOT NULL,
    phone_number character varying(20) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    access_level public.access_level_enum DEFAULT 'viewer'::public.access_level_enum NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employees_id_seq OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: guardians; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guardians (
    id integer NOT NULL,
    full_name character varying(255) NOT NULL,
    relation_to_beneficiary character varying(100) NOT NULL,
    address_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.guardians OWNER TO postgres;

--
-- Name: guardians_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.guardians_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guardians_id_seq OWNER TO postgres;

--
-- Name: guardians_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.guardians_id_seq OWNED BY public.guardians.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    sponsor_cluster_id character(2) NOT NULL,
    sponsor_specific_id character(4) NOT NULL,
    payment_date date NOT NULL,
    amount numeric(12,2) NOT NULL,
    start_month integer NOT NULL,
    end_month integer NOT NULL,
    year integer NOT NULL,
    bank_receipt_url character varying(500) NOT NULL,
    company_receipt_url character varying(500) NOT NULL,
    reference_number character varying(100),
    confirmed_by integer NOT NULL,
    confirmed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payments_end_month_check CHECK (((end_month >= 1) AND (end_month <= 12))),
    CONSTRAINT payments_start_month_check CHECK (((start_month >= 1) AND (start_month <= 12)))
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: phone_numbers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.phone_numbers (
    id integer NOT NULL,
    entity_type public.entity_type_enum NOT NULL,
    sponsor_cluster_id character(2),
    sponsor_specific_id character(4),
    beneficiary_id integer,
    guardian_id integer,
    primary_phone character varying(20) NOT NULL,
    secondary_phone character varying(20),
    tertiary_phone character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT phone_numbers_check CHECK ((((entity_type = 'sponsor'::public.entity_type_enum) AND (sponsor_cluster_id IS NOT NULL) AND (sponsor_specific_id IS NOT NULL) AND (beneficiary_id IS NULL) AND (guardian_id IS NULL)) OR ((entity_type = 'beneficiary'::public.entity_type_enum) AND (beneficiary_id IS NOT NULL) AND (sponsor_cluster_id IS NULL) AND (sponsor_specific_id IS NULL) AND (guardian_id IS NULL)) OR ((entity_type = 'guardian'::public.entity_type_enum) AND (guardian_id IS NOT NULL) AND (sponsor_cluster_id IS NULL) AND (sponsor_specific_id IS NULL) AND (beneficiary_id IS NULL))))
);


ALTER TABLE public.phone_numbers OWNER TO postgres;

--
-- Name: phone_numbers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.phone_numbers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.phone_numbers_id_seq OWNER TO postgres;

--
-- Name: phone_numbers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.phone_numbers_id_seq OWNED BY public.phone_numbers.id;


--
-- Name: sponsors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sponsors (
    cluster_id character varying(2) NOT NULL,
    specific_id character varying(4) NOT NULL,
    type public.sponsor_type_enum NOT NULL,
    full_name character varying(255) NOT NULL,
    date_of_birth date,
    gender public.gender_enum,
    profile_picture_url character varying(500),
    starting_date date,
    agreed_monthly_payment numeric(12,2),
    emergency_contact_name character varying(255),
    emergency_contact_phone character varying(20),
    status public.sponsor_status_enum DEFAULT 'pending_review'::public.sponsor_status_enum NOT NULL,
    is_diaspora boolean DEFAULT false NOT NULL,
    address_id integer,
    password_hash character varying(255),
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    phone_number character varying(20),
    sponsor_id character varying(255),
    consent_document_url character varying(255)
);


ALTER TABLE public.sponsors OWNER TO postgres;

--
-- Name: sponsorships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sponsorships (
    id integer NOT NULL,
    sponsor_cluster_id character(2) NOT NULL,
    sponsor_specific_id character(4) NOT NULL,
    beneficiary_id integer NOT NULL,
    start_date date NOT NULL,
    end_date date,
    monthly_amount numeric(12,2) NOT NULL,
    status public.sponsorship_status_enum DEFAULT 'active'::public.sponsorship_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sponsorships OWNER TO postgres;

--
-- Name: sponsorships_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sponsorships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sponsorships_id_seq OWNER TO postgres;

--
-- Name: sponsorships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sponsorships_id_seq OWNED BY public.sponsorships.id;


--
-- Name: addresses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses ALTER COLUMN id SET DEFAULT nextval('public.addresses_id_seq'::regclass);


--
-- Name: bank_information id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_information ALTER COLUMN id SET DEFAULT nextval('public.bank_information_id_seq'::regclass);


--
-- Name: beneficiaries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beneficiaries ALTER COLUMN id SET DEFAULT nextval('public.beneficiaries_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: guardians id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guardians ALTER COLUMN id SET DEFAULT nextval('public.guardians_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: phone_numbers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phone_numbers ALTER COLUMN id SET DEFAULT nextval('public.phone_numbers_id_seq'::regclass);


--
-- Name: sponsorships id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsorships ALTER COLUMN id SET DEFAULT nextval('public.sponsorships_id_seq'::regclass);


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.addresses (id, country, region, sub_region, woreda, house_number, created_at, updated_at) FROM stdin;
1	Ethiopia	Addis Ababa	Central	Kirkos	H12	2025-08-30 09:37:51.649788	2025-08-30 09:37:51.649788
2	Ethiopia	Addis Ababa	Central	Arada	G45	2025-08-30 09:37:51.649788	2025-08-30 09:37:51.649788
3	Ethiopia	Addis Ababa	North	Kolfe	K78	2025-08-30 09:37:51.649788	2025-08-30 09:37:51.649788
4	Ethiopia	Oromia	East Shewa	Bishoftu	R34	2025-08-30 09:37:51.649788	2025-08-30 09:37:51.649788
5	Ethiopia	Amhara	North Gondar	Gondar	V34	2025-08-30 09:37:51.649788	2025-08-30 09:37:51.649788
6	United States	California	Los Angeles County	Los Angeles	123 Sunset Blvd	2025-08-30 09:37:51.649788	2025-08-30 09:37:51.649788
7	United States	New York	New York County	Manhattan	456 Broadway	2025-08-30 09:37:51.649788	2025-08-30 09:37:51.649788
8	United Kingdom	England	Greater London	London	44 Oxford Street	2025-08-30 09:37:51.649788	2025-08-30 09:37:51.649788
9	Canada	Ontario	Toronto Municipality	Toronto	55 Yonge Street	2025-08-30 09:37:51.649788	2025-08-30 09:37:51.649788
10	United Arab Emirates	Dubai	Dubai Emirate	Dubai	444 Sheikh Zayed Road	2025-08-30 09:37:51.649788	2025-08-30 09:37:51.649788
\.


--
-- Data for Name: bank_information; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_information (id, entity_type, sponsor_cluster_id, sponsor_specific_id, beneficiary_id, guardian_id, bank_account_number, bank_name, bank_book_photo_url, is_active, created_at, updated_at) FROM stdin;
4	guardian	\N	\N	\N	1	1000123456792	Commercial Bank of Ethiopia	\N	t	2025-08-30 09:37:51.668493	2025-08-30 09:37:51.668493
5	guardian	\N	\N	\N	2	1000123456793	Commercial Bank of Ethiopia	\N	t	2025-08-30 09:37:51.668493	2025-08-30 09:37:51.668493
6	beneficiary	\N	\N	6	\N	1000123456794	Commercial Bank of Ethiopia	\N	t	2025-08-30 09:37:51.668493	2025-08-30 09:37:51.668493
7	beneficiary	\N	\N	7	\N	1000123456795	Commercial Bank of Ethiopia	\N	t	2025-08-30 09:37:51.668493	2025-08-30 09:37:51.668493
1	sponsor	01	0001	\N	\N	1000123456789	Commercial Bank of Ethiopia	\N	t	2025-08-30 09:37:51.668493	2025-08-30 09:37:51.668493
2	sponsor	01	0002	\N	\N	5000123456790	Dashen Bank	\N	t	2025-08-30 09:37:51.668493	2025-08-30 09:37:51.668493
3	sponsor	01	0004	\N	\N	1000123456791	Commercial Bank of Ethiopia	\N	t	2025-08-30 09:37:51.668493	2025-08-30 09:37:51.668493
\.


--
-- Data for Name: beneficiaries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.beneficiaries (id, type, full_name, gender, date_of_birth, photo_url, status, guardian_id, address_id, created_at, updated_at) FROM stdin;
1	child	Liya Tigist	female	2018-03-15	\N	active	1	1	2025-08-30 09:37:51.658972	2025-08-30 09:37:51.658972
2	child	Nathan Solomon	male	2019-07-22	\N	active	2	2	2025-08-30 09:37:51.658972	2025-08-30 09:37:51.658972
3	child	Maya Meskel	female	2020-11-30	\N	active	3	3	2025-08-30 09:37:51.658972	2025-08-30 09:37:51.658972
4	child	Elias Rahel	male	2017-05-18	\N	active	4	4	2025-08-30 09:37:51.658972	2025-08-30 09:37:51.658972
5	child	Sofia Birhanu	female	2018-09-12	\N	active	5	5	2025-08-30 09:37:51.658972	2025-08-30 09:37:51.658972
6	elderly	Workneh Alemu	male	1945-03-15	\N	active	\N	1	2025-08-30 09:37:51.658972	2025-08-30 09:37:51.658972
7	elderly	Aster Bekele	female	1948-07-22	\N	active	\N	2	2025-08-30 09:37:51.658972	2025-08-30 09:37:51.658972
8	elderly	Girma Tesfaye	male	1950-11-30	\N	active	\N	3	2025-08-30 09:37:51.658972	2025-08-30 09:37:51.658972
9	elderly	Zewdie Haile	female	1952-05-18	\N	active	\N	4	2025-08-30 09:37:51.658972	2025-08-30 09:37:51.658972
10	elderly	Tadesse Worku	male	1955-09-12	\N	active	\N	5	2025-08-30 09:37:51.658972	2025-08-30 09:37:51.658972
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, full_name, date_of_birth, gender, department, phone_number, email, password_hash, access_level, created_at, updated_at) FROM stdin;
1	Alemu Tesfaye	1985-03-15	male	Administration	+251911223344	alemu@maryjoy.org	hashed_password_1	admin	2025-08-30 09:37:51.638546	2025-08-30 09:37:51.638546
2	Meron Alemayehu	1990-07-22	female	Coordination	+251922334455	meron@maryjoy.org	hashed_password_2	moderator	2025-08-30 09:37:51.638546	2025-08-30 09:37:51.638546
3	Bereket Haile	1988-11-30	male	Finance	+251933445566	bereket@maryjoy.org	hashed_password_3	moderator	2025-08-30 09:37:51.638546	2025-08-30 09:37:51.638546
\.


--
-- Data for Name: guardians; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.guardians (id, full_name, relation_to_beneficiary, address_id, created_at, updated_at) FROM stdin;
1	Tigist Alemu	Mother	1	2025-08-30 09:37:51.656136	2025-08-30 09:37:51.656136
2	Solomon Bekele	Father	2	2025-08-30 09:37:51.656136	2025-08-30 09:37:51.656136
3	Meskel Haile	Grandfather	3	2025-08-30 09:37:51.656136	2025-08-30 09:37:51.656136
4	Rahel Tesfaye	Aunt	4	2025-08-30 09:37:51.656136	2025-08-30 09:37:51.656136
5	Birhanu Girma	Uncle	5	2025-08-30 09:37:51.656136	2025-08-30 09:37:51.656136
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, sponsor_cluster_id, sponsor_specific_id, payment_date, amount, start_month, end_month, year, bank_receipt_url, company_receipt_url, reference_number, confirmed_by, confirmed_at) FROM stdin;
\.


--
-- Data for Name: phone_numbers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.phone_numbers (id, entity_type, sponsor_cluster_id, sponsor_specific_id, beneficiary_id, guardian_id, primary_phone, secondary_phone, tertiary_phone, created_at, updated_at) FROM stdin;
5	guardian	\N	\N	\N	1	+251911200001	\N	\N	2025-08-30 09:37:51.663703	2025-08-30 09:37:51.663703
6	guardian	\N	\N	\N	2	+251911200002	\N	\N	2025-08-30 09:37:51.663703	2025-08-30 09:37:51.663703
7	guardian	\N	\N	\N	3	+251911200003	\N	\N	2025-08-30 09:37:51.663703	2025-08-30 09:37:51.663703
8	beneficiary	\N	\N	6	\N	+251911300001	\N	\N	2025-08-30 09:37:51.663703	2025-08-30 09:37:51.663703
9	beneficiary	\N	\N	7	\N	+251911300002	\N	\N	2025-08-30 09:37:51.663703	2025-08-30 09:37:51.663703
10	beneficiary	\N	\N	6	\N	+251911300001	\N	\N	2025-08-30 10:47:03.561361	2025-08-30 10:47:03.561361
11	beneficiary	\N	\N	7	\N	+251911300002	\N	\N	2025-08-30 10:47:03.561361	2025-08-30 10:47:03.561361
12	beneficiary	\N	\N	8	\N	+251911300003	\N	\N	2025-08-30 10:47:03.561361	2025-08-30 10:47:03.561361
13	beneficiary	\N	\N	9	\N	+251911300004	\N	\N	2025-08-30 10:47:03.561361	2025-08-30 10:47:03.561361
14	beneficiary	\N	\N	10	\N	+251911300005	\N	\N	2025-08-30 10:47:03.561361	2025-08-30 10:47:03.561361
15	guardian	\N	\N	\N	4	+251911200004	\N	\N	2025-08-30 10:48:40.898704	2025-08-30 10:48:40.898704
16	guardian	\N	\N	\N	5	+251911200005	\N	\N	2025-08-30 10:48:40.898704	2025-08-30 10:48:40.898704
1	sponsor	01	0001	\N	\N	+251911100001	\N	\N	2025-08-30 09:37:51.663703	2025-08-30 09:37:51.663703
2	sponsor	01	0002	\N	\N	+251911100002	\N	\N	2025-08-30 09:37:51.663703	2025-08-30 09:37:51.663703
3	sponsor	01	0004	\N	\N	+14165550123	\N	\N	2025-08-30 09:37:51.663703	2025-08-30 09:37:51.663703
4	sponsor	01	0005	\N	\N	+12125550124	\N	\N	2025-08-30 09:37:51.663703	2025-08-30 09:37:51.663703
17	sponsor	01	0003	\N	\N	+251111223344	\N	\N	2025-08-30 12:41:39.937449	2025-08-30 12:41:39.937449
\.


--
-- Data for Name: sponsors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sponsors (cluster_id, specific_id, type, full_name, date_of_birth, gender, profile_picture_url, starting_date, agreed_monthly_payment, emergency_contact_name, emergency_contact_phone, status, is_diaspora, address_id, password_hash, created_by, created_at, updated_at, phone_number, sponsor_id, consent_document_url) FROM stdin;
01	0001	individual	Abebe Bekele	1975-03-15	male	\N	2023-01-01	5000.00	Mulu Bekele	+251911000001	active	f	1	\N	1	2025-08-30 09:37:51.652497	2025-08-30 09:37:51.652497	\N	\N	\N
01	0002	individual	Muluwork Abebe	1980-07-22	female	\N	2023-01-15	3000.00	Kebede Abebe	+251911000002	active	f	2	\N	1	2025-08-30 09:37:51.652497	2025-08-30 09:37:51.652497	\N	\N	\N
01	0003	organization	Ethio Telecom Foundation	\N	\N	\N	2023-01-05	20000.00	HR Department	+251111223344	active	f	3	\N	1	2025-08-30 09:37:51.652497	2025-08-30 09:37:51.652497	\N	\N	\N
01	0004	individual	Alemayehu Tadesse	1970-04-20	male	\N	2023-01-10	8000.00	Meseret Alemayehu	+14165550123	active	t	6	\N	1	2025-08-30 09:37:51.652497	2025-08-30 09:37:51.652497	\N	\N	\N
01	0005	individual	Meseret Haile	1975-08-25	female	\N	2023-01-25	5500.00	Tadesse Meseret	+12125550124	active	t	7	\N	1	2025-08-30 09:37:51.652497	2025-08-30 09:37:51.652497	\N	\N	\N
\.


--
-- Data for Name: sponsorships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sponsorships (id, sponsor_cluster_id, sponsor_specific_id, beneficiary_id, start_date, end_date, monthly_amount, status, created_at) FROM stdin;
1	01	0001	1	2023-01-01	\N	500.00	active	2025-08-30 09:37:51.673127
2	01	0001	2	2023-01-01	\N	500.00	active	2025-08-30 09:37:51.673127
3	01	0002	3	2023-01-15	\N	300.00	active	2025-08-30 09:37:51.673127
4	01	0004	6	2023-01-10	\N	800.00	active	2025-08-30 09:37:51.673127
5	01	0005	7	2023-01-25	\N	550.00	active	2025-08-30 09:37:51.673127
6	01	0003	4	2023-01-05	\N	2000.00	active	2025-08-30 09:37:51.673127
7	01	0003	8	2023-01-05	\N	1500.00	active	2025-08-30 09:37:51.673127
\.


--
-- Name: addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.addresses_id_seq', 10, true);


--
-- Name: bank_information_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bank_information_id_seq', 7, true);


--
-- Name: beneficiaries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.beneficiaries_id_seq', 10, true);


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_id_seq', 3, true);


--
-- Name: guardians_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.guardians_id_seq', 5, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: phone_numbers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.phone_numbers_id_seq', 17, true);


--
-- Name: sponsorships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sponsorships_id_seq', 7, true);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: bank_information bank_information_bank_account_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_information
    ADD CONSTRAINT bank_information_bank_account_number_key UNIQUE (bank_account_number);


--
-- Name: bank_information bank_information_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_information
    ADD CONSTRAINT bank_information_pkey PRIMARY KEY (id);


--
-- Name: beneficiaries beneficiaries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beneficiaries
    ADD CONSTRAINT beneficiaries_pkey PRIMARY KEY (id);


--
-- Name: employees employees_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_email_key UNIQUE (email);


--
-- Name: employees employees_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_phone_number_key UNIQUE (phone_number);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: guardians guardians_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guardians
    ADD CONSTRAINT guardians_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: phone_numbers phone_numbers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phone_numbers
    ADD CONSTRAINT phone_numbers_pkey PRIMARY KEY (id);


--
-- Name: sponsors sponsors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsors
    ADD CONSTRAINT sponsors_pkey PRIMARY KEY (cluster_id, specific_id);


--
-- Name: sponsorships sponsorships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsorships
    ADD CONSTRAINT sponsorships_pkey PRIMARY KEY (id);


--
-- Name: bank_information bank_information_beneficiary_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_information
    ADD CONSTRAINT bank_information_beneficiary_id_fkey FOREIGN KEY (beneficiary_id) REFERENCES public.beneficiaries(id) ON DELETE CASCADE;


--
-- Name: bank_information bank_information_guardian_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_information
    ADD CONSTRAINT bank_information_guardian_id_fkey FOREIGN KEY (guardian_id) REFERENCES public.guardians(id) ON DELETE CASCADE;


--
-- Name: bank_information bank_information_sponsor_cluster_id_sponsor_specific_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_information
    ADD CONSTRAINT bank_information_sponsor_cluster_id_sponsor_specific_id_fkey FOREIGN KEY (sponsor_cluster_id, sponsor_specific_id) REFERENCES public.sponsors(cluster_id, specific_id) ON DELETE CASCADE;


--
-- Name: beneficiaries beneficiaries_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beneficiaries
    ADD CONSTRAINT beneficiaries_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.addresses(id) ON DELETE SET NULL;


--
-- Name: beneficiaries beneficiaries_guardian_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beneficiaries
    ADD CONSTRAINT beneficiaries_guardian_id_fkey FOREIGN KEY (guardian_id) REFERENCES public.guardians(id) ON DELETE SET NULL;


--
-- Name: guardians guardians_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guardians
    ADD CONSTRAINT guardians_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.addresses(id) ON DELETE SET NULL;


--
-- Name: payments payments_confirmed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_confirmed_by_fkey FOREIGN KEY (confirmed_by) REFERENCES public.employees(id) ON DELETE RESTRICT;


--
-- Name: payments payments_sponsor_cluster_id_sponsor_specific_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_sponsor_cluster_id_sponsor_specific_id_fkey FOREIGN KEY (sponsor_cluster_id, sponsor_specific_id) REFERENCES public.sponsors(cluster_id, specific_id) ON DELETE CASCADE;


--
-- Name: phone_numbers phone_numbers_beneficiary_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phone_numbers
    ADD CONSTRAINT phone_numbers_beneficiary_id_fkey FOREIGN KEY (beneficiary_id) REFERENCES public.beneficiaries(id) ON DELETE CASCADE;


--
-- Name: phone_numbers phone_numbers_guardian_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phone_numbers
    ADD CONSTRAINT phone_numbers_guardian_id_fkey FOREIGN KEY (guardian_id) REFERENCES public.guardians(id) ON DELETE CASCADE;


--
-- Name: phone_numbers phone_numbers_sponsor_cluster_id_sponsor_specific_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phone_numbers
    ADD CONSTRAINT phone_numbers_sponsor_cluster_id_sponsor_specific_id_fkey FOREIGN KEY (sponsor_cluster_id, sponsor_specific_id) REFERENCES public.sponsors(cluster_id, specific_id) ON DELETE CASCADE;


--
-- Name: sponsors sponsors_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsors
    ADD CONSTRAINT sponsors_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.addresses(id) ON DELETE SET NULL;


--
-- Name: sponsors sponsors_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsors
    ADD CONSTRAINT sponsors_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.employees(id) ON DELETE RESTRICT;


--
-- Name: sponsorships sponsorships_beneficiary_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsorships
    ADD CONSTRAINT sponsorships_beneficiary_id_fkey FOREIGN KEY (beneficiary_id) REFERENCES public.beneficiaries(id) ON DELETE CASCADE;


--
-- Name: sponsorships sponsorships_sponsor_cluster_id_sponsor_specific_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsorships
    ADD CONSTRAINT sponsorships_sponsor_cluster_id_sponsor_specific_id_fkey FOREIGN KEY (sponsor_cluster_id, sponsor_specific_id) REFERENCES public.sponsors(cluster_id, specific_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

