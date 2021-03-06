import express from 'express'
import blogModel from './schema.js'
import commentModel from '../comments/schema.js'
import createError from 'http-errors'
import { adminMiddleware } from '../../authenticate/admin.js'
import { AuthorAuth } from '../../authenticate/author.js'
import { JWTAuthMiddleware } from '../../authenticate/token.js'
import createHttpError from 'http-errors'
const blogPostsRouter = express.Router()

blogPostsRouter.route('/')
.get(JWTAuthMiddleware,async(req,res,next)=>{
    try {
        const blogs = await blogModel.find().populate('author')
        res.send(blogs)
    } catch (error) {
        next(error)
    }
})
.post(JWTAuthMiddleware,adminMiddleware,async(req,res,next)=>{
    try {
        const newBlog = new blogModel({
            ...req.body,author:req.author._id
        })
        const blog = await newBlog.save()
        res.status(201).send(blog)
    } catch (error) {
        next(error)
    }
})


blogPostsRouter.route('/:blogId')
.get(JWTAuthMiddleware,adminMiddleware,async(req,res,next)=>{
    try {
             const oneBlog =  await blogModel.findById(req.params.blogId).populate('author')
             res.send(oneBlog)
    } catch (error) {
        next(error)
    }
})
.put(JWTAuthMiddleware,adminMiddleware,async(req,res,next)=>{
    try {
            const modifiedBlog = await blogModel.findOneAndUpdate({_id:req.params.blogId,author:req.author._id},req.body,
                {
                new:true
               })
               if(modifiedBlog){
                   res.send(modifiedBlog)  
                 }else{
                     console.log('no modified blog')
                 }
      
    } catch (error) {
        next(error)
    }
})
.delete(JWTAuthMiddleware,adminMiddleware,async(req,res,next)=>{
    try {
          const deleteBlog = await blogModel.findOneAndDelete({_id:req.params.blogId,author:req.author._id})
          if(deleteBlog){
              res.status(204).send()
          }else{
              next(createHttpError(404,'not found'))
          }
         
    } catch (error) {
        res.send(500).send({ message: error.message })
    }
})

blogPostsRouter.route('/:blogId/likes')
.put(async(req,res,next)=>{
    try {
        const {id} = req.body
        const isLiked = await blogModel.findOne({_id:req.params.blogId, likes:id})
        if(isLiked){
            await blogModel.findByIdAndUpdate(req.params.blogId,{$pull:{likes:id}})
            res.send("liked")
        }else{
            await blogModel.findByIdAndUpdate(req.params.blogId,{$push:{likes:id}})
            res.send('unliked')
        }
    } catch (error) {
        
    }
})







// blogPostsRouter.route('/:blogId/comments')
// .get(async(req,res,next)=>{
//     try {
//         const blogs = await blogModel.findById(req.params.blogId)
//         if(user){
//             res.send(blogs.comments)
//         }else{
//             next(createError(404, `blog with id ${req.params.blogId} not found!`))
//         }
//     } catch (error) {
//         next(error)
//     }
// })
// .post(async(req,res,next)=>{
//     try {
//         const comments = await commentModel.findById(req.body.commentId,{_id:0})
//         if(comments){
//             const postComment = {...comments.toObject(), commentedDate:new Date()}
//             const updatedBlog = await blogModel.findByIdAndUpdate(
//                 req.params.blogId,{$push:{comments:postComment}},
//                 {new:true}
//             )
//             if (updatedBlog) {
//                 res.send(updatedBlog)
//               } else {
//                 next(createError(404, `blog with id ${req.params.blogId} not found!`))
//               }
//         }else{
//             next(createError(404, `comment with id ${req.body.commentId} not found!`))
//         }
//     } catch (error) {
//         next(error)
//     }
// })

// blogPostsRouter.route('/:blogId/comments/:commentId')
// .get(async(req,res,next)=>{try {
//     const blog = await blogModel.findById(req.params.blogId)
//     if(blog){
//         comment = blog.find(b=>b._id.toString()===req.params.commentId)
//         if(comment){
//             res.send(comment)
//         }else{
//             next(createError(404, `comment with id ${req.params.commentId} not found!`))
//         }
//     }else{
//         next(createError(404, `blog with id ${req.params.blogId} not found!`))
//     }
// } catch (error) {
//     next(error)
// }})
// .put(async(req,res,next)=>{
//     try {
//     const blog = await blogModel.findOneAndUpdate({_id:req.params.blogId,"comments._id":req.params.commentId}
//     ,{
//         $set:{
//             "comments.$":req.body
//         },
//     },{new:true})
//     if(blog){
//         res.send(blog)
//     }else{
//         next(createError(404, `blog with id ${req.params.blogId} not found!`))
//     }

// } catch (error) {
//     next(error)
// }})
// .delete(async(req,res,next)=>{try {
//     const blog= await blogModel.findOneAndUpdate(
//         req.params.blogId,
//         {$pull:{comments:{id_:req.params.commentId},},},{new:true}
//     )
//     if(blog){
//         req.send(blog)
//     }else{
//         next(createError(404, `blog with id ${req.params.blogId} not found!`))
//     }
// } catch (error) {
//     next(error)
// }})




export default blogPostsRouter



