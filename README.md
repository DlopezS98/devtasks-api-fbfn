## Project dependencies
- Node.js v22.13.0
- Firebase CLI v14.17.0
- Firebase Admin SDK v12.6.0
- Express v5.1.0

## Project Setup & Running Locally
1. Ensure you have Node.js and npm installed.
2. Clone the repository
3. Install the dependencies:
```bash
cd functions && npm install
```
4. Setup firebase

By default, this project uses application default credentials for authentication.
- The project also supports using a service account key file.
- To use application default credentials:
    - Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to point to your service account key file, **or**
    - Install the [GCloud CLI](https://cloud.google.com/sdk/docs/install) and run `gcloud auth application-default login` to authenticate with your Google account.
        - This will generate the application default credentials file at:
            - `~/.config/gcloud/application_default_credentials.json` on Linux or macOS
            - `%APPDATA%\gcloud\application_default_credentials.json` on Windows

If you prefer to use a service account key file, follow these steps:
- Create a Firebase project and generate a service account key.
- Save the service account JSON file as `devtasks-serviceaccount.json` in the project source folder `src`.
- Locate the `firestore.context.ts` file in the `functions/src/infrastructure/data/` folder.
- Uncomment the lines that import the service account and initialize the Firebase app with it.

5. Create a `development.env` file in the `functions/src` directory and add the following environment variables:
```env
PORT=3000
CORS_ORIGIN=*
SERVICE_ACCOUNT_EMAIL = <your-service-account-email>@<your-project-id>.iam.gserviceaccount.com
JWT_ISSUER = <your-service-account-email>@<your-project-id>.iam.gserviceaccount.com
JWT_AUDIENCE = your-web-app-or-client-id
JWT_ACCESS_TOKEN_MINUTES = 7200
JWT_REFRESH_TOKEN_DAYS = 30
JWT_SIGNING_KEY = <USE_THE_PRIVATE_KEY_FROM_YOUR_SERVICE_ACCOUNT_JSON_FILE>
```

6. Start the development server:
```bash
npm run dev
```
7. The server will be running at `http://localhost:3000`:
8. You can also launch the Firebase Emulator Suite to test the functions locally:
```bash
npm run serve
```
9. This launches the Firebase Emulator Suite, which includes the Functions emulator. You can access the Emulator Suite UI at `http://localhost:4000`.


### Testing the API Endpoints
This project contains some http files in the `http` folder. You can test these endpoints an extension like [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) in VSCode.
- Make sure to switch or set the appropriate environment in the REST Client extension to match your local server settings or deployed environment.
    - Ctrl+Shift+P -> REST Client: Switch Environment -> Select `development` for local testing.
- Open any of the `.http` files in the `http` folder and click on the "Send Request" link above each request to execute it.
- Ensure the server is running locally before sending requests.

### Generate firebase token for CI/CD
1. Install the Firebase CLI if you haven't already:
```bash
npm install -g firebase-tools
```
2. Log in to your Firebase account:
```bash
firebase login:ci
```
3. This command will open a browser window for you to log in to your Firebase account. After logging in, you will receive a token in the terminal.
4. Copy this token and add it as a secret in your GitHub repository settings:
    - Go to your GitHub repository.
    - Navigate to `Settings` > `Secrets and variables` > `Actions`.
    - Click on `New repository secret`.
    - Name the secret `FIREBASE_TOKEN` and paste the token you copied earlier as the value.
5. Save logic apply for other secrets like `SERVICE_ACCOUNT_EMAIL`, `CORS_ORIGIN`, and `JWT_SIGNING_KEY` as needed.