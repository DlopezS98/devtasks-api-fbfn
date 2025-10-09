/* eslint-disable import/order */
import "../paths";
import app from "./app";
import FirestoreContext from "@Infrastructure/data/firestore.context";

// Initialize Firebase app
FirestoreContext.initializeApp();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
