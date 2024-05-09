import mongoose from "mongoose";


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI }/${process.env.DB_NAME}`)
        // const connectionInstance = await mongoose.connect(`mongodb+srv://anujkumarsharma2023:mascssco@fastpy.qf9ces1.mongodb.net`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}

export default connectDB    