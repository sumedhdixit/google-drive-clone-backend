<!-- Logo and Title -->
<h1 align="center">
    <img src="https://upload.wikimedia.org/wikipedia/commons/7/74/Googledrive_logo.svg" height=100>
    <br />
    Google Drive Clone Backend
    <br />
</h1>

---

<br />

> NOTE : Frontend For this app can be found at 👉 [sumedhdixit/google-drive-clone-frontend](https://github.com/sumedhdixit/google-drive-clone-frontend.git)

---

<br />

## Screenshots of Steps 👇🏽

<img src="https://drive.google.com/uc?id=1kwllBxalUqclJtHmqQ37Q4v2xxOo77V1">
<img src="https://drive.google.com/uc?id=17AMY-Ov0RcMt6KqDZ8aG--60HVLQSIk7">
<img src="https://drive.google.com/uc?id=1HiFE48MSXT8pZ2Ato4VSMBD6bwP-VH5C">
<img src="https://drive.google.com/uc?id=1-3GquLQJuc5Z2wIonNnncu5LB0R5rk0F">
<img src="https://drive.google.com/uc?id=11190nfs0atK0oKMEPpcNUn4iOjR6N4B9">
<img src="https://drive.google.com/uc?id=1tsg2h-SSGq8tCC0zctoNbWQmOmmNL7UD">
<img src="https://drive.google.com/uc?id=16SNqKQN0kamVrAd1cFOfD9g708fTVW8t">

## 📌How To Use

To clone and run this application, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
$ git clone https://github.com/sumedhdixit/google-drive-clone-frontend.git

# Go into the repository
$ cd google-drive-clone-backend

# Install dependencies
$ npm install

# Run the app
$ npm start
```

<br />

## 📌Environment Variables

You will need the following environment variables in your `.env` file

```python
DB_STRING=""
SECRET=""

COSMOSDB_USER =
COSMOSDB_PASSWORD = ""
COSMOSDB_DBNAME = ""
COSMOSDB_HOST= ""
COSMOSDB_PORT=""

AZURE_STORAGE_CONNECTION_STRING=""
AZURE_STORAGE_ACCESS_KEY=""
```

<br />

## 📌API Endpoints

- Auth

```json
POST  - /register

Request:
{
    username: 'username',
    email: 'email'
    password: 'password',
}

Response on success:
{
    "success": true,
}
```

```json
POST - /login

Request:
{
    username: 'username',
    password: 'password',
}

Response on success:
{
    "user": req.user.username,
    "email": req.user.email,
    "success": true,
}
```

```json
GET - /is-logged

Response on success:
{
    "user": req.user.username,
    "email": req.user.email,
    "success": true,
}
```

- Storage Routes

```json
GET - /listBlobs

Response on success:
{
    "success": true,
  "blob_list": blob_list
}
```

```json
POST - /uploadFile

Request:
{
  "filename": filename,
  "newFile": file
}

Response on success:
{
  "success": true,
  "msg": message
}
```

```json
POST - /getSASUrl

Request:
{
    "filename": filename
}

Response on success:
{
  "success": true,
  "url": sas_url
}
```

```json
POST - /setMetaData

Request:
{
    "metadata": metadata
}

Response on success:
{
  "success": true
}
```

```json
PATCH - /renameBlob

Request:
{
    "filename": filename,
    "metadata": metadata
}

Response on success:
{
  "success": true
}
```

```json
DELETE - /deleteBlob

Request:
{
    "filename": filename
}

Response on success:
{
  "success": true
}
```

<br />

## 📌Credits

This software uses the following open source packages:

- [Node.js](https://nodejs.org/)
- [Passport.js](http://www.passportjs.org/)
- [Azure SDK](https://github.com/Azure/azure-sdk-for-js)
