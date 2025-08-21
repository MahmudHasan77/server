import mongoose from "mongoose";
import 'dotenv/config'

const database = async ()=>{
  try {
    await mongoose.connect(process.env.MONGODB_URL )
    console.log('database is connected')
  } catch (error) {
    console.log('the database is not connected to the server')
  }
}
 
export default database