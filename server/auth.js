const { OAuth2Client } = require("google-auth-library");
const User = require("./models/user");
const socketManager = require("./server-socket");

// test

// create a new OAuth client used to verify google sign-in
const CLIENT_ID =
  "375196652001-nhj4snbmqe02g5oi5gkhl0mcjghn8ctb.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

// accepts a login token from the frontend, and verifies that it's legit
function verify(token) {
  return client
    .verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    })
    .then((ticket) => ticket.getPayload());
}

// gets user from DB, or makes a new account if it doesn't exist yet
function getOrCreateUser(user) {
  // the "sub" field means "subject", which is a unique identifier for each user
  return User.findOne({ googleid: user.sub }).then((existingUser) => {
    if (existingUser) return existingUser;

    var date = new Date();
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0"); //January is 0
    const yyyy = date.getFullYear();
    date = dd + "/" + mm + "/" + yyyy;

    const newUser = new User({
      name: user.name,
      googleid: user.sub,
      datejoined: date,
    });

    return newUser.save();
  });
}

function login(req, res) {
  verify(req.body.token)
    .then((user) => getOrCreateUser(user))
    .then((user) => {
      // persist user in the session
      req.session.user = user;
      res.send(user);
    })
    .catch((err) => {
      console.log(`Failed to log in: ${err}`);
      res.status(401).send({ err });
    });
}

function logout(req, res) {
  req.session.user = null;
  res.send({});
}

function populateCurrentUser(req, res, next) {
  if (process.env.LOGIN == "false" && !req.session.user) {
    let _id = "";
    for (let i = 0; i < 24; ++i) {
      const digit = Math.floor(Math.random() * 16);
      if (digit < 10) _id += String.fromCharCode(48 + digit);
      else _id += String.fromCharCode(97 + digit - 10);
    }
    req.session.user = { name: "Guest", costume: 0, _id };
  }

  // simply populate "req.user" for convenience
  req.user = req.session.user;

  next();
}

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    return res.status(401).send({ err: "not logged in" });
  }

  next();
}

module.exports = {
  login,
  logout,
  populateCurrentUser,
  ensureLoggedIn,
};
