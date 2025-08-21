import {v2 as cloudinary} from 'cloudinary'


const connectCloudinary = async ()=>{
try {
        await cloudinary.config({
        cloud_name:process.env.CLOUDINARY_NAME,
        api_key:process.env.CLOUDINARY_API_KEY,
        api_secret:process.env.CLOUDINARY_SECRET_KEY
        })
        console.log('cloudinary is connected')
} catch (error) {
    console.log('cloudinary is not connected')
}}

export default connectCloudinary;