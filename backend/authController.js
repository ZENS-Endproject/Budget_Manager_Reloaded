const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_REFRESH_SECRET } = process.env;

function refreshToken(req, res) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token is missing" });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid refresh token" });
        }

        const newAccessToken = jwt.sign({ userId: user.userId }, JWT_SECRET, {
            expiresIn: '1d',
        });

        return res.json({ accessToken: newAccessToken });
    });
}

module.exports = { refreshToken };
