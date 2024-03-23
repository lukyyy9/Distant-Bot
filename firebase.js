const admin = require('firebase-admin');

const serviceAccount = {
	"type": "service_account",
	"project_id": "distant-f615c",
	"private_key_id": "deaef18e773ecbaf7d657ef9f4fad297badd511f",
	"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDFJ8ckHacNCCRG\nrhgZpvL4YgOnPvzu+WyPQ1uTTums25fT1q7gbExJgMZpn79qPIb8xOCvc9qyvM4H\nyVQo3M5Q3DdMwCu0diAfk+v6iDVo8faPodzENqt9nnuolHu5fWkWZWD3DVFk03as\nyOVIzqjsqZJavV8dOiLDQuWGBglopjGhqGkX5iTyJC5JFkK/Y0c2/C+k646jD9jZ\n3rFB8FF7BAzIz5raStlsk5nQ6Q+E46KY4XI4zU55R3jLEDQ4vjOHo+tcYWOR3Mxu\nwGQ3y7KKjIEKm+AaIiJfG2waYOZyk7lzpKcrkOORIuBCiROKSJfd130wl4kAMdnj\nP5t4Q+vzAgMBAAECggEAEistw2rGI8HN0gOmLesANhqWOpnn5j/vHK646DTb/PWJ\notiEaiMgzp9C6aXylmA4kl+0UwbqrxEOLZKEonViv/njULve6zT9ldtkYkSeI2s0\n7RyeAykEmcF6pNj2I+xmPE2gZ3P/PbrtE1Q6KQD+eTzRQ3JzKvbaEEOAcl7pDA8n\nUhR8SovHKJV1oTXMXlcWNWg09tc7gSkrNRVaJraMTe1GPCXFS91KkwMwM2JkNow3\nV6PQeUEwlyFHgufkUbWT+Ri/x6kyzIfLmpb+lajmnkKwSOBm7fTiKJEhIG872Yqr\ny8unRD/8idD9uFMSO9jnVQ0g4/JUkRHj93X89gJtmQKBgQDon2Rxreort1CdhVAY\nx83c9PBJeI3uhyR+qZPDeLhZjTXlm1TPUp3qtqZO9l91aqByJcNAIfvX+hXwwl7R\nKz/dUi1ktPXUVEl+JNjJ+9ViDUxbFj4Zu0uCZEt6AW/CdVrzgmCeqEPmGluxaukj\nFxnIlJ9SP411bfjtgAZMi44ZiQKBgQDY9+5ewPCFLaj6YzJrJ0WIlisUpjjGpNhe\nRLMmacDWW+dd50OsHXLM6jNvUzt6OsxGhL6bVawP+AZf8tig2Xz+aqvVafrv9Zjl\nMYcUF5KxFXOVbmRwHh7TzPqknDN8gQZx3jb0PAlTxgU8pbN0zwfuwr8RnJ11JtXM\nZCiGr4dGmwKBgDDKjdTSN5Wnw37moWAxOFqp/WRLpulq6xquEtIjFfeiiLV6GRXL\nLFg4qzVQs8D69mA6z3M6LYqlZ8ix3BVfTuvq+p5u3kkEzM1qiRYEfkMsquFIDwpy\noGnfA325o2lUGBmPNRjSDjvLN4RE+lVj2QKbObeUoOUKhfW6rpeLheiRAoGATrC1\nImaFlTe3NoCts5E9tckI/OdAZkM5Og9ejksCpnwUkMkkkRLpJQq39uNQCgezOMxC\nOSI8UlpZLYltKgFXRQq5IaDbYxZHCrEI1a+rA1DNZ9/uy38RHS4VpYgFYF2HUdsP\nQUtY8qo6EgHi8TV5Ig49sAyGSwv3tLaKwDZ/MIsCgYAvw087k+bnxtrVQiDVzTBF\niFIHgMQ1iXJy9TgJq+h3CVqZcq40bTEJ+3S10PNQRngiMtIedp2WonNpxh9FE75Y\n70feyyli87nKhwk69O1gpVEbG637sS/dIb7t37JBGhx+/4d2GmMKirthC24nyZtZ\nKRHij65F+AWRC8eFAY+s1Q==\n-----END PRIVATE KEY-----\n",
	"client_email": "firebase-adminsdk-7a23a@distant-f615c.iam.gserviceaccount.com",
	"client_id": "104022723173326571042",
	"auth_uri": "https://accounts.google.com/o/oauth2/auth",
	"token_uri": "https://oauth2.googleapis.com/token",
	"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
	"client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-7a23a%40distant-f615c.iam.gserviceaccount.com",
	"universe_domain": "googleapis.com"
};

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

module.exports = db;
