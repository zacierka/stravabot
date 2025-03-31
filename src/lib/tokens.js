
const jwt = require("jsonwebtoken");
const { pool } = require("./database");

async function createJWT(user) {
    let token;
        try {
            //Creating jwt token
            token = jwt.sign(
                {
                    discord_name: user.discordname,
                    strava_name: user.stravaname,
                    id: user.id // strava id
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

function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).send('Unauthorized: No token provided');
    }

    jwt.verify(token, process.env.AUTH_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send('Forbidden: Invalid token');
        }
        req.user = user; // Attach decoded user info to request
        next();
    });
}

function refreshAccessToken(athlete_id) {
    pool.query
}

module.exports = { 
    createJWT,
    authenticateToken
}