import { v4 as uuid } from "uuid";
import { dataUsers } from "../models/user.js";
let data = {
    users : dataUsers,
    setUsers : function (data) {this.users = data}
}

export const getUsers = (req,res) => {
    res.json({
        'users' : data.users
    });
}
export const createUser = (req,res) => {
    if(!req.body.name || !req.body.gender) {
        return res.status(400).json({message:"please fill name and gender"});
    }
    const newUser = {
        id: uuid(),
        name : req.body.name,
        gender : req.body.gender
    };
    data.setUsers([...data.users,newUser]);
    res.json({
        message : req.body.gender,
        users : data.users
    });
}
export const updateUser = (req,res) => {
    if(!req.body.name && !req.body.gender) {
        res.status(400).json({message:"please enter value to update"});
    }
    let user = data.users.find((element) => element.id == req.params.id);
    if(!user){
        res.status(400).json({message:"user not found"});
    }
    if(req.body.name){
        user.name = req.body.name;
    }else if(req.body.gender){
        user.gender = req.body.gender;
    }
    const users = data.users.filter(element => element.id !== user.id);
    data.setUsers([...users,user]);
    res.json({
        message : 'success',
        users : data.users
    });
}
export const getUser = (req,res) => {
    let user = data.users.find((element) => element.id == req.params.id);
    if(!user) {
        res.status(400).json({message:"user not found"});
    }
    res.json({
        message : 'success',
        user
    });
}
export const deleteUser = (req,res) => {
    let user = data.users.find((element) => element.id == req.params.id);
    if(!user) {
        res.status(400).json({message:"user not found"});
    }
    const users = data.users.filter(element => element.id !== user.id);
    data.setUsers(users);
    res.json({
        message : 'deleted the users',
        users : data.users
    });
}
