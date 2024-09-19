'use strict';

class UserClass {


    constructor() {
        this.username = 'TEST';
        this.password = 'TEST';
    }

    login = async (username,password) => {

        if(username == null || password == null)
            return false;

        if(username == this.username && password == this.password)
            return true;
        else
            return false;
    }

    exist = async (username) => {
        if(username == null)
            return false;

        if(username == this.username)
            return true;
        else
            return false;
    }

    register = async (username,password) => {
        if(username == null || password == null)
            return false;

        this.username = username;
        this.password = password;
        return true;
    }
}

module.exports = UserClass;
