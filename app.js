const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

// let items = ["Buy Food.", "Cook Food.", "Eat Food."];
// let workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.set('useFindAndModify', false);

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "hit the + button to add new item"
});

const item3 = new Item({
    name: "<-- hit this to delete an item"
});

const defaultItems = [item1, item2, item3];


const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

const list = new List({
    name: "xx",
    items: []
});
list.save();


app.get("/", function(req, res) {

    let day = date.getDate();

    Item.find({}, function(err, foundItems) {


        if (foundItems.length === 0) {

            Item.insertMany(defaultItems, function(err) {
                if (err) {
                    console.log("error", err);
                } else {
                    console.log("Successfully saved items to database");
                }
            });

            res.redirect("/");
        } else {

            res.render("list", {
                listTitle: "Today",
                newListItems: foundItems
            });
        }

    });

});

app.post("/", function(req, res) {
    let itemName = req.body.newItem;
    let listName = req.body.list;


    let item = new Item({
        name: itemName
    });

    if (listName == "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();

        });
        res.redirect("/" + listName);
    }



    // if (req.body.list === "Work List") {
    //     workItems.push(item);
    //     res.redirect("/work");
    // } else {
    //     items.push(item);
    //     res.redirect("/");
    // }

});

app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName

    if (listName === "Today") {

        Item.findByIdAndRemove(checkedItemId, function(err) {
            if (!err) {
                console.log("Successfully deleted");
                res.redirect("/");
            } else {
                console.log("error", err);
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function(err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }



});

app.get("/:customListName", function(req, res) {

    const customListName = _.capitalize(req.params.customListName);


    let cnt = 0;
    List.countDocuments({ name: customListName }, function(err, count) {
        if (err) {
            console.log(err)
        } else {
            cnt = count;
            console.log("Count :", count);
        }
    });
    // console.log(cnt);

    List.findOne({ name: customListName }, function(err, foundList) {

        if (!err) {
            console.log(cnt);

            if (cnt == 0) {

                // create a new list
                let list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                console.log("List findOne");

                res.redirect("/" + customListName);
            } else {

                //show an existing list

                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items
                });
            }
        }
    });


    // res.render("list", {
    //     listTitle: "Work List",
    //     newListItems: workItems
    // });
});


app.post("/:customListname", function(req, res) {
    // let item = req.body.newItem;
    // workItems.push(item);
    // res.redirect("/work");
});

app.get("/about", function(req, res) {
    res.render("about");
});


app.listen(3000, function() {
    console.log("Server is up and running on port 3000");
})


// switch (currentDay) {
//     case 0:
//         day = "Sunday";
//         break;

//     case 1:
//         day = "Monday";
//         break;

//     case 2:
//         day = "Tuesday";
//         break;

//     case 3:
//         day = "Wednesday";
//         break;

//     case 4:
//         day = "Thursday";
//         break;

//     case 5:
//         day = "Friday";
//         break;

//     case 6:
//         day = "Saturday";
//         break;

//     default:
//         console.log("Error: Current day is equal to:" + currentDay);
// }