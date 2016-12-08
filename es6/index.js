let Utils = require("./utils");
let ErrorConstants = require('./errors');
let ObjectMapper = require("object-mapper");
let MySQLWrapper = require("mysqlw");

class UserDatabase extends MySQLWrapper {

    constructor(config) {
        super(config);
        this._users = null;
        this._groups = null;
        this._types = null;
        this._emails = null;
    }

    _count(opts = {}, tableName) {
        let filter = Utils.buildQueryFilter(opts);
        return this.query("SELECT COUNT(*) AS value FROM " + tableName + filter);
    }

    _all(opts = {}, tableName, mapping) {
        let attributes = Utils.buildQueryAttributes(opts);
        let filter = Utils.buildQueryFilter(opts);
        let sortBy = Utils.buildQuerySortBy(opts);
        let limit = Utils.buildQueryLimit(opts);
        return this.query("SELECT " + attributes + " FROM " + tableName + filter + sortBy + limit).then((rows) => {
            return this.formatRows(rows, mapping);
        });
    }

    _get(id, opts = {}, tableName, mapping) {
        if (id) {
            let attributes = Utils.buildQueryAttributes(opts);
            return this.query("SELECT " + attributes + " FROM " + tableName + " WHERE id=?", +[id]).then((rows) => {
                return this.formatFirstRow(rows, mapping);
            });
        } else {
            return Promise.reject(ErrorHandling.toError({errno: 3, message: "Get: Missing argument 'id'"}));
        }
    }

    _add(object, tableName) {
        if (object) {
            return this.query("INSERT INTO " + tableName + " SET ?", [object]);
        } else {
            return Promise.reject(ErrorHandling.toError({errno: 3, message: "Create: Missing argument 'object'"}));
        }
    }

    _update(id, object, tableName) {
        if (id && object) {
            return this.query("UPDATE " + tableName + " SET ? WHERE id=?", [object, id]);
        } else {
            return Promise.reject(ErrorHandling.toError({errno: 3, message: "Update: Missing argument 'id' and/or 'object'"}));
        }
    }

    _del(id, tableName) {
        if (id) {
            return this.query("DELETE FROM " + tableName + " WHERE id=?", [id]);
        } else {
            return Promise.reject(ErrorHandling.toError({errno: 3, message: "Remove: Missing argument 'id'"}));
        }
    }

    //

    users() {
        if (!this._users) {
            this._users = new Relation(this,
                this.config.tables.users.mapping,
                this.config.tables.users.name);
        }
        return this._users;
    }

    types() {
        if (!this._types) {
            this._types = new Relation(this,
                this.config.tables.types.mapping,
                this.config.tables.types.name);
        }
        return this._types;
    }

    // MULTI VALUES ATTRIBUTES

    groups(userId) {
        if (userId) {
            return new ManyToManyRelation(this, userId, this.config.tables.user_groups.mapping,
                this.config.tables.user_groups.name, this.config.tables.user_groups_relation.name)
        } else {
            if (!this._groups) {
                this._groups = new RelationExtended(this,
                    this.config.tables.user_groups.mapping,
                    this.config.tables.users.mapping,
                    this.config.tables.users.name,
                    this.config.tables.user_groups.name,
                    this.config.tables.user_groups_relation.name);
            }
            return this._groups;
        }
    }

    emails(userId) {
        if (userId) {
            return new OneToManyRelation(this, userId, this.config.tables.user_emails.mapping,
                this.config.tables.user_emails.name)
        } else {
            if (!this._emails) {
                this._emails = new Relation(this, this.config.tables.user_emails.mapping,
                    this.config.tables.user_emails.name);
            }
            return this._emails;
        }
    }

    // OUTPUT FORMAT

    formatRows(rows, mapping) {
        return new Promise((resolve, reject) => {
            if (mapping) {
                let data = [];
                let len = rows.length;
                try {
                    for (let i = 0; i < len; ++i) {
                        data.push(ObjectMapper(rows[i], mapping));
                    }
                    resolve(data);
                } catch (error) {
                    reject(ErrorHandling.toError(error));
                }
            } else {
                resolve(rows);
            }
        });
    }

    formatFirstRow(rows, mapping) {
        return new Promise((resolve, reject) => {
            let len = rows.length;
            if (len == 0) {
                resolve({});
            } else {
                try {
                    if (mapping) {
                        resolve(ObjectMapper(rows[0], mapping));
                    } else {
                        resolve(rows[0]);
                    }
                } catch (error) {
                    reject(ErrorHandling.toError(error));
                }
            }
        });
    }
}

// RELATION

class Relation {

    constructor(database, mapping, tableName) {
        this.database = database;
        this.mapping = mapping;
        this.tableName = tableName;
    }

    count(opts = {}) {
        return this.database._count(opts, this.tableName);
    }

    all(opts = {}) {
        return this.database._all(opts, this.tableName, this.mapping);
    }

    getById(id, opts = {}) {
        return this.database._get(id, opts, this.tableName, this.mapping);
    }

    create(object) {
        return this.database._add(object, this.tableName);
    }

    update(id, object) {
        return this.database._update(id, object, this.tableName);
    }

    remove(id) {
        return this.database._del(id, this.tableName);
    }
}

class RelationExtended extends Relation {

    constructor(database, mapping, userMapping, userTableName, tableName, tableRelationName) {
        super(database, mapping, tableName);
        this.userMapping = userMapping;
        this.userTableName = userTableName;
        this.tableRelationName = tableRelationName;
    }

    getUsers(id, opts = {}) {
        if (id) {
            let attributes = Utils.buildQueryAttributes(opts, "users.");
            let filter = Utils.buildQueryFilter(opts, true);
            let sortBy = Utils.buildQuerySortBy(opts);
            let limit = Utils.buildQueryLimit(opts);
            return this.database.query("SELECT " + attributes + " FROM " + this.userTableName + " users INNER JOIN " +
                this.tableRelationName + " ug ON user_id = users.id WHERE ug.rel_id=?" + filter + sortBy + limit, [id]).then((rows) => {
                return this.database.formatRows(rows, this.userMapping);
            });
        } else {
            return Promise.reject(ErrorHandling.toError({errno: 3, message: "GetUsers: Missing argument 'id'"}));
        }
    }

    countUsers(id, opts = {}) {
        if (id) {
            let filter = Utils.buildQueryFilter(opts, true);
            return this.database.query("SELECT COUNT(*) AS value FROM " + this.userTableName + " users INNER JOIN " +
                this.tableRelationName + " ug ON user_id = users.id WHERE ug.rel_id=?" + filter, [id]);
        } else {
            return Promise.reject(ErrorHandling.toError({errno: 3, message: "CountUsers: Missing argument 'id'"}));
        }
    }
}

// ONE TO MANY RELATION

class OneToManyRelation {

    constructor(database, userId, mapping, tableName) {
        this.database = database;
        this.userId = userId;
        this.mapping = mapping;
        this.tableName = tableName;
    }

    all(opts = {}) {
        let attributes = Utils.buildQueryAttributes(opts);
        let filter = Utils.buildQueryFilter(opts, true);
        let sortBy = Utils.buildQuerySortBy(opts);
        let limit = Utils.buildQueryLimit(opts);
        return this.database.query("SELECT " + attributes + " FROM " + this.tableName + " WHERE user_id=?" + filter + sortBy + limit, [this.userId]).then((rows) => {
            return this.database.formatRows(rows, this.mapping);
        });
    }

    count() {
        return this.database._count({filter: "user_id = " + this.userId}, this.tableName);
    }

    create(object) {
        if (object) {
            object.user_id = this.userId;
            return this.database._add(object, this.tableName);
        } else {
            return Promise.reject(ErrorHandling.toError({errno: 3, message: "Create: Missing argument 'object'"}));
        }
    }

    update(object, filter) {
        if (object && filter) {
            object.user_id = this.userId;
            filter = Utils.buildQueryFilter(filter, true);
            return this.database.query("UPDATE " + this.tableName + " SET ? WHERE user_id=?" + filter, [object, this.userId]);
        } else {
            return Promise.reject(ErrorHandling.toError({errno: 3, message: "Update: Missing argument 'object'"}));
        }
    }

    remove(opts = {}) {
        let filter = Utils.buildQueryFilter(opts, true);
        return this.database.query("DELETE FROM " + this.tableName + " WHERE user_id=?" + filter, [this.userId]);
    }
}

// MANY TO MANY RELATION

class ManyToManyRelation {

    constructor(database, userId, mapping, tableName, tableRelationName) {
        this.database = database;
        this.userId = userId;
        this.mapping = mapping;
        this.tableName = tableName;
        this.tableRelationName = tableRelationName;
    }

    count() {
        return this.database._count({filter: "user_id = " + this.userId}, this.tableRelationName);
    }

    all(opts = {}) {
        let attributes = Utils.buildQueryAttributes(opts, "t.");
        let filter = Utils.buildQueryFilter(opts, true);
        let sortBy = Utils.buildQuerySortBy(opts);
        let limit = Utils.buildQueryLimit(opts);
        return this.database.query("SELECT " + attributes +" FROM " + this.tableName + " t INNER JOIN " +
            this.tableRelationName + " tr ON t.id = tr.rel_id WHERE tr.user_id=?" + filter + sortBy + limit, [this.userId]).then((rows) => {
            return this.database.formatRows(rows, this.mapping);
        });
    }

    assign(id) {
        return this.database._add({user_id: this.userId, rel_id: id}, this.tableRelationName);
    }

    revoke(id) {
        return this.database.query("DELETE FROM " + this.tableRelationName + " WHERE user_id=" + this.userId + " AND rel_id=" + id);
    }
}

// ERROR HANDLING

class ErrorHandling {

    static toError(obj) {

        let errno = obj.errno || 1;
        let message = obj.message || "";

        if (obj instanceof TypeError) {
            errno = 2;
        }

        let code = ErrorConstants[errno] || "UNKNOWN_CODE_PLEASE_REPORT";
        let error = new Error(code + ": " + message);
        error.errno = errno;
        error.code = code;
        return error;
    };
}

module.exports = UserDatabase;
module.exports.ErrorHandling = ErrorHandling;
module.exports.PBKDF2 = require("./pbkdf2");