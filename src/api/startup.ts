import "../paths";
import app from "./app";
import FirebaseConfig from "../infrastructure/firebase.config";

// Initialize Firebase app
FirebaseConfig.initializeApp();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
