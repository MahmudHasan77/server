
import  mongoose  from 'mongoose';


const ramSchema = new mongoose.Schema({
    name:{type:String , required:true}
})

const ram_model = mongoose.model('ram',ramSchema)

export default ram_model;