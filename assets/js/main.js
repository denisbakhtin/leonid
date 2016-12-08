﻿'use strict';
/*global m */

var DashboardComponent = require("./dashboard");
var CategoriesComponent = require("./category/categoriescomponent");
var CategoryComponent = require("./category/categorycomponent");
var ProductsComponent = require("./product/productscomponent");
var ProductComponent = require("./product/productcomponent");
var UsersComponent = require("./user/userscomponent");
var UserComponent = require("./user/usercomponent");
var PagesComponent = require("./page/pagescomponent");
var PageComponent = require("./page/pagecomponent");
var layout = require("./layout/layout");

//setup routes to start w/ the `#` symbol
m.route.mode = "hash";

m.route(document.getElementById("admin-app"), "/", {
  "/": layout(DashboardComponent),
  "/users": layout(UsersComponent),
  "/users/:id": layout(UserComponent),
  "/pages": layout(PagesComponent),
  "/pages/:id": layout(PageComponent),
  "/categories": layout(CategoriesComponent),
  "/categories/:id": layout(CategoryComponent),
  "/products": layout(ProductsComponent),
  "/products/:id": layout(ProductComponent),
});
