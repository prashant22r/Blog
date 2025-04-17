const mongoose=require('mongoose');

const blogSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    author:{
        type:String,
        required:true
    },
    media:{
        type:String,
        required:true
    },
    date: {
        type: String, 
        default: () => {
            const now = new Date();
            return now.toLocaleString('en-IN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        }
    },
    id:{
        type:String,
        required:true
    }
});

const Blog=mongoose.model('Blog',blogSchema);
module.exports=Blog;