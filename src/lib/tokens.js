
const jwt = require("jsonwebtoken");

async function createJWT(user) {
    let token;
        try {
            //Creating jwt token
            token = jwt.sign(
                {
                    username_discord: user.discordname,
                    username_strava: user.stravaname,
                    id: user.id
                },
                process.env.AUTH_SECRET,
                { expiresIn: "1h" }
            );
        } catch (err) {
            console.log(err);
            const error =
                new Error("Error! Something went wrong.");
            return null;
        }
        return token;
}