const router = require('express').Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');

const Blog = require('../models/blog');
const User = require('../models/user');

// define file storage
const diskStorage = require('../helpers/file-storage');
const upload = multer({ storage: diskStorage});

// middlewares
const verifyToken = require('../helpers/check-token');

// helpers
const getUserByToken = require('../helpers/get-user-by-token');

// create new post
router.post("/", verifyToken, upload.fields([{ name: 'photos'}]), async (req, res) => {
    // Req data
    const title = req.body.title;
    const description = req.body.description;
    const postDate = req.body.post_date;

    let files = [];

    if(req.files) {
        files = req.files.photos;
    }
    //validators
    if(title == null || description == null || postDate == null) {
        return res.status(400).json({ error: 'Required fields are missing.'})
        }
    
    // User verification
    const token = req.header('auth-token');
    const userByToken = getUserByToken(token);
    const userId = userByToken._id;

    try {
        const user = await User.findOne({ _id: userId });

        // create post with photos array
        let photos = [];
        if(files && files.length > 0) {
            files.forEach((photo, i) => {
                photos[i] = photo.path;
            })
            }
        const blog = new Blog({
            title: title,
            description: description,
            postDate: postDate,
            photos: photos,
            privacy: req.body.privacy,
            userId: userId
        });
        try {
            const newBlog = await blog.save();
            res.json({ error: null, msg: 'Post successfully created.', data: newBlog });

        } catch(err) {
            return res.status(400).json({ error });
        }
    } catch(err) {
        return res.status(400).json({ error: 'Invalid Access'});
    }
});

// get all blog posts
router.get('/all', async (req, res) => {
    try {
        const blogs = await Blog.find({privacy: false}).sort([['_id', -1]]);
        res.json({error: null, blogs: blogs});
    } catch(err) {
        return res.status(400).json({ error });
    }
});

// get user posts
router.get('/userblog', verifyToken, async (req, res) => {
    try {
        const token = req.header('auth-token');
        const user = await getUserByToken(token);
        const userId = user;
        const blogs = await Blog.find({ userId: userId });
        res.json({ error: null, blogs: blogs })
    } catch(error) {
    return res.status(400).json({ error });
    }
});

// get user post
router.get('/userblog/:id', verifyToken, async (req, res) => {

    try {
        const token = req.header('auth-token');
        const user = await getUserByToken(token);
        const userId = user;
        const blogId = req.params.id;
        const blog = await Blog.findOne({ _id: blogId, userId: userId });
        res.json({error: null, blog: blog});
    } catch(error) {
        return res.status(400).json({ error });
    }
});

// get post (public or private)
router.get('/:id', async (req, res) => {
    try {
    // find post
    const id = req.params.id;
    const blog = await Blog.findOne({ _id: id });

    // public post
    if(blog.privacy == false) {
        res.json({error: null, blog: blog});
    // private post
    } else {
        const token  =  req.header('auth-token');
        const user = await getUserByToken(token);
        const userId = user;
        const blogUserId = blog.userId;

        // check if user id is equal blog user id
        if(userId == blogUserId) {
            res.json({error: null, blog: blog});
        }
        res.json({error: null, blog: blog});

    }

    } catch(error) {
        return res.status(400).json({ msg: "Post not exists" });
    }

});

// delete post
router.delete('/', verifyToken, async (req, res) => {

    const token = req.header('auth-token');
    const user = await getUserByToken(token);
    const blogId = req.body.id;
    const userId = user

    try {

        await Blog.deleteOne({ id: blogId, user: userId });
        res.json({error: null, msg: "Post deleted successfully"});

    } catch(error) {
        res.status(400).json({error: "Access denied!"})
    }
});

// update post
router.put('/', verifyToken, upload.fields([{ name: "photos"}]), async (req, res) => {
    // Req body
    const title = req.body.title;
    const description = req.body.description;
    const postDate = req.body.post_date;
    const blogId = req.body.id;
    const blogUserId = req.body.user_id;

    let files = [];

    if(req.files) {
        files = req.files.photos;
    }
    // validators
    if(title == null || description == null || postDate == null) {
        return res.status(400).json({ error: 'Required fields are missing.'})
        }
    // verify user
    const token = req.header('auth-token');
    const user = await getUserByToken(token);
    const userId = user;

    if(userId != blogUserId) {
        return res.status(400).json({error: "Access denied!"})
    }

    // Build post object
    const blog = {
        id: blogId,
        title: title,
        description: description,
        postDate: postDate,
        privacy: req.body.privacy,
        userId: userId
    }

    //create photos array with img path
    let photos = [];
    
    if(files && files.length > 0) {
        files.forEach((photo, i) => {
            photos[i] = photo.path;
    })

    blog.photos = photos;

    }
    try {
        // returns updated post object
        const updatedBlog = await Blog.findOneAndUpdate({ _id: blogId, userId: userId}, { $set: blog}, {new: true});
        res.json({error: null, msg: "Post successfully updated.", data: updatedBlog});
    } catch(error) {
        res.status(400).json({error});
    }
});

module.exports = router;