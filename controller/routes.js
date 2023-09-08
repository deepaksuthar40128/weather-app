import express from "express";
import passport from "passport";
const app = express();
import googleAuthSetup from './googleAuth.js';
googleAuthSetup(passport);

app.get('/logout', (req, res) => {
    req.logout(function (err) {
        req.session.destroy(function (err) {
            res.redirect('/');
        });
    });
});


app.get('/google', passport.authenticate('google', { scope: ['profile', 'email',] }));

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/');
})

export default app;