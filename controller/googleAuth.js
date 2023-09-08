import pgo2 from "passport-google-oauth20";
const GoogleStrategy = pgo2.Strategy;
import user from "../model/user.js"
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
export default function (passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GoogleclientId,
        clientSecret: process.env.GoogleclientSecret,
        callbackURL: "https://hello-live-weather.vercel.app/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        user.findOne({ email: profile.emails[0].value }).then(async (data) => {
            if (data) {
                return done(null, data);
            }
            else {
                console.log(profile);
                let data = new user({
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    profile: profile._json.picture,
                    googleId: profile.id,
                    provider: 'google',
                    city: '',
                })
                data = await data.save();
                return done(null, data);

            }
        })
    }
    ));


    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(async function (id, done) {
        let data = await user.findById(id);
        done(undefined, data._doc);
    });
}
