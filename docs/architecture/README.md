# Architecture Docs

This folder is for simple explanations of how the PMS website works.

## What belongs here

- How the website starts after login
- How `index.php`, `auth.php`, and `api.php` work together
- How the frontend, backend, and database communicate
- User flow examples for billing, inventory, patients, and login

## Current files

- `FOLDER_AND_ARCHITECTURE_EXPLANATION.md`
- `FOLDER_AND_ARCHITECTURE_EXPLANATION.txt`

## Plain explanation

Think of the architecture like this:

- `index.php` is the main control room
- `assets/app.js` is the helper that makes the page interactive
- `api.php` is the messenger that sends data to the server logic
- the database stores the records permanently
- the Java backend can act as an additional service layer
