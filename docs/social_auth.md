#### Steps to connect Google Auth between React Frontend and the template Django Backend

- Use this [guide](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid) to obtain "Client ID" and "Client Secret" for an OAuth Client and configure Redirect URI.

- Your Redirect URI is should be the /login route of your Frontend's domain/devspace public port domain.

- Configure these credentials in the `src/constants.tsx` in the React app.

- Configure these credentials in the `.env` of the Django app(you have to restart the backend if changing existing environment variables).

- If running on devspaces make sure that hosted ports are public on both apps.

- Try hitting the Login with Google button. If everything works then you will be redirected to the homepage and login button will disappear.

### Steps to connect DevConnect Auth between React Frontend and the template Django Backend

- Follow the Django Backend Template docs to obtain the `CLIENT_ID` and `CLIENT_SECRET` for the DevConnect Auth.

- Configure the DEVCONNECT_CLIENT_ID in the `src/constants.tsx` in the React app.

- The DEVCONNECT_REDIRECT_URI is the /login route of your Frontend's domain/devspace public port domain. You can change this but make sure to change it in the Django app as well.

- Configure the DEVCONNECT_CLIENT_SECRET in the `.env` of the Django app(you have to restart the backend if changing existing environment variables).

- Make sure that Port 8000 is public on the Django app and Port 3000 is public in the React app.

- Try hitting the Login with DevConnect Button. The login should work and you will be redirected to the homepage and login button will disappear.(NOTE: The authentication may take some time to complete between Django backend and devconnect servers, until then user will stay at the login page).