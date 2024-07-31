
# Social Surge

This project was generated using the React Template of the ProcessBP Project. Below you'll find detailed instructions on how to effectively use this repo for building React Frontend Applications that can connect to a backend REST API.

 # Getting Started
 It is recommended to use Devspaces for development with this template as it uses `gitpod.yml` file for an automatic setup.
 1. Open a Devspaces workspace for the generated repo.
 2. Copy the private RSA key for the service from your project's details page.
 3. Enter the RSA key in Devspaces terminal and then hit enter twice.
 4. Enter the environment variables asked for. If you don't know what to fill then use defaults.
 5. Your React application will now be up and running. You can view it in a simple browser window in Devspaces or open a new browser window.
 6. You can now add your own components or play with the existing components.

Entrypoint for the application is `src/index.tsx` file. Follow this [documentation](docs/local_dev.md) for running the application locally.

# Folder Structure
It is recommended to follow these guidelines when creating components for your React application:
- All application logic is in the `src` folder.

- Within the `src` folder we have a `components` folder. All components should be in this folder.

- It is advised to put the components in sub-folders of their name so that other related files(CSS, test etc) can also be put in the same folder for ease of accessiblity.

- Within the `src` we also have a `pages` folder for pages which are higher-level components and can be navigated to via the router.

- Other folders like `redux` will also be created in the `src` folder if chosen by the user during template generation.

# Documentation
Refer the following documentations for the specific features of the template:

- [Environment and Secrets management](docs/env_management.md)

- [Sample CRUD API](docs/sample_crud.md)


- [Sample Test](docs/sample_tests.md)


- [Redux Example](docs/redux_example.md)


- [Authentication](docs/authentication.md)



- [Local Debugger](docs/dubugger.md)


- [Linter Configuration](docs/linting.md)


- [Deployment](docs/deployment.md)
