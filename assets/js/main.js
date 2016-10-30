'use strict';
/*global m */

import {dashboard} from "./dashboard"
import {CategoryGrid} from "./product/categorygrid"
import {ProductList} from "./product/productlist"
import {ProductPage} from "./product/product"
import {Account} from "./account/account"
import {withLayout} from "./layout/layout"

//setup routes to start w/ the `#` symbol
m.route.mode = "hash";

m.route(document.getElementById("admin-app"), "/", {
    "/": withLayout(dashboard),
    "/account": withLayout(Account),
    "/categories": withLayout(CategoryGrid),
    "/products": withLayout(ProductList),
    "/products/:id": withLayout(ProductPage),
});