# Message.ly 

## Project Description

Message.ly is a user-to-user private messaging app.

This exercise is meant to teach and reinforce useful common patterns around authentication and authorization.

### Setup

- Installed requirements with `npm i` and made a github repository for submitting the project.
- Created ***messagely*** database and imported schema from ***data.sql***
- I also created the ***messagely_test*** database and imported the schema from ***data_test.sql***

### Step 1: Take a Tour

Many parts of this exercise are already given to you, and shouldn’t need to change:

- ***app.js***
    - Pulls in user routes, messages routes, and auth routes
- ***expressError.js***
    - Handle errors in express more gracefully
- ***db.js***
    - Sets up  database
        
        ***messagely***
        
- ***server.js***
    - Starts server on 3000

- ***config.js***
    
    This may be a new file for us. As you build the app (and, in particular, the further study), you may add to it.
    
    Its job is to be a centralized place for constants needed in different places in the application. Other places should ***require()*** in these values.
    
    In order to make it easier to keep secret things secret, it also will try to read a file named ***.env***. This is a traditional name for a file containing “environmental variables needed for an application”.
    
    If you create a file like this:
    
    *.env*
    
    `SECRET_KEY = abc123`
    
    This ***config.js*** file will read and use it.
    
- ***middleware/auth.js***
    
    Useful middleware for “is a user logged in?” and “is the logged-in user the same as the ***:username*** provided in a route?”
    
    **Look carefully at this code** — it may be slightly different than other versions you’ve seen. Make sure you understand what it is doing!

- ***src*** folder

I refactored the project by creating a `src` folder at the same hierarchical level as `__tests__` and `node_modules` and moved each folder and file into it.

Also, I moved the `expressError.js` file into the `middleware` folder.
Also, I created a `db` sub-folder and moved the `data.sql` and `db.js` files into it.

### Step 2: Fix the `user` model

We’ve provided a module file for the ***User*** class.

***models/user.js***
```
/** User class for message.ly */



/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) { }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { }
}

module.exports = User;
```

Fill in the method bodies.

Make sure you read the docstrings carefully so your functions return the right output. Also, any method that tries to act on a particular user (like the ***.get()*** method) should throw an error if the user cannot be found.

If you get stuck, note that the ***Message*** class has been completed for you. You can look to the methods there for some inspiration or assistance with some of the more complex queries.

Once you have finished, you can run the tests we’ve provided for the ***User*** and ***Message*** models (make sure to create and seed the ***messagely_test*** database first!).

```
$jest -i
```

### Step 3: Fix the routes

We’ve provided stub files and docstrings from the routes.

***routes/auth.js***
```
/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
```


In order, implement these routes. Make sure to check security appropriately:

- anyone can login or register
- any logged-in user can see the list of users
- only that user can view their get-user-detail route, or their from-messages or to-messages routes.
- only the sender or recipient of a message can view the message-detail route
- only the recipient of a message can mark it as read
- any logged in user can send a message to any other user