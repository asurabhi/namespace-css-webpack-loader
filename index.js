'use strict';
var loaderUtils = require('loader-utils');
var css = require('css');

module.exports = function(sourceString) {
	var loader = this;
	if (loader.cacheable) {
		loader.cacheable();
	}

	var params = loaderUtils.parseQuery(loader.query);
	var callback = loader.async();
	namespaceCSS(sourceString, params, callback)
}

function namespaceCSS(source, params, callback) {
	var ast = css.parse(source);
	
	// console.log('params:' + JSON.stringify(params))

	// console.log("-----------input-------------");
	// console.log(source);
	// console.log(css.stringify(ast));
	// console.log("-----------------------------");

	nameSpaceNode(ast, params);

	// console.log("-----------output-------------");
	// console.log(css.stringify(ast));
	// console.log("-----------------------------");
	
	callback(null, css.stringify(ast));
}

function nameSpaceSelector(sel, params) {
	var prefix = "";
	if (params.scopeVarType === "id") {
		prefix = "#";
	} else if(params.scopeVarType === "class"){
		prefix = ".";
	}

	var namespaceVar = prefix + params.nameSpace;

	// console.log('namespaceVar:' + namespaceVar);

    if (sel.match(/^@/)) return sel;
    var m = sel.match(/(^| )(body|html)($|\W.*)/i);
    if (m) 
        return m[1] + namespaceVar + m[3];
    else
        return namespaceVar + ' ' + sel;
}

function nameSpaceNode(node, params) {
    if (node.selectors) {
        node.selectors = node.selectors.map(function(selector) {
			return nameSpaceSelector(selector, params)
		});
    } else if (node.stylesheet) {
        node.stylesheet.rules.forEach(function(ruleNode) {
			nameSpaceNode(ruleNode, params);
		});
    } else if (node.rules) {
        node.rules.forEach(function(ruleNode) {
			nameSpaceNode(ruleNode, params);
		});
    }
}
