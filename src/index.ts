/**
 * Firebase Cloud Functions entry point.
 * This file sets up the Express app and exports it as a Firebase Function.
 */

import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import app from "./api/app";
import FirebaseConfig from "./infrastructure/firebase.config";
// import * as logger from "firebase-functions/logger";

// Initialize Firebase app
FirebaseConfig.initializeApp();

setGlobalOptions({ maxInstances: 10 });

export const api = onRequest(app);
