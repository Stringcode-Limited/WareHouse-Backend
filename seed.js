import { mongoDB } from "./config/database"
import { setSuperAdmin } from "./controller/personnel.controller"
import AdminModel from "./models/admin.model"

(async function seed(){
    mongoDB()
    const superadmin = {
        name:"",
        email:"",
        password:"",
        phone:"",
        role:"SuperAdmin",
        employee:[],
        customers:[],
        supppliers:[],
        category:[],
        products:[],
        taxes:[],
        discounts:[],
        expenses:[]
    }
AdminModel.create(superadmin)
})()