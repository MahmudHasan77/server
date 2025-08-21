
import  mongoose  from 'mongoose';


const review_schema = new mongoose.Schema({
    review: {
        type: String,
        default: '',
        required:true
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'product'
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'user'
    },
    rating: {
        type: Number,
        default: 1,
    },
    images: [{
        type: String,
    }]
},{timestamps:true})



const review_model = mongoose.model('review', review_schema)


export default review_model