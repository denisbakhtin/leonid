'use strict';

exports.parseError = function(errstr) {
  try {
    return joinErrors(JSON.parse(errstr));
  }
  catch(err) {
    return errstr;
  }
}

var joinErrors = function(errors) {
  if (typeof(errors) === "object") {
    let errstr = "";
    for (let key in errors) {
      if (typeof(errors[key]) === "object") {
        for (let ekey in errors[key]) {
          errstr += errors[key][ekey] + ". ";
        }
      }
    }
    return errstr;
  } else 
    return errors;
}


exports.pages = function(arlen, pagesize) {
  return Array(Math.floor(arlen/pagesize) + ((arlen%pagesize > 0) ? 1 : 0)).fill(0); //return empty array of pages
}

exports.sorts = function(list) {
  return {
    onclick: function(e) {
      var prop = e.target.getAttribute("data-sort-by");
      if (prop) {
        var first = list[0];
        list.sort(function(a, b) {
          return a[prop]() > b[prop]() ? 1 : a[prop]() < b[prop]() ? -1 : 0;
        });
        if (first === list[0]) list.reverse();
      }
    }
  }
}

exports.mrequest = function(args) {
  var nonJsonErrors = function(xhr) {
    return (xhr.status > 204 && xhr.responseText.length) 
      ? JSON.stringify(xhr.responseText) 
      : (xhr.responseText.length)
      ? xhr.responseText
      : null;
  }
  args.extract = nonJsonErrors;
  return m.request(args);
}

exports.setCookie = function(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

exports.getCookie = function(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length,c.length);
    }
  }
  return "";
}
