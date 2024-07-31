### API for sample CRUD operations

You can find a 'notes' page in [src/pages](../src/pages/notes.tsx) and components related to it in [src/components/notes/](../src/components/notes). This page is available at the /notes route and demonstrates sample CRUD operations when your app is connected to a backend API.

In order to connect to a backend API set the value of `REACT_APP_BACKEND_URL` in [src/constants.tsx](../src/constants.tsx). Following requests will be made to the backend API:

|Request |Function|
|--------|--------|
|GET/notes/|Get all the notes|
|POST/notes/|Create a new note|
|DELETE/notes/:id|Delete a note|