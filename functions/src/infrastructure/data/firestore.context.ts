import * as admin from "firebase-admin";
import { injectable } from "inversify";

// import serviceAccount from "../../../devtasks-serviceaccount.json";

/**
 * Firebase configuration class.
 * It prevents the need for multiple imports of Firebase configuration throughout the codebase.
 * @class FirebaseConfig
 */
@injectable()
export default class FirestoreContext {
  private static instance: FirestoreContext;
  private readonly fbApp: admin.app.App;

  private constructor() {
    this.fbApp = admin.initializeApp({ credential: admin.credential.applicationDefault() }, "DevTasksApi");
    // this.fbApp = admin.initializeApp(
    //   { credential: admin.credential.cert(serviceAccount as admin.ServiceAccount) },
    //   "DevTasksApi",
    // );
  }

  /**
   * Get the Firestore database instance.
   * @return {FirebaseFirestore.Firestore} The Firestore database instance.
   */
  public firestore(): FirebaseFirestore.Firestore {
    return this.fbApp.firestore();
  }

  /**
   * Get the Firebase app instance.
   * @return {admin.app.App} The Firebase app instance.
   */
  public static getInstance(): FirestoreContext {
    if (!FirestoreContext.instance) {
      FirestoreContext.instance = new FirestoreContext();
    }
    return FirestoreContext.instance;
  }

  /**
   * Initialize and return the Firebase app instance.
   * @return {admin.app.App} The initialized Firebase app instance.
   */
  public static initializeApp(): admin.app.App {
    return FirestoreContext.getInstance().fbApp;
  }
}
