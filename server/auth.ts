import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import admin from "./firebaseAdmin";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

export function setupAuth(app) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "supersecret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production" },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, username, password);
        return done(null, userCredential.user);
      } catch (error) {
        return done(null, false, { message: "Invalid credentials" });
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.uid);
  });

  passport.deserializeUser(async (uid, done) => {
    try {
      const user = await admin.auth().getUser(uid);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}
