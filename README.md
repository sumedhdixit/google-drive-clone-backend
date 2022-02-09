<!-- Logo and Title -->
<h1 align="center">
    <img src="https://upload.wikimedia.org/wikipedia/commons/7/74/Googledrive_logo.svg" height=100>
    <br />
    Cloud Storage Backend
    <br />
</h1>

---

<br />

> NOTE : Frontend For this app can be found at 👉 [sumedhdixit/google-drive-clone-frontend](https://github.com/sumedhdixit/google-drive-clone-frontend.git)

---

<br />

## 📌How To Use

To clone and run this application, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
$ git clone https://github.com/sumedhdixit/google-drive-clone-frontend.git

# Go into the repository
$ cd cloud-storage-backend

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
