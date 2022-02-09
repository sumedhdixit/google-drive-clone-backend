const router = require('express').Router();
const storageUtils = require('./storageManager');
const isAuth = require("../auth/verifyAuth").isAuth;

// -------------- GET ROUTES ----------------

router.get('/listBlobs', isAuth, async (req, res, next) => {
    const container_name = await storageUtils.getContainerName(req.user.username);
    const blob_list = await storageUtils.list_blobs(container_name);
    res.json({
        "success": true,
        "blob_list": blob_list
    });
});

// -------------- POST ROUTES ----------------

router.post('/uploadFile', isAuth, async (req, res, next) => {
    const filename = req.body.filename;
    console.log(req.files);
    const file = req.files.newFile;
    const username = req.user.username;

    const state = await storageUtils.uploadFileCosmos(username, filename, file.data, file.md5);
    res.json({
        "success": state
    });
});


router.post('/getSASUrl', isAuth, async (req, res, next) => {
    // fileName passed by client in req body
    console.log(req.body.filename);
    const container_name = await storageUtils.getContainerName(req.user.username);
    const sas_url = await storageUtils.getSASUrl(container_name, req.body.filename);
    res.json({
        "success": true,
        "url": sas_url
    });
});

router.post('/setMetaData', isAuth, async (req, res, next) => {
    const metadata = req.body.metadata;
    // azure meta data only accepts str - do not pass int fields;
    console.log(metadata);

    const container_name = await storageUtils.getContainerName(req.user.username);
    const state = await storageUtils.setMetaDataOnBlob(container_name, metadata.filename, metadata);
    if (state) {
        res.json({
            "success": true
        });
    } else {
        res.json({
            "success": false
        });
    }

});

router.patch('/renameBlob', isAuth, async (req, res, next) => {
    /* Shape of req data
    {
        filename: metaData.filename,
        metadata: {
            filename: newFileName,
            createdate: metaData.createdate,
            lastmodified: new Date(Date.now()).toDateString(),
            filesize: metaData.filesize,
            type: metaData.type,
        },
    }
    */
    const newmetadata = req.body.metadata;
    console.log(newmetadata);

    const container_name = await storageUtils.getContainerName(req.user.username);
    console.log(container_name);

    const state = await storageUtils.blobRename(container_name, req.body.filename, newmetadata);
    if (state) {
        res.json({
            "success": true
        });
    } else {
        res.json({
            "success": false
        });
    }

});

router.delete('/deleteBlob', isAuth, async (req, res, next) => {
    const container_name = await storageUtils.getContainerName(req.user.username);
    const state_db = await storageUtils.deleteBlobCosmos(req.user.username, req.body.filename);
    const state_blob = await storageUtils.blobDelete(container_name, req.body.filename);
    if (state_db && state_blob) {
        res.json({
            "success": true
        });
    } else {
        res.json({
            "success": false
        });
    }

});

module.exports = router