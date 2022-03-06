const ProductModel = require('../models/productModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const AgentModel = require('../models/agentModel');
const UserModel = require('../models/userModel');
const AppError = require('./../utils/appError');
const ObjectId = require('mongoose').Types.ObjectId;

exports.home = async(req, res, next) => { 
    res.render("home",{
        title: 'Home'
    });
}
exports.index = async(req, res, next) => {
     res.render('index',{
        title:'Digital Dukaan'
    })
}

exports.shop = async(req, res, next)=>{
    const {id} = req.params;
    
    if(ObjectId.isValid(id)){
        if((String)(new ObjectId(id)) === id){
            let shopObject = await AgentModel.find({_id:id});
            if(shopObject.length !=0 ){    
                let products = await ProductModel.find({shopId:id});
                return res.status(200).render('shop',{
                    title: shopObject[0].shop,
                    shop:shopObject[0],
                    products
                });
            }      
        }
    }
    return next(new AppError("Something went wrong",400));     
}

exports.productpage = async(req, res, next)=>{
    const {id} = req.params;
    
    if(ObjectId.isValid(id)){
        if((String)(new ObjectId(id)) === id){
            let product = await ProductModel.find({_id:id});
            if(product.length !=0 ){    
                let products = await ProductModel.find({shopId:product[0].shopId});
                let shop = await AgentModel.find({_id:product[0].shopId});
                return res.status(200).render('product',{
                    title: product[0].name,
                    shop:shop[0],
                    product:product[0],
                    products
                });
            }      
        }
    }
    return next(new AppError("Something went wrong",400));     
}

exports.cart= async(req, res, next) => {
    const userid = req.user.id;
    const cartItem = await Cart.find({ UserID: userid });
    
    let shop;
    let arrayy = [];
    for (let cart of cartItem) {
      let cartProduct = await ProductModel.find({ _id: cart.ProductID });
      arrayy.push(cartProduct);
    }
    
    if(cartItem.length!=0){
        let agentp = await AgentModel.find({_id:arrayy[0][0].shopId});
        shop=agentp[0];
    }

    let subtotal = 0;
    let i = 0;
    for (let arr of arrayy) {
      subtotal = subtotal + arr[0].price * cartItem[i].Quantity;
      i++;
    }
    
    let shipping = 100;
    if (subtotal >= 1000 || subtotal == 0) shipping = 0;
    let tax = subtotal / 10;
    finaltotal = subtotal + shipping + tax;
    
    count = (await Cart.find({ UserID: req.user.id })).length;

    res.render('cart',{
        title:'cart',
        count,
        cartItem: cartItem,
        arrayy: arrayy,
        finaltotal,
        subtotal,
        shipping,
        tax,
        shop
    })
}


exports.orders = async(req, res, next) =>{
    const OrderList= await Order.find({});
    OrderList.reverse();

    let OrderProduct = [];
    let shops =[];
    for (let orders of OrderList) {
        let OProduct = await ProductModel.find({ _id: orders.ProductID });
        OrderProduct.push(OProduct);
        let shop = await AgentModel.find({_id: orders.ShopID });
        shops.push(shop);
    }

    res.status(200).render('orders',{
        title: 'Order',
        OrderList,
        OrderProduct,
        shops
    });
}

exports.account = async(req, res, next) =>{
    res.status(200).render('account',{
        title: 'Account'
    });
}

//------------------------------------------------------------Agent---------------------------------------------//

exports.shopkeeper = async(req, res, next) => { 
    res.status(200).render("agent",{
        title: 'Agent'
    });
}

exports.signup = async(req, res, next) => { 
    res.status(200).render("signup",{
        title: 'SIgnup'
    });
}

exports.agentaccount = async(req, res, next) =>{
    res.status(200).render('aacount',{
        title: 'Account'
    });
}

exports.agentdashboard = async(req, res, next) =>{
    
    let transid="";
    let checker = [];
    let monthcheck = [0,0,0,0,0,0,0,0,0,0,0,0]
    let orderCount = 0;
    let orderdata = await Order.find({});
    let categories = [];
    for(let product of res.locals.Products){
        categories.push(product.name);
        checker.push(0);
    }
    // console.log(categories);
    for(let data of orderdata){
        //console.log(data.OrderDate.toISOString().slice(5,7));
        if(transid!=data.TransactionID){
            orderCount=orderCount+1;
            for(let i=1;i<=12;i++){
                let month = parseInt(data.OrderDate.toISOString().slice(5,7));
                if(month==i){
                    monthcheck[i-1]++;
                }
            }
            // console.log(monthcheck);
        }
        transid=data.TransactionID

        const product1 = await ProductModel.find({_id: data.ProductID});
        // console.log(product1[0].pCategory);
        for(let i=0;i<checker.length;i++){
            if(categories[i]==product1[0].name){
                // console.log("hi");
                checker[i]=checker[i]+data.Quantity;
            }
        }
    }
    // console.log(checker,orderCount);
    const Date1 = new Date().toUTCString().slice(0, 16);
    const Time1 = new Date().toLocaleString().slice(9,22);   
    
    res.status(200).render('dashboard',{
        title: 'Dashboard',
        Date1,monthcheck,Time1,checker,orderCount,categories
    });
}

exports.products = async(req, res, next) =>{
    
    res.status(200).render('products',{
        title: 'Products'
      });
}

exports.addproduct = async(req, res, next) =>{
    
    res.status(200).render('addproduct',{
        title: 'Products',
      });
}

exports.paynow = async(req, res, next) =>{
    
    res.status(200).render("payInput", {
        key: "pk_test_51JRIRlSD7ORX7cv9kuhqMwSx9qAURpkuNwiDTX0SMiCjCEC8mKUmqlmnThqNTyCqcijRjCOI9rm6WCOIjVwWgzus00dJloVbPY",
        amount: 1200,
        Name: (await UserModel.find({_id:req.user.user_id})).name,
      });
}
