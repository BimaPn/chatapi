import Post from "../models/Post.js"

export const getPosts = async (req, res) => {
  const posts = await Post.find();
  res.json({posts});
}
export const createPost = async (req,res) => {
  if(!req.body.title || !req.body.author) {
    return res.status(400).json({message:"Please insert title and author"});
  }
  const result = await Post.create({
    title : req.body.title,
    author : req.body.author
  });
    
  res.json(result);
}
export const updatePost = async (req,res) => {
  if(!req?.body?.title && !req?.body?.author) {
      return res.status(400).json({message:"please insert something bitch"});
  }
  const post = await Post.findOne({_id : req.params.id}).exec(); 

  if(!post){
      return res.status(400).json({message:"post not found"});
  }
  if(req?.body?.title) post.title = req.body.title; 
  if(req?.body?.author) post.author = req.body.author;
  const result = await post.save();
  res.json({
      message : 'success',
      post : result
  });
}
export const getPost = async (req,res) => {
  const result = await Post.findOne({_id : req.params.id}).exec();
  if(!result) return res.status(400).json({message:"post not found"});
  res.json({
      message : 'success',
      post : result
  });
}
export const deletePost = async (req,res) => { 
  const post = await Post.deleteOne({_id : req.params.id}).exec();
  if(post.deletedCount === 0) {
      return res.status(400).json({message:"post not found"});
  }
  res.json({
      message : 'deleted',
  });
}
