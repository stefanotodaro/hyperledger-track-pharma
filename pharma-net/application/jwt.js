'use strict';

const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// get config vars
dotenv.config();

// access config var
process.env.TOKEN_SECRET;

class JWTClass {


    constructor() {
        this.tokenSecret = process.env.TOKEN_SECRET;
        this.expiresIn = '1800s';
    }

    generateAccessToken = async (username) => {
        return jwt.sign(username, this.tokenSecret, { expiresIn: this.expiresIn });
    }

    authenticateToken = async (req, res, next) => {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
      
        if (token == null) return res.sendStatus(401)
      
        jwt.verify(token, process.env.TOKEN_SECRET as string, (err: any, user: any) => {
          console.log(err)
      
          if (err) return res.sendStatus(403)
      
          req.user = user
      
          next()
        })
    }
}

module.exports = JWTClass;
