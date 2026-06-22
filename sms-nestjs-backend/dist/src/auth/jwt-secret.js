"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJwtSecret = getJwtSecret;
require("dotenv/config");
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is required');
    }
    return secret;
}
//# sourceMappingURL=jwt-secret.js.map