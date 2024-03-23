const admin = require('firebase-admin');

const firebaseConfig = {
	apiKey: "AIzaSyAaVinv-1Gxs7EoTy7snCloydWJD-WuIQs",
	authDomain: "distant-f615c.firebaseapp.com",
	projectId: "distant-f615c",
	storageBucket: "distant-f615c.appspot.com",
	messagingSenderId: "167267407866",
	appId: "1:167267407866:web:56f7a50fa5a7dbe24ff643",
	measurementId: "G-F1P7JTPJL5"
};

admin.initializeApp({
	credential: admin.credential.cert(firebaseConfig),
	databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`
});

const db = admin.firestore();

module.exports = db;
