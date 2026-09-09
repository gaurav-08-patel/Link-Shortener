import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema({
    url:{
        type:String,
        required:true
    },
    shortUrl:{
        type:String,
        required:true
    },
    clicks:{
        type:Number,
        default:0
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    }
},{
    timestamps:true
});

const Link = mongoose.model('Link',linkSchema);
export default Link;