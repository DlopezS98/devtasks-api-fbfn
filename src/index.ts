import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import app from "./app";
import FirebaseConfig from "./firebase.config";
// import * as logger from "firebase-functions/logger";

// Initialize Firebase app
FirebaseConfig.initializeApp();

setGlobalOptions({ maxInstances: 10 });

export const api = onRequest(app);
