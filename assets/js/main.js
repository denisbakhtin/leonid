'use strict';
/*global m */

var DashboardComponent = require("./dashboard");
var CategoriesComponent = require("./category/categoriescomponent");
var ProductsComponent = require("./product/productscomponent");
var ProductComponent = require("./product/product");
var UsersComponent = require("./user/userscomponent");
var UserComponent = require("./user/usercomponent");
var layout = require("./layout/layout");

//setup routes to start w/ the `#` symbol
m.route.mode = "hash";

m.route(document.getElementById("admin-app"), "/", {
  "/": layout(DashboardComponent),
  "/users": layout(UsersComponent),
  "/users/:id": layout(UserComponent),
  "/categories": layout(CategoriesComponent),
  "/products": layout(ProductsComponent),
  "/products/:id": layout(ProductComponent),
});
