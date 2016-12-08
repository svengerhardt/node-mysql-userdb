# mysql-userdb

User database management with MySQL.

## Configuration

```js
let config = {
    "pooling": true,
    "connection": {
        "host": "HOSTNAME",
        "user": "USERNAME",
        "password": "PASSWORD",
        "database": "DATABASE",
    },
    "tables": {
        "users": {
            "name": "users",
            "mapping": {
                "id": "id",
                "userName": "userName",
                "familyName": "name.familyName",
                "givenName": "name.givenName",
                "nickName": "nickName",
                "organization": "organization",
                "active": "active",
                "created": "meta.created",
                "lastModified": "meta.lastModified"
            }
        },
        "user_emails": {
            "name": "user_emails",
            "mapping": {
                "id": "id",
                "value": "value",
                "primary_value": "primary"
            }
        },
        "user_groups": {
            "name": "user_groups",
            "mapping": {
                "id": "id",
                "name": "display"
            }
        },
        "user_groups_relation": {
            "name": "user_groups_relation"
        }  
    }
}
```

For more `connection` options see: [connection-options](https://github.com/mysqljs/mysql#connection-options)

## User Management

### Example Usage

```js
let co = require("co");

let Database = require("mysql-userdb");
let db = new Database(config);

co(function *() {

    let result;
    
    yield db.beginTransaction();
    let bob = yield db.users().create({"userName": "Bob", "familyName": "Schmidt"});
    let tom = yield db.users().create({"userName": "Tom", "familyName": "Schmidt"});
    yield db.endTransaction();
    
    result = yield db.users().update(bob.insertId, {"userName": "Bobby"});
    result = yield db.users().all({
        "attributes": ["id", "userName", "familyName"],
        "filter": "familyName = 'Schmidt'",
        "sortBy": "userName",
        "sortOrder": "desc",
        "startIndex": 0,
        "count": 2
    });

    console.log(result);
    
}).catch((error) => {
    // error
});
```

### users().all(opts)

Returns all users.

**Optionals**

* `opts.attributes` - List of strings indicating the names of attributes to return in the response.
* `opts.filter` - Filter expression. Attribute names used in filters are case insensitive.
* `opts.sortBy` - Specifies the attribute whose value shall be used to order the returned responses.
* `opts.sortOrder` - The order in which the "sortBy" parameter is applied (desc or asc).
* `opts.startIndex` - An integer indicating the 1-based index of the first query result.
* `opts.count` - An integer indicating the desired maximum number of query results per page.

**Example**

```js
db.users().all();
db.users().all({
    "attributes": ["id", "userName", "familyName"],
    "filter": "familyName = 'Schmidt'",
    "sortBy": "userName",
    "sortOrder": "desc",
    "startIndex": 0,
    "count": 25
});
```

---

### users().getById(id, opts)

Returns a user specified by user ID.

**Arguments**

* `id` - User ID.

**Optionals**

* `opts.attributes` - List of strings indicating the names of attributes to return in the response.

**Example**

```js
db.users().getById(4);
db.users().getById(4, {"attributes": ["id", "userName"]});
```

---

### users().count(opts);

Returns the amount of all users.

**Optionals**

* `opts.filter` - Filter expression. Attribute names used in filters are case insensitive.

**Example**

```js
db.users().count({"filter": "familyName = 'Schmidt'"});
```

---

### users().create(object);

Creates a new user.

**Arguments**

* `object` - User object containing the user's data.

**Example**

```js
db.users().create({"userName": "bob", "familyName": "Schmidt"});
```

---

### users().update(id, object);

Updates an existing user. 

**Arguments**

* `id` - User ID.
* `object` - User object containing the user's data to update.

**Example**

```js
db.users().update(4, {"userName": "Bobby"});
```

---

### users().remove(id);

Removes a user specified by user ID.

**Arguments**

* `id` - User ID.

**Example**

```js
db.users().remove(4);
```

## User Email Management

### Example Usage

```js
let co = require("co");

let Database = require("mysql-userdb");
let db = new Database(config);

co(function *() {

    let result = null;
    
    let bob = yield db.users().create({"userName": "bob"});
    result = yield db.emails(bob.insertId).create({"value": "bob@example.com"});
    
    result = yield db.emails().all();
    console.log(result);
    
}).catch((error) => {
    // error
});
```

### emails().all(opts)

Returns all emails.

**Optionals**

* `opts.attributes` - List of strings indicating the names of attributes to return in the response.
* `opts.filter` - Filter expression. Attribute names used in filters are case insensitive.
* `opts.sortBy` - Specifies the attribute whose value shall be used to order the returned responses.
* `opts.sortOrder` - The order in which the "sortBy" parameter is applied (desc or asc).
* `opts.startIndex` - An integer indicating the 1-based index of the first query result.
* `opts.count` - An integer indicating the desired maximum number of query results per page.

**Example**

```js
db.emails().all();
db.emails().all({
    "attributes": ["id", "value"],
    "filter": "value LIKE 'bob%'",
    "sortBy": "value",
    "sortOrder": "desc",
    "startIndex": 0,
    "count": 25
});
```

---

### emails().getById(id, opts)

Returns an email specified by email ID.

**Arguments**

* `id` - Email ID.

**Optionals**

* `opts.attributes` - List of strings indicating the names of attributes to return in the response.

**Example**

```js
db.emails().getById(4);
db.emails().getById(4, {"attributes": ["id", "value"]});
```

---

### emails().count(opts);

Returns the amount of all emails.

**Optionals**

* `opts.filter` - Filter expression. Attribute names used in filters are case insensitive.

**Example**

```js
db.emails().count({"filter": "value LIKE 'bob%'"});
```

---

### emails().create(object);

Creates a new email.

**Arguments**

* `object` - Email object containing the email's data.

**Example**

```js
db.emails().create({"value": "bob@example.com", "primary_value": true, "user_id": 4});
```

---

### emails().update(id, object);

Updates an existing email.

**Arguments**

* `id` - Email ID.
* `object` - Email object containing the email's data to update.

**Example**

```js
db.emails().update(4, {"value": "bobby@example.com"});
```

---

### emails().remove(id);

Removes an email specified by email ID.

**Arguments**

* `id` - Email ID.

**Example**

```js
db.emails().remove(4);
```

---

### emails(userId).all(opts);

Returns all user emails specified by user ID.

**Arguments**

* `userId` - User ID.

**Optionals**

* `opts.attributes` - List of strings indicating the names of attributes to return in the response.
* `opts.filter` - Filter expression. Attribute names used in filters are case insensitive.
* `opts.sortBy` - Specifies the attribute whose value shall be used to order the returned responses.
* `opts.sortOrder` - The order in which the "sortBy" parameter is applied (desc or asc).
* `opts.startIndex` - An integer indicating the 1-based index of the first query result.
* `opts.count` - An integer indicating the desired maximum number of query results per page.

**Example**

```js
db.emails(6).all();
db.emails(6).all({
    "attributes": ["id", "value"],
    "filter": "value LIKE 'bob%'",
    "sortBy": "value",
    "sortOrder": "desc",
    "startIndex": 0,
    "count": 25
});
```
---

### emails(userId).count();

Returns the amount of user emails specified by user ID.

**Arguments**

* `userId` - User ID.

**Example**

```js
db.emails(6).count();
```

---

### emails(userId).create(object);

Creates a new user email specified by user ID.

**Arguments**

* `userId` - User ID.
* `object` - Email object containing the email's data.

**Example**

```js
db.emails(6).create({"value": "bob@example.com", "primary_value": true});
```

---

### emails(userId).update(object, filter);

Updates a user email specified by user ID.

**Arguments**

* `userId` - User ID.
* `object` - Email object containing the email's data to update.
* `filter` - Filter expression. Attribute names used in filters are case insensitive.

**Example**

```js
db.emails(6).update({"value": "bobby@example.com"}, {filter: "value = 'bob@example.com'"});
```

---

### emails(userId).remove(opts);

Removes a user email specified by user ID.

**Arguments**

* `userId` - User ID.

**Optionals**

* `opts.filter` - Filter expression. Attribute names used in filters are case insensitive.

**Example**

```js
db.emails(6).remove(); // will remove all entries with user id 4
db.emails(6).remove({filter: "value = 'bobby@example.com'"});
```

---

## Group Management

### Example Usage

```js
let co = require("co");

let Database = require("mysql-userdb");
let db = new Database(config);

co(function *() {

    let result = null;
    
    let bob = yield db.users().create({"userName": "bob"});
    let stats = yield db.groups().create({name: "Stats"});
    
    result = yield db.groups(bob.insertId).assign(stats.insertId);
    result = yield db.groups().all();
    
    console.log(result);
    
}).catch((error) => {
    // error
});
```

### groups().all(opts)

Returns all groups.

**Optionals**

* `opts.attributes` - List of strings indicating the names of attributes to return in the response.
* `opts.filter` - Filter expression. Attribute names used in filters are case insensitive.
* `opts.sortBy` - Specifies the attribute whose value shall be used to order the returned responses.
* `opts.sortOrder` - The order in which the "sortBy" parameter is applied (desc or asc).
* `opts.startIndex` - An integer indicating the 1-based index of the first query result.
* `opts.count` - An integer indicating the desired maximum number of query results per page.

**Example**

```js
db.groups().all();
db.groups().all({
    "attributes": ["id", "name"],
    "filter": "name LIKE 'log%'",
    "sortBy": "name",
    "sortOrder": "desc",
    "startIndex": 0,
    "count": 25
});
```

### groups().getById(id, opts)

Returns a group specifid by group ID.

**Arguments**

* `id` - Group ID.

**Optionals**

* `opts.attributes` - List of strings indicating the names of attributes to return in the response.

**Example**

```js
db.groups().getById(2);
db.groups().getById(2, {"attributes": ["id", "name"]});
```

---

### groups().count(opts);

Returns the amount of all groups.

**Optionals**

* `opts.filter` - Filter expression. Attribute names used in filters are case insensitive.

**Example**

```js
db.groups().count();
db.groups().count({"filter": "name LIKE 'Log%'"});
```

---

### groups().create(object);

Creates a new group.

**Arguments**

* `object` - Group object containing the group's data.

**Example**

```js
db.groups().create({"name": "Stats"});
```

---

### groups().update(id, object);

Updates a groups specified by group ID.

**Arguments**

* `id` - Group ID.
* `object` - Group object containing the group's data to update.

**Example**

```js
db.groups().update(4, {"name": "Stat"});
```

---

### groups().remove(id);

Removes an existing group.

**Arguments**

* `id` - Group ID.

**Example**

```js
db.groups().remove(4);
```

---

### groups().getUsers(id, opts);

Returns all users assigned to the specified group ID.

**Arguments**

* `id` - Group ID.

**Optionals**

* `opts.attributes` - List of strings indicating the names of attributes to return in the response.
* `opts.filter` - Filter expression. Attribute names used in filters are case insensitive.
* `opts.sortBy` - Specifies the attribute whose value shall be used to order the returned responses.
* `opts.sortOrder` - The order in which the "sortBy" parameter is applied (desc or asc).
* `opts.startIndex` - An integer indicating the 1-based index of the first query result.
* `opts.count` - An integer indicating the desired maximum number of query results per page.

**Example**

```js
db.groups().getUsers(4);
db.groups().getUsers(4, {
    "attributes": ["id", "userName", "familyName"],
    "filter": "familyName = 'Schmidt'",
    "sortBy": "userName",
    "sortOrder": "desc",
    "startIndex": 0,
    "count": 2
});
```


---

### groups().countUsers(id, opts);

Returns the amout of users assigned to the specified group ID.

**Arguments**

* `id` - Group ID.

**Optionals**

* `opts.filter` - Filter expression. Attribute names used in filters are case insensitive.

**Example**

```js
db.groups().countUsers(4);
db.groups().countUsers(4, {"filter": "familyName = 'Schmidt'"});
```

### groups(userId).all(opts)

Returns all user groups specified by user ID.

**Arguments**

* `userId` - User ID.

**Optionals**

* `opts.attributes` - List of strings indicating the names of attributes to return in the response.
* `opts.filter` - Filter expression. Attribute names used in filters are case insensitive.
* `opts.sortBy` - Specifies the attribute whose value shall be used to order the returned responses.
* `opts.sortOrder` - The order in which the "sortBy" parameter is applied (desc or asc).
* `opts.startIndex` - An integer indicating the 1-based index of the first query result.
* `opts.count` - An integer indicating the desired maximum number of query results per page.

**Example**

```js
db.groups(2).all();
db.groups(2).all({
    "attributes": ["id", "name"],
    "filter": "name LIKE 'Log%'",
    "sortBy": "name",
    "sortOrder": "desc",
    "startIndex": 0,
    "count": 5
});
```

---

### groups(userId).count();

Returns the amount of all user groups specified by user ID.

**Arguments**

* `userId` - User ID.

**Example**

```js
db.groups(2).count();
```

---

### groups(userId).assign(groupId);

Assigns a user to a group.

**Arguments**

* `userId` - User ID.
* `groupId` - Group ID.

**Example**

```js
db.groups(2).assign(1);
```

---

### groups(userId).revoke(groupId);

Revokes a user from a group.

**Arguments**

* `userId` - User ID.
* `groupId` - Group ID.

**Example**

```js
db.groups(2).revoke(1);
```

---

## Password Management

### Example Usage

```js
let co = require("co");

let PBKDF2 = require("mysql-userdb").PBKDF2;
let pwd = new PBKDF2();

co(function *() {

    let pbkdf2Password = yield pwd.generate("hackme");
    let result = yield pwd.verify("hackme", pbkdf2Password);
    
    console.log(result);
    
}).catch((error) => {
    // error
});
```

### Configuration

```js
let pbkdf2Config = {
    "saltLen": 12,
    "iterations": 901,
    "keyLen": 24,
    "algorithm": "sha256"
}

let PBKDF2 = require("mysql-userdb").PBKDF2;
let pwd = new PBKDF2(pbkdf2Config);
```

### generate(plainPassword);

Generates a PBKDF2 password.

**Arguments**

* `plainPassword` - Plain password.

**Example**

```js
pwd.generate("hackme");
```

---

### verify(plainPassword, pbkdf2Password);

Verifies a password.

**Arguments**

* `plainPassword` - Plain password.
* `pbkdf2Password` - pbkdf2 password.

**Example**

```js
pwd.verify("hackme", "PBKDF2$sha256$901$0VA61ZYk7IrNyljA$4kK7oo...");
```
