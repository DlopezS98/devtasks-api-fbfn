import * as admin from "firebase-admin";
// import serviceAccount from "./devtasks-serviceaccount.json";

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
    // this.fbApp = admin.initializeApp(
    //   { credential: admin.credential.cert(serviceAccount as admin.ServiceAccount) },
    //   "DevTasksApi",
    // );
  }

  /**
   * Get the Firebase app instance.
   * @return {admin.app.App} The Firebase app instance.
   */
  public static getInstance(): FirebaseConfig {
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

  /**
   * Get the Firestore database instance.
   * @return {admin.firestore.Firestore} The Firestore database instance.
   */
  public getTasksCollection(): admin.firestore.CollectionReference<Task> {
    return FirebaseConfig.getInstance().fbApp.firestore().collection("tasks").withConverter(this.taskConverter);
  }

  private taskConverter: admin.firestore.FirestoreDataConverter<Task> = {
    toFirestore(task: Task): admin.firestore.DocumentData {
      return {
        title: task.title,
        description: task.description,
        completed: task.completed,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
    },
    fromFirestore(snapshot: admin.firestore.QueryDocumentSnapshot): Task {
      const data = snapshot.data();
      return {
        id: snapshot.id,
        title: data.title,
        description: data.description,
        completed: data.completed,
        createdAt: FirestoreUtils.getDateFrom(data.createdAt) ?? new Date(0),
      };
    },
  };
}

// eslint-disable-next-line require-jsdoc
class FirestoreUtils {
  // eslint-disable-next-line require-jsdoc
  public static getDateFrom(timestamp: unknown): Date | null {
    if (!timestamp) return null;

    if (timestamp instanceof admin.firestore.Timestamp) {
      return timestamp.toDate();
    } else if (timestamp instanceof Date) {
      return timestamp;
    } else {
      return null;
    }
  }
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
}
