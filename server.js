const express = require("express");
require("dotenv").config();
const jwt = require("express-jwt"); // for validates jwt and set req.user
const jwksRsa = require("jwks-rsa"); // retrieves RSA keys from a public JSON Web Key set (that auth0 exposes under our domain) JWKS endpoint
const checkScope = require("express-jwt-authz"); // validates jwt scopes

// validates that the info inside the jwt is valid and ensures that it was generated by auth0 -> uses the public signing key that auth0 exposes for our domain
// validating a jwt: 2 steps -> #verify signature #validate claims  
var checkJwt = jwt({
  // dinamically provide a signing key based on the kid in the header
  // and the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: 'https://reaucth2-dev.us.auth0.com/.well-known/jwks.json'
}),
// validates the audience and the issuer
audience: 'http://localhost:3001',
issuer: 'https://reaucth2-dev.us.auth0.com/',
// this must match the algorithm selected in the auth0 dashboard (app's advanced settings)
algorithms: ['RS256']
});

const app = express();

app.get('/public', (req, res) => {
  res.json({
    message: "Hello from a PUBLIC API endpoint"
  });
});

app.get('/private', checkJwt, (req, res) => {
  res.json({
    message: "Hello from a PRIVATE API endpoint"
  });
});

app.get('/courses', checkJwt, checkScope(["read:courses"]), (req, res) => {
  res.json({
    courses: [
      { id: 1, title: "Modern React with Redux" },
      { id: 2, title: "Typescript for the win" }
    ]
  });
});

function checkRole(role) {
  return function(req, res, next) {
    const assignedRoles = req.user["http://localhost:3000/roles"];
    if (Array.isArray(assignedRoles) && assignedRoles.includes(role)) {
      return next();
    } else {
      return res.status(401).send("Insufficient role");
    }
  };
}

// admin only enpoint
app.get('/admin', checkJwt, checkRole('admin'), (req, res) => {
  res.json({
    message: "Hello from an ADMIN API endpoint"
  });
});

app.listen(3001, () => {
  console.log("API server listening on", process.env.REACT_APP_API_URL);
});