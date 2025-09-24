import * as admin from "firebase-admin";

/**
 * Utility class for Firestore operations.
 * Provides methods for handling Firestore data types and conversions.
 */
export default class FirestoreUtils {
  /**
   * Converts a Firestore timestamp to a JavaScript Date object.
   * @param {unknown} timestamp - The Firestore timestamp to convert.
   * @return {Date | null} The converted JavaScript Date object or null if conversion fails.
   */
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
