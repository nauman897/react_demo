### Adding Authentication Pages:

We have provided a signin and signup component in the `src/components` folder which are being routed to by the following routes:

- /login

- /signin

- /signup

- /register

In order to use them with the template Django backend, set the value for `REACT_APP_BACKEND_URL` variable to Django server's URL in `src/constants.tsx` file.

- Once setup, doing signup will redirect you to the login page
- Doing login will redirect to the homepage
- You can check if you're successfully signed in by checking if there is a token present in cookies of the application.