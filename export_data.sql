-- Connect to the database
\c mary_joy_ethiopia;

-- Export data from all tables
\copy addresses TO 'addresses_data.csv' WITH CSV HEADER;
\copy employees TO 'employees_data.csv' WITH CSV HEADER;
\copy sponsors TO 'sponsors_data.csv' WITH CSV HEADER;
\copy guardians TO 'guardians_data.csv' WITH CSV HEADER;
\copy beneficiaries TO 'beneficiaries_data.csv' WITH CSV HEADER;
\copy phone_numbers TO 'phone_numbers_data.csv' WITH CSV HEADER;
\copy bank_information TO 'bank_information_data.csv' WITH CSV HEADER;
\copy sponsorships TO 'sponsorships_data.csv' WITH CSV HEADER;
\copy payments TO 'payments_data.csv' WITH CSV HEADER;
