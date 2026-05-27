# PMS Folder and Architecture Explanation

This document explains the whole project in simple words: what each folder does, how the website works, how the PHP files connect, and how the frontend, backend, API, and database cooperate.

## 1. Big Picture

This project is a hospital and patient management system.

The website has these major parts:

- **Frontend**: what the user sees in the browser
- **PHP files**: the main website pages and server-side logic
- **API**: the bridge that receives requests and sends data back
- **Database**: where patients, billing, inventory, and user records are stored
- **Java backend**: an optional Spring Boot backend for service logic and future expansion

Think of it like a hospital:

- The **frontend** is the reception desk and screens the staff sees
- The **PHP files** are the clerks who take actions when buttons are clicked
- The **API** is the communication line between the desk and the records room
- The **database** is the records room
- The **Java backend** is a separate office that can handle business rules and services

---

## 2. Main Folders

### Root files
These are the most important files in the main folder:

- `index.php` - the main dashboard after login
- `admin_login.php` - login page for admins and staff
- `patient_login.php` - login page for patients
- `auth.php` - processes login and logout actions
- `api.php` - main API endpoint for saving, deleting, and loading module data
- `config.php` - database connection and security helpers
- `credentials-handler.php` - handles patient credential actions
- `router.php` - optional routing helper
- `term_policy.html` - Terms of Service page
- `privacy_policy.html` - Privacy Policy page

### `assets/`
This folder holds the site design and JavaScript.

Important files:

- `assets/app.js` - main JavaScript logic for buttons, forms, theme toggle, module actions, and dynamic UI
- `assets/styles.css` - global styling and dark mode support
- `assets/index-styles.css` - dashboard styles
- `assets/advanced-appointment-styles.css` - appointment module styles
- `assets/patient-dashboard-styles.css` - patient dashboard styling
- `assets/messages-chat-styles.css` - chat and messaging styling
- `assets/admin-verification.js` - admin verification logic

### `database/`
This folder has SQL files.

It contains:

- table creation scripts
- sample data scripts
- migration scripts
- performance/index scripts
- fixes for specific data issues

### `docs/`
This folder contains written explanations and technical guides.

It is where project documentation lives.

### `backend/`
This folder contains the Java Spring Boot backend.

It includes:

- `pom.xml` - Maven build file
- `src/main/java/` - Java source code
- `src/main/resources/` - Java application settings
- `target/` - compiled output

### `frontend/`
This folder contains the React frontend version of the system.

It is separate from the PHP website and is used for frontend development and experiments.

### `tools/`
This folder stores helper scripts.

Example:

- database repair scripts
- test scripts
- utility scripts for maintenance

---

## 3. How the Website Works

### Simple flow
1. A user opens the website.
2. The browser loads `index.php`, `admin_login.php`, or `patient_login.php`.
3. The page loads CSS from `assets/`.
4. The page loads JavaScript from `assets/app.js`.
5. When the user clicks a button, JavaScript sends a request to `api.php` or submits a form to `auth.php`.
6. The server checks the session, validates the data, and saves or loads information from the database.
7. The browser updates the screen with the response.

### Easy example
Imagine a receptionist wants to add a patient billing record:

- The receptionist opens the dashboard
- Chooses the billing module
- Types the needed details
- Clicks save
- `assets/app.js` collects the form data
- `api.php` receives the request
- `config.php` opens the database connection
- The database saves the billing record
- The page shows a success message

---

## 4. What Each PHP File Does

### `index.php`
This is the main dashboard.

It shows:

- patients
- appointments
- billing
- inventory
- wards
- analytics
- chat and support features

It also includes the main layout and pulls in CSS and JavaScript.

### `admin_login.php`
This file shows the admin login form.

It lets staff sign in and includes the policy links for users to read before login.

### `patient_login.php`
This file shows the patient login form.

It works like the admin login page, but it is designed for patient access.

### `auth.php`
This file handles login and logout actions.

It checks usernames, passwords, and session information.

### `api.php`
This is the main data endpoint.

It receives requests like:

- save a record
- delete a record
- load data for a module
- get lists for dropdowns

### `config.php`
This file connects PHP to the database.

It also holds security helpers like:

- session handling
- password utilities
- CSRF protection

### `credentials-handler.php`
This file deals with patient credential data and related helper operations.

---

## 5. How Frontend and Backend Work Together

### Frontend side
The frontend is what the user sees.

It includes:

- HTML structure from PHP pages
- CSS from files in `assets/`
- JavaScript from `assets/app.js`

### Backend side
The backend is what processes the requests.

It includes:

- PHP request handlers such as `auth.php` and `api.php`
- Java backend code in `backend/` for service logic
- the database layer for permanent storage

### How they talk to each other
The frontend sends data to the backend.
The backend checks it, saves it, and sends a response.
Then the frontend updates the screen.

---

## 6. How the API Logic Works

The API acts like a middleman.

### Example API request
A form in the browser may send this kind of request:

- module name: billing
- action: save
- patient name or patient ID
- amount
- status

### What happens next
1. JavaScript gathers the form values.
2. The browser sends the request to `api.php`.
3. `api.php` checks if the user is allowed to do the action.
4. `config.php` provides the database connection.
5. `api.php` saves or loads data.
6. The API returns JSON.
7. JavaScript shows the result on the page.

### Easy API situation
A nurse updates inventory:

- The nurse edits an item
- JavaScript sends the form data
- `api.php` receives it
- The database updates the record
- The page refreshes the inventory list

This keeps the site fast because the whole page does not need to reload every time.

---

## 7. How the Database Works

The database stores the real data.

Common tables include:

- users
- patients
- billing
- inventory
- appointments
- wards
- audit logs

### Why the database matters
If the browser closes, the data is still there because it was saved in the database.

### Example
When a user saves a new patient:

- the form sends the data
- the API validates it
- the database inserts a new row
- the patient now appears in the list

---

## 8. How the Java Backend Fits In

The `backend/` folder contains a Spring Boot project.

It is useful when you want:

- stronger service logic
- REST APIs in Java
- separate backend development
- future expansion beyond PHP

### Important Java files
- `PmsApplication.java` - app start point
- `controller/` - receives web requests
- `service/` - business logic
- `repository/` - database access logic
- `model/` - data objects
- `config/` - application configuration
- `util/` - helper classes

### Simple Java example
If the Java backend is used for user seeding or data services:

- Spring Boot starts the application
- a controller receives the request
- the service processes the logic
- the repository saves or reads data
- the response is returned

This is the same basic idea as the PHP API, just in Java instead of PHP.

---

## 9. Easy Scenarios

### Scenario 1: Admin logs in
- Admin opens `admin_login.php`
- Types username and password
- `auth.php` validates the login
- Session starts
- Admin is redirected to the dashboard

### Scenario 2: Patient logs in
- Patient opens `patient_login.php`
- Enters credentials
- `auth.php` checks the account
- Patient dashboard opens

### Scenario 3: Save a billing record
- Staff opens billing module
- Enters details
- `assets/app.js` sends the data
- `api.php` saves it in the database
- Success message appears

### Scenario 4: Inventory update
- Staff edits stock quantity
- API updates the inventory table
- Updated numbers appear in the module list

### Scenario 5: Read policies
- User sees Terms of Service and Privacy Policy links
- Clicks the link
- The policy page opens in a new tab

---

## 10. Why the Folder Layout Matters

A clear folder layout makes the project easier to:

- understand
- debug
- expand
- maintain
- hand over to another developer

The project is organized so that:

- PHP files handle pages and server requests
- assets handle appearance and interactivity
- database scripts handle schema and fixes
- docs explain how everything works
- backend contains the Java service layer

---

## 11. Short Version

If you want the simplest explanation possible:

- **PHP** files make the website work on the server
- **JavaScript** makes the page interactive
- **CSS** makes the page look good
- **API** moves data between the page and the database
- **Database** stores the data
- **Java backend** is the optional service engine for more advanced backend logic

---

## 12. Last Note

This system is built to let the user click buttons in the browser, send data through the API, and store everything safely in the database. The folder structure separates each responsibility so the website is easier to understand and maintain.
