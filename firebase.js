const admin = require('firebase-admin');

const serviceAccount = {
	"type": "service_account",
	"project_id": "distant-f615c",
	"private_key_id": "5d50949606e87a36fe8c97c75468ed1149319ceb",
	"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCdw36q7gbgUeg4\nJ8YV68wB4trYQono6XGt62VZlUNW0rQbp5mb12jA7IvrjONbtoDvQM4uQaqblRTR\n+7byVO9fguJk3LLRE0LpSX/tN/z4ZJIBsAf0a/cuHSCmqlfvZv8tGQEpNpUPwo7m\nfICF3UX1zhjsGbqj+tFci+rE/Nw802qc/V9MqtbQanVFlUUyp+6CGJQyp7ZvmtoT\nP81GMW1q6CnxNfyZtZQ6yV7xRLP4HJWxzmwYWb62eoMmTM4EBhczwxnfZ9u5S/Od\nvgCBTQQDILDuamaJMgIDekwdRWjPV4ZsqW/2v1nzH3La1d0B7H/1mLX0hDwyPc2p\nlgUpz5V9AgMBAAECggEAAIW+LIOXXYVby4WMYOj2dSmLnVhRFW90Tm2S+8j/DSLh\ns2lwxyaVuyzPnv+1k3qvH3q8QKlQrKBiC7ohURcKVp3ZVhFKlhRDrda6Q45hPIGa\nP2hYOPwkySrG7hHWES+eo95noH5bc1VrkZKgELwV4ETim4aO1O9ns7AvJj3mACRy\n04Hqz/doLwXlCmuhHIxMqFDCNjQSnSLgYy+ZKF3r+BQGMVsznDnBWmIIrb7nKlX4\nOd9ftfa7frPqWseyAT5VX/PD/jxb+s663jby0G2+Jrz92Vyi0F6JBzkhXpyF/dRb\nGg9Xa6m/bfSBnAKhN/ib4Ky6BHl/62bnhbdyRoStvwKBgQDOP3wo393nvrYOS2b+\n9LlL8h1UXqIIa8J3BL8CvMatiiBdeXptqYb8fUPS5aMQwJ+kEQnK8aWiWaNodcmO\nnISGyknYZEI1qATXneS87MOH2bMB7u0HzrdP1VMX74tb5vbgVgam7XQczs/640ok\nTOUuueArjdBA1tALEffL8LYVGwKBgQDD0e/iGkfSLKdDI/mBvqjl9IktvQMsOoE/\nk9lTUIfHAlvl+1PUe448sIZQeWKwLbgnbP4fVP6ukh3gk2SfpgSspCgBm+cb2OGF\n/T3DThsTU34c17SLK9HqaYRvxz2sXHFmHugBN1ZmtlncH3cEak935YYZHToMoXnu\nZejnf3nhRwKBgGKBdcZ77ZtSvdcj8kRRE/MO5y01qYQGG7IGpUgka2vVLdIXQ/7+\nWgdbuLoQjYphxZ1xudChC2/4ChDJOQQRA0bxdMWSVQEVh4KH2gjVuCm5M0L4H2N8\nOpc5lt82vMOfE0hgLfsqLCvaJwF37yBZTZi8lDGZIN7m+iRfZ4+THxQDAoGAIZA9\nPpLkloiizqY+4NcuGeQVEyrffVg1yRDtYhNegmTMHZo7XyMiWRKkoux7VtkvREqx\nL+ugj4lp55E74QVSrcihNs1jCmndFds3F9+uUlywM/9g6a3EGBqn4YTT9FQP98H6\nYCL9AzPkKQ+XlcEnB9TmbC2PQpT20j7TccJuwIcCgYA+mcOIpZPGgI4ntCMKyyY9\nyPoK6vJlPfE1uBxJrZyLnxiyAshiPLlvuVKzhjvR6v1iCg5PJtW4IM2yQkawdeio\nAEHennKe2YAHs9MaXOk3rj0p6dBBHHxj98e7KoN5bXb97gu1sUfHl2NzRkH6xs8u\na0sAJksbgoSs+CZfWqrWWg==\n-----END PRIVATE KEY-----\n",
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