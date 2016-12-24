'use strict';
/*global m */

if (document.getElementById("admin-app")) {
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
    "/products/:id": layout(ProductComponent)
  });
}

//jquery callbacks
$(function(){
  //navbar
  $(window).on('scroll', function(){
    var threshold = 50;
    if($(window).scrollTop() > threshold){
      $('#navbar-main').addClass('scrolled');
    } else {
      $('#navbar-main').removeClass('scrolled');
    }
  });

	//top link
	$('#top-link').topLink({
		min: 400,
		fadeSpeed: 500
	});
	//smoothscroll
	$('#top-link').click(function(e) {
		e.preventDefault();
		$.scrollTo(0,300);
	});
});

//toplink plugin
jQuery.fn.topLink = function(settings) {
	settings = jQuery.extend({
		min: 1,
		fadeSpeed: 200
	}, settings);
	return this.each(function() {
		//listen for scroll
		var el = $(this);
		el.hide(); //in case the user forgot
		$(window).scroll(function() {
			if($(window).scrollTop() >= settings.min)
			{
				el.fadeIn(settings.fadeSpeed);
			}
			else
			{
				el.fadeOut(settings.fadeSpeed);
			}
		});
	});
};
