const express = require('express');
const mongoose = require('mongoose');
const Blog = require('./models/blogs');
const User = require('./models/user');
const { v4: uuidv4 } = require('uuid');
const app = express();
const port = 3000;
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static('css'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: '000112',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.set('view engine', 'hbs');
app.set('views', './views');

mongoose.connect('mongodb://127.0.0.1:27017/test')
    .then(() => console.log('Connected!'))
    .catch(err => console.log('Connection error:', err));

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const userId = uuidv4();
    const existingUser  = await User.findOne({ username });

    if (existingUser ) {
        return res.send('User  already exists');
    }
    const newUser  = new User({
        username,
        password,
        userId
    });

    await newUser .save();
    req.session.user = { id: userId, name: username };
    res.redirect('/blogs'); 
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && user.password === password) {
        const Id = user.userId;
        req.session.user = { id: Id, name: username };
        res.redirect('/blogs'); 
    } else {
        res.send('Invalid username or password');
    }
});

app.get('/create-blog', (req, res) => {
    res.render('post');
});

app.get('/profile',async(req,res)=>{
    try{
        const username=req.session.user.name;
        const userblogs=await Blog.find({author:username});
        res.render('profile' ,{username,userblogs});
    }
    catch(err){
        console.log("Error:",err);
    }

})

app.delete('/profile/:id',async(req,res)=>{
    const {id}=req.params;
    try{
        const deleteBlog=await  Blog.findByIdAndDelete(id);
        if (!deleteBlog) {
            return res.send('Blog not found');
        }
        res.json({ message: 'Blog deleted successfully' });
    } catch (err) {
        console.error(err);
        res.send('Error:',err);
    }
    
})
app.post('/create-blog', async (req, res) => {
    const { title, content, media } = req.body;
    const author = req.session.user.name;
    const id = req.session.user.id;
    const blogpost = new Blog({
        title,
        content,
        author,
        media,
        id,
    });
    try {
        await blogpost.save();
        console.log('Blog saved');
    } catch (err) {
        console.log('Error:', err);
    }
    res.redirect('/blogs'); 
});

app.get('/blogs', async (req, res) => {
    const searchQuery = req.query.search || ''; 
    try {
        
        const blogs = await Blog.find({
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } }, 
                { author: { $regex: searchQuery, $options: 'i' } }  
            ]
        });
        res.render('blog', { blogs, searchQuery }); 
    } catch (err) {
        console.error('Error fetching blogs:', err);
        res.send('No search found');
    }
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});