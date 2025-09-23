import * as admin from "firebase-admin";

/**
 * Firebase configuration class.
 * It prevents the need for multiple imports of Firebase configuration throughout the codebase.
 * @class FirebaseConfig
 */
export default class FirebaseConfig {
  private static instance: FirebaseConfig;
  private readonly fbApp: admin.app.App;

  // eslint-disable-next-line require-jsdoc
  private constructor() {
    this.fbApp = admin.initializeApp({ credential: admin.credential.applicationDefault() }, "DevTasksApi");
  }

  /**
   * Get the Firebase app instance.
   * @return {admin.app.App} The Firebase app instance.
   */
  private static getInstance(): FirebaseConfig {
    if (!FirebaseConfig.instance) {
      FirebaseConfig.instance = new FirebaseConfig();
    }
    return FirebaseConfig.instance;
  }

  /**
   * Initialize and return the Firebase app instance.
   * @return {admin.app.App} The initialized Firebase app instance.
   */
  public static initializeApp(): admin.app.App {
    return FirebaseConfig.getInstance().fbApp;
  }
}
