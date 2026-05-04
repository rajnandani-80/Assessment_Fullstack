const multer = require('multer');
const {CloudinaryStorage} = require('multer-storage-cloudinary');
const cloudinary = require("./config/cloudinary");


const imageStorage = new CloudinaryStorage({
    cloudinary,
    params : {
        folder : "profile_images",
        allowed_formats : ["jpg","png","jpeg"]
    }
})

const uploadImage = multer({storage : imageStorage});

module.exports = {uploadImage};








