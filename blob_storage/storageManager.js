const storage = require("@azure/storage-blob");
const connection = require('../db/database');
const User = connection.models.User;
const Files = connection.models.Files;

require('dotenv').config();

// ---------------------- SETUP ----------------------

const account = "ratneshjain";
const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
const accessKey = process.env.AZURE_STORAGE_ACCESS_KEY;
const cerds = new storage.StorageSharedKeyCredential(account, accessKey);
const blobServiceClient = storage.BlobServiceClient.fromConnectionString(connStr);

async function getContainerName(user_name) {
    const user_obj = await User.findOne({ username: user_name })
        .then((user) => {
            if (!user) {
                return null;
            }
            return user;
        })
        .catch((err) => {
            console.log(err.message);
        });
    let container_name = (user_name + user_obj._id.toString()).replace(/\s+/g, '-').toLowerCase();
    console.log(container_name);
    return container_name
}

async function create_container(user_name) {
    // Connect to container: user-files
    const container_name = await getContainerName(user_name);
    const containerClient = blobServiceClient.getContainerClient(container_name);
    const createContainerResponse = await containerClient.createIfNotExists();
    console.log("Container created for user " + container_name);
    console.log("Container was created successfully. requestId: ", createContainerResponse.requestId);
}

// ---------------------- SAS TOKENS ----------------------

// Pass blobName=null to get sasUrl for whole container
// TODO: Sperate permissions for upload and download
async function getSASUrl(containerName, blobName) {
    const client = blobServiceClient.getContainerClient(containerName);

    if (blobName != null) {
        const blobClient = client.getBlobClient(blobName);

        const startsOn = new Date();
        startsOn.setMinutes(startsOn.getMinutes() - 5);
        const expiresOn = new Date();
        expiresOn.setMinutes(expiresOn.getMinutes() + 60);

        const sasUrl = await blobClient.generateSasUrl({
            permissions: storage.BlobSASPermissions.parse("rcw"), // "racwdl for all Permissions"
            startsOn,
            expiresOn,
            contentDisposition: "attachment"
        });
        console.log("SAS URL IS " + sasUrl);
        // on put req - returns status 201 created
        // status 403 if not authorized
        return sasUrl;
    } else {
        console.log("blobname is null err");
        return "NoBlobName";
    }
}

// dont use for now, alternate approch - get token and use azure rest api endpoints on client
async function getSASUrlContainer(containerName) {
    const client = blobServiceClient.getContainerClient(containerName);

    const startsOn = new Date();
    startsOn.setMinutes(startsOn.getMinutes() - 5);
    const expiresOn = new Date();
    expiresOn.setMinutes(expiresOn.getMinutes() + 60);

    const blobSAS = storage.generateBlobSASQueryParameters({
        containerName,
        blobName,
        permissions: storage.BlobSASPermissions.parse("racwdl"),
        startsOn,
        expiresOn
    },
        cerds
    ).toString();

    //to upload file client.url + filename +"?" + blobSAS
    const sasUrl = client.url + "?" + blobSAS;
    console.log("SAS URL IS " + sasUrl);
    return sasUrl;
}

// ---------------------- MANAGE BLOBS ----------------------

// since container-name is linked to username we only pass container_name after verifying user
async function list_blobs(container_name) {
    const containerClient = blobServiceClient.getContainerClient(container_name);
    const blobs = await containerClient.listBlobsFlat({ include: ["metadata"] });
    let blobList = [];
    for await (const blob of blobs) {
        blobList.push({
            name: blob.name,
            metadata: blob.metadata
        });
    }
    return blobList;
}

async function getMetaDataOnBlob(containerName, blobName) {
    const client = blobServiceClient.getContainerClient(containerName);
    const blobClient = client.getBlobClient(blobName);
    const data = await blobClient.getProperties();
    console.log(data.metadata)
    return data.metadata;
}

async function uploadFileCosmos(username, filename, file_buffer, hash) {
    const container_name = await getContainerName(username);

    // initiate a new db file object
    const newFile = new Files({
        username: username,
        filename: filename,
        hash: hash,
    });

    // return obj
    const state = {
        status: true,
        msg: "file uploaded"
    }

    await Files.findOne({ username: username, filename: filename })
        .then(async (file) => {

            // if no file is there we upload a new file
            if (!file) {
                await newFile.save().then(async (file) => {

                    state.status = await uploadFile(container_name, filename, file_buffer);
                    state.status = true;
                    state.msg = "file uploaded";

                }).catch(err => {
                    state.status = false;
                    state.msg = "error";
                    console.log(err.message);
                });

            } else {
                // if
                console.log("Hashes ", file.hash, hash);
                if (file.hash == hash) {
                    state.status = false;
                    state.msg = "same file already exists";
                } else {
                    await Files.updateOne({ username: username, filename: filename }, {
                        hash: hash
                    });
                    await uploadFile(container_name, filename, file_buffer);

                    state.status = true;
                    state.msg = "file updated";
                }
            }
        })
        .catch((err) => {
            console.log(err.message);
            state.status = false;
            state.msg = "error";
        });

    return state;
}

async function uploadFile(containerName, blobName, file_buffer) {
    const client = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = client.getBlockBlobClient(blobName);
    const state = await blockBlobClient.uploadData(file_buffer).then(() => {
        console.log('uploaded file');
        return true;
    }).catch((err) => {
        console.log('err on upload file');
        console.log(err.message);
        return false;
    });;
    return state;
}

async function setMetaDataOnBlob(containerName, blobName, metadata) {
    const client = blobServiceClient.getContainerClient(containerName);
    const blobClient = client.getBlobClient(blobName);
    const exists = await blobClient.exists();

    if (exists) {
        const state = await blobClient
            .setMetadata(metadata)
            .then(() => {
                console.log('metadata set');
                return true;
            })
            .catch((err) => {
                console.log('err on set metadata');
                console.log(err.message);
                return false;
            });

        return state;
    } else {
        console.log("file does not exist to set metadata");
        return false;
    }
}

async function blobRename(containerName, blobName, newMetadata) {

    const newBlobName = newMetadata.filename;
    console.log(newBlobName);

    const client = blobServiceClient.getContainerClient(containerName);
    const blobClient = client.getBlobClient(blobName);
    const blobClientNew = client.getBlobClient(newBlobName);
    const oldExists = await blobClient.exists();
    const newExists = await blobClientNew.exists();

    if (oldExists && !(newExists)) {
        //const state = await blobClientNew.syncCopyFromURL(blobClient.url)
        const response = await blobClientNew.beginCopyFromURL(blobClient.url);
        const result = await response.pollUntilDone()
            .then(async () => {
                console.log('copied file');
                const del = await blobDelete(containerName, blobName);
                const set = await setMetaDataOnBlob(containerName, newBlobName, newMetadata);

                return set && del;
            })
            .catch((err) => {
                console.log('err on file copy');
                console.log(err.message);
                return false;
            });

        return result;
    } else {
        if (!oldExists) {
            console.log("file does not exist to rename");
        }
        if (newExists) {
            console.log("new_file alreday exists");
        }
        return false;
    }

}

async function deleteBlobCosmos(username,filename) {
    return await Files.deleteOne({ username: username, filename: filename }).then(()=>{
        console.log('file deleted in DB');
        return true;
    }).catch((err) => {
        console.log('err on file delete in DB');
        console.log(err.message);
        return false;
    });
}

async function blobDelete(containerName, blobName) {

    const client = blobServiceClient.getContainerClient(containerName);
    const blobClient = client.getBlobClient(blobName);

    const exists = await blobClient.exists();

    if (exists) {
        const state = await blobClient.delete()
            .then(() => {
                console.log('deleted file');
                return true;
            })
            .catch((err) => {
                console.log('err on file delete');
                console.log(err.message);
                return false;
            });

        return state;
    } else {
        console.log("file does not exist to delete");
        return false;
    }
}

module.exports.getContainerName = getContainerName;
module.exports.create_container = create_container;
module.exports.getSASUrl = getSASUrl;
module.exports.list_blobs = list_blobs;
module.exports.uploadFile = uploadFile;
module.exports.uploadFileCosmos = uploadFileCosmos;
module.exports.getMetaDataOnBlob = getMetaDataOnBlob;
module.exports.setMetaDataOnBlob = setMetaDataOnBlob;
module.exports.blobRename = blobRename;
module.exports.deleteBlobCosmos = deleteBlobCosmos;
module.exports.blobDelete = blobDelete;