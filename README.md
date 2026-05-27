# Medizen PMS

Medizen PMS is a local hospital and patient management system for XAMPP, PHP, MySQL, Java, and React. It supports separate admin and patient login pages, patient records, credentials, appointments, billing, inventory, wards, and audit logs.

## Ready to deploy

This workspace is arranged for local deployment with XAMPP and for development with the Java backend and React frontend. The website now uses separate login forms for admins and patients, policy links on both forms, and a credential table that matches the live patient records.


## What the system includes

- Role-based access for ADMIN, DOCTOR, NURSE, RECEPTIONIST, PATIENT, and PUBLIC users
- Separate patient credentials stored in `patient_credentials`
- Patient-linked user accounts stored in `users`
- Audit logs for important system changes
- Policy pages linked from the login forms

## Database setup

1. Start XAMPP.
2. Import the SQL scripts in `database/` if you are rebuilding the schema.
3. Use the live `pms_db` database for this workspace.
4. Keep patient records and credentials synchronized through the PHP helpers.

## Important policy pages

- [term_policy.html](term_policy.html)
- [privacy_policy.html](privacy_policy.html)

These are linked from both login pages so users can review them before signing in.

## Documentation guide

If you want setup or testing details, start with these files:

- [docs/README.md](docs/README.md)
- [docs/WEBSITE_EXPLANATION.md](docs/WEBSITE_EXPLANATION.md)
- [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)
- [docs/FILES_EXPLANATIONS.txt](docs/FILES_EXPLANATIONS.txt)
- [docs/PROJECT_DOCUMENTATION.txt](docs/PROJECT_DOCUMENTATION.txt)



## Recent Updates (CSS Organization)

The following CSS files were extracted from inline styles in `index.php` for better maintainability:

- **assets/patient-dashboard-styles.css** - Patient content typography and support widget styling
- **assets/messages-chat-styles.css** - Chat interface and messaging UI styles

These files are automatically versioned with cache-busting parameters to prevent stale CSS issues.

## User rights and policy placement

The policy links now appear in two locations:

1. **Login Pages** - Below login form (sign-in page)
   - [admin_login.php](admin_login.php)
   - [patient_login.php](patient_login.php)
   
2. **Patient Dashboard** - Under logout button in account menu
   - [index.php](index.php) (account menu footer)

This ensures users can review policies before creating credentials and have easy access from the dashboard.

## Notes for maintenance

- The patient credential table is plain text by design so staff can distribute patient login details.
- Backup tables were removed from `pms_db` after the data was confirmed to be preserved in the live tables.
- The live patient count and credential count are aligned at 34.

## Last updated

May 3, 2026
