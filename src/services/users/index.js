import express from 'express'
import q2m from 'query-to-mongo'
import { auth } from '../../authenticate/index.js'
import userBlog from './schema.js'

const userRouter = express.Router()
userRouter.route('/')
.post(async(req,res,next)=>{
    try {
        const user = new userBlog(req.body)
        const newUser= await user.save()
        res.status(201).send(newUser)
    } catch (error) {
        next(error)
    }
})
.get(auth, async(req,res,next)=>{
    try {
        // const query =q2m(req.query)
        // const total = await userBlog.countDocuments(query.criteria)
        const user = await userBlog.find()
        res.send(user)
    } catch (error) {
        next(error)
    }
})
export default userRouter