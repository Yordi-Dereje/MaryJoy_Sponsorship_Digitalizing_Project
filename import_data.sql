-- Connect to the database
\c mary_joy_ethiopia;

-- Import data into all tables
\copy addresses FROM 'addresses_data.csv' WITH CSV HEADER;
\copy employees FROM 'employees_data.csv' WITH CSV HEADER;
\copy sponsors FROM 'sponsors_data.csv' WITH CSV HEADER;
\copy guardians FROM 'guardians_data.csv' WITH CSV HEADER;
\copy beneficiaries FROM 'beneficiaries_data.csv' WITH CSV HEADER;
\copy phone_numbers FROM 'phone_numbers_data.csv' WITH CSV HEADER;
\copy bank_information FROM 'bank_information_data.csv' WITH CSV HEADER;
\copy sponsorships FROM 'sponsorships_data.csv' WITH CSV HEADER;
\copy payments FROM 'payments_data.csv' WITH CSV HEADER;
