import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import admin from "./firebaseAdmin.js";

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
        const user = await admin.auth().getUserByEmail(username);
        return done(null, user);
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

  console.log("✅ Authentication setup with Firebase Auth");
}
