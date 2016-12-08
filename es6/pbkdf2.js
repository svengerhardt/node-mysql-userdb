let crypto = require("crypto");
let ErrorHandling = require("./index").ErrorHandling;

class PBKDF2 {

    constructor(config) {
        let conf = config || {};
        this.saltLen = conf.saltLen || 12;
        this.iterations = conf.iterations || 901;
        this.keyLen = conf.keyLen || 24;
        this.algorithm = conf.algorithm || "sha256";
        this.separator = '$';
        this.tag = 'PBKDF2';
    }

    generate(plainPassword) {
        return new Promise((resolve, reject) => {
            try {
                let salt = crypto.randomBytes(this.saltLen).toString('base64');
                let hash = PBKDF2._pbkdf2Sync(plainPassword, salt, this.iterations, this.keyLen, this.algorithm);
                resolve(this._pbkdf2Password(salt, hash));
            } catch (error) {
                reject(ErrorHandling.toError(error));
            }
        });
    }

    verify(plainPassword, pbkdf2Password) {
        return new Promise((resolve, reject) => {
            try {
                let fields = pbkdf2Password.split(this.separator);
                let algorithm = fields[1];
                let iterations = Number(fields[2]);
                let salt = fields[3];
                let hash = PBKDF2._pbkdf2Sync(plainPassword, salt, iterations, this.keyLen, algorithm);
                if (this._pbkdf2Password(salt, hash) === pbkdf2Password) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (error) {
                reject(ErrorHandling.toError(error));
            }
        });
    }

    static _pbkdf2Sync(plainPassword, salt, iterations, keyLen, algorithm) {
        return crypto.pbkdf2Sync(plainPassword, salt, iterations, keyLen, algorithm).toString('base64');
    }

    _pbkdf2Password(salt, hash) {
        return this.tag +
            this.separator +
            this.algorithm +
            this.separator +
            this.iterations +
            this.separator +
            salt +
            this.separator +
            hash;
    }
}

module.exports = PBKDF2;