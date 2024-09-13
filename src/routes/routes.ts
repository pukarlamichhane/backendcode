import express, { Router } from "express";
import {  Aggregation, createIndex, createTodo,deleteIndex,deleteTodo, getAllTodos,updateTodo } from "../contorller/controller";


export const router:Router =express.Router()


router.get("/gettodo",getAllTodos)
router.post("/create",createTodo)
router.delete("/delete/:num",deleteTodo)
router.put("/put/:num",updateTodo)
router.get("/deleteindex",deleteIndex)
router.get("/createindex",createIndex)
router.post("/getagg",Aggregation)



