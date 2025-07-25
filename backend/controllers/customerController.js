const Customer = require("../models/CustomerModel");

const createCustomer = async(req,res) =>{
    try{
        const  customer  = req.body.data;
        console.log(customer)
        const cust = new Customer(customer);
        console.log(cust)
        await cust.save();
        return res.status(200).json({message : "Customer saved successfully"});
    }catch(error){
        console.log(error.message);
        return res.status(500).json({
            message: "Error while creating customer",
            error : error.message
        })
    }
}
const getCustomer = async (req,res)=>{
    try{
        const department = req.params.dept;
        if (!department) { 
            return res.status(400).json({
                message : "Department parameter is required"
            })
        }
        const cust = await Customer.find({department:department});
        if (!cust){
            return res.status(404).json({
                message : "No customers found for the specified department"
            })
        }
        return res.status(200).json({
            message : "Customers fetched successfully",
            data : cust
        });
    }catch(err){
        return res.status(500).json({
            message : "Error while fetching customer details",
            error : err.message
        })
    }
}

module.exports = {
    createCustomer,
    getCustomer
}