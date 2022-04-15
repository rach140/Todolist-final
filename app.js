

const express = require("express");
const bodyParser = require("body-parser");
const _=require("lodash");

const mongoose=require("mongoose");
const url="mongodb+srv://rachuu:saritabubna@cluster0.jnefo.mongodb.net/todolistDB";

const app = express();

mongoose.connect(url,{useUnifiedTopology:true});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema=new mongoose.Schema({
  name:String
});

const listSchema=new mongoose.Schema({
  name:String,
  lists:[itemsSchema]
});


const Item=mongoose.model("Item",itemsSchema); //this is a collection

const item1=new Item({
   name:"Buy Food"
});

const item2=new Item({
  name:"Make Food"
});

const item3=new Item({
  name:"Eat Food"
});
const itemsArray=[item1,item2,item3];

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find(function(err,results){

    if(results.length===0){
      Item.insertMany(itemsArray,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Inserted successfully");
        }
      });
      res.redirect("/");
    }else{
        res.render("list", {listTitle: "Today", newListItems: results});
    }
  //  console.log(results);

  });
});

app.post("/", function(req, res){

const listName=req.body.list;
//console.log(listName);
const item =new Item({
  name:req.body.newItem
});

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,docs){
      if(!err){
      docs.lists.push(item);
      docs.save();
      res.redirect("/"+listName);
    }else{
      console.log(err);
    }
    });
  }



});

app.post("/delete",function(req,res){
  const deletedId=req.body.checkbox;
  const listName=req.body.listName;
//  console.log(listName);

if(listName==="Today"){
  Item.deleteOne({_id:deletedId},function(err){
    if(err){
      console.log(err);
    }else{
      console.log("Deleted successfully");
      res.redirect("/");
    }
  });
}else{
  List.findOneAndUpdate({name:listName},{$pull:{lists:{_id:deletedId}}},function(err,results){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}

});

app.get("/:customRoute",function(req,res){
const customListName=_.capitalize(req.params.customRoute);

List.findOne({name:customListName},function(err,docs){
  if(!err){
    if(!docs){
     //create the document
     const list=new List({
       name:customListName,
       lists:itemsArray
     });

     list.save();
     res.redirect("/"+customListName);
    }else{
      //show the document
    res.render("list",{listTitle: docs.name, newListItems: docs.lists});
    }
  }
});



});

app.get("/about", function(req, res){
  res.render("about");
});

// app.get("/Favicon.ico",function(req,res){
//   res.status(204).end();
// });

let port=process.env.PORT;
if(port==null || port==""){
  port=3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
