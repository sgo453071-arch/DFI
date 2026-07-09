const jwt = require('jsonwebtoken');

/**
 * Generate a JWT Access Token.
 * @param {object} payload - The payload to encode.
 * @returns {string} The JWT access token.
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
};

/**
 * Generate a JWT Refresh Token.
 * @param {object} payload - The payload to encode.
 * @returns {string} The JWT refresh token.
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d', // 30-day sliding window
  });
};

/**
 * Verify a JWT Access Token.
 * @param {string} token - The access token to verify.
 * @returns {object} The decoded payload.
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Verify a JWT Refresh Token.
 * @param {string} token - The refresh token to verify.
 * @returns {object} The decoded payload.
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Decode a JWT token without verifying the signature.
 * @param {string} token - The token to decode.
 * @returns {object|null} The decoded token payload.
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
};
