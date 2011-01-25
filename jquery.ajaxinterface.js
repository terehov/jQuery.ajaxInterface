/*
 * jQuery.ajaxInterface 0.9.0
 *
 * Copyright 2010, Eugene Terehov
 * http://www.terehov.de
 * (LGPL V3) GNU Lesser General Public License Version 3
 * http://www.gnu.org/licenses/lgpl-3.0.html
 *
 */

(function($) {

    $.ajaxInterface = function(pParams, pCallback) {

        // DEFAULT SETTINGS
        if (typeof pParams === "undefined")
        	pParams = new Array();
        if (typeof pParams.async === "undefined")
            pParams.async = true;
        if (typeof pParams.type === "undefined")
            pParams.type = "post";

        // SUPPORTED EVENTS
        var _supportedEvents = new Array('blur', 'focus', 'focusin', 'focusout', 'load', 'resize', 
                                            'scroll', 'unload', 'click', 'dblclick', 'mousedown', 
                                            'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 
                                            'mouseleave', 'change', 'select', 'submit', 'keydown', 'keypress', 
                                            'keyup', 'error');

        // save the original callback in a closure
        (function() {
            var originalSuccessCallback = pParams.success;
            // overwrite the callback method
            pParams.success = function(pData, pTextStatus, pXMLHttpRequest) {
                // convert string to xml, if the server deliveres the file with a wrong header
                if($(pData).find('jquery').size() == 0)
                    pData = _stringToXML(pData);
                    
                // parse and overwrite the real pData with the response part
                _parseResponse($(pData).find('jquery'));

                // return the response part, otherwise return false
                var returnResponse = $(pData).find("jquery response")[0];
                var pData = ($(returnResponse).size() == 0) ? false: returnResponse;

                // Execute the original method if defined.
                if (typeof originalSuccessCallback != "undefined")
                    originalSuccessCallback.apply(this, arguments);
            };
        })();

        // execute jquery ajax request
        return $.ajax(pParams);
        

        /**
        * This is the actual parsing method for the various blocks. 
        * It is called recursively and is either performing the manipulation or calling a
        * halper function (e.g. for the animations block).
        * @param {Object} pResponseXMLJQuery The jQuery object of the animation XML block
        * @param {Object} pCurrentJQuery The current jQuerey selection scope based on the setSelector tag. 
        */
        function _parseResponse(pResponseXMLJQuery, pCurrentJQuery) {
    
            // template XML parts
            var jQueryXml = null;
            var returnResponse = null;
            // current scope
            var currentJQuery = pCurrentJQuery;

            // parse all children
            pResponseXMLJQuery.children().each(function(i) {
                thisJq = $(this);
                // basic parameter
                var type 		= this.nodeName;
                var action 		= thisJq.attr("action");
                var value 		= thisJq.attr("value");
                var nestedValue	= thisJq.text();
                var eventName = thisJq.attr("event");
                
                switch (this.nodeName.toLowerCase()) {
                	case 'title':
                    	_modifyTitle(thisJq);
                    break;
                	case 'setselector':
                    	currentJQuery = $(thisJq.attr('value'));
	                    // check wether there are children avaliable
    	                if (thisJq.children().size() > 0)
        	                _parseResponse(thisJq, currentJQuery);
                    break;
            	    case 'css':
                	    _include(thisJq);
                    break;
                	case 'script':
                    	_include(thisJq, currentJQuery);
                    break;
	                case 'html':
		                    // adding and repalcing content
		                    if (action == "replace")
		                        currentJQuery.html(nestedValue);
	                    else if (action == "remove")
	                        currentJQuery.remove();
	                    else
	                        currentJQuery.append(nestedValue);
                    break;
                	case 'id':
                    	// replacing the ID
                    	currentJQuery.filter(":first-child").attr("id", value.trim());
	                break;
	                case 'class':
	                    // adding and repalcing css classes
	                    if (action == "replace")
	                        currentJQuery.removeClass().addClass(value.trim());
	                    else if (action == "remove")(value.trim().length === 0) ? currentJQuery.removeClass() : currentJQuery.removeClass(value.trim());
	                    else
	                        currentJQuery.addClass(value.trim());
	                break;
	                case 'styles':
	                    // addign and replacing css styles
	                    if (action == "replace")
	                        currentJQuery.removeAttr("style").css(value);
	                    else if (action == "remove")
	                        currentJQuery.removeAttr("style");
	                    else
	                        currentJQuery.css(_parseJsonOrReturnString(value));
	                break;
	                case 'animation':
	                    // event binding / unbinding
	                    if (typeof eventName != "undefined")
	                    	_handleEvent(thisJq, currentJQuery);
	                    // just run the animations
	                    else
	                        // parse and run the animation
	                        _runAnimation(thisJq, currentJQuery);
	                break;
	                case 'ajaxinterface':
	                	// event binding / unbinding
	                    if (typeof eventName != "undefined")
	                    	_handleEvent(thisJq, currentJQuery);
	                    // just parse and runt ajaxInterface
	                    else
	                    	_runAjaxInterfaceRequest(thisJq, currentJQuery);
	                break;
	                case 'response':
	                    // do nothing: this one was filtered before
	                break;
	                default:
	                    console.error("Unexpected template element found: " + type);
                };
            });
        };
        
        /**
        * This methond is handling the event binding und unbinding for some particular elements:
        * animation, ajaxInterface, and function. 
        * @param {Object} pResponseXMLJQuery The jQuery object of the animation XML block
        * @param {Object} pCurrentJQuery The current jQuerey selection scope based on the setSelector tag. 
        */
        function _handleEvent(pResponseXMLJQuery, pCurrentJQuery)
        {
        	var eventName = pResponseXMLJQuery.attr("event");
        	var eventCallback = pResponseXMLJQuery[0].nodeName;
			var eventAction = pResponseXMLJQuery.attr("action");

        	// possible event?
        	if ($.inArray(eventName, _supportedEvents) == -1)
            	console.error("Parsing Error: Unexpected event action: " + animationEvent);
        	else
        		// binding event
	        	if(typeof eventAction == "undefined" || eventAction == "bind")
	        		pCurrentJQuery.one(eventName, function(){
		        		switch (eventCallback.toLowerCase()){
		                	case 'animation':
		                   		_runAnimation(pResponseXMLJQuery, pCurrentJQuery);
		                    break;
		                	case 'ajaxinterface':
		                		_runAjaxInterfaceRequest(pResponseXMLJQuery, pCurrentJQuery);
		                    break;
		                	case 'function':
		                		var functionName = pResponseXMLJQuery.attr("name");
		                		var functionValueObj = _parseJsonOrReturnString(pResponseXMLJQuery.attr("value"));
		                		window[functionName](functionValueObj);
		                    break;
		                    default:
			                    console.error("Unexpected event action element found: " + eventCallback);
	        			};
	        		});
	        	// unbinding event
	        	else
	        		pCurrentJQuery.die(eventName);
        };
        

        /**
        * Parse the css / script block and include or remove the required files to/from the dom tree.
        * In case of JavaScript a function can be called. 
        * @param {Object} pResponseXMLJQuery The jQuery object of the animation XML block
        * @param {Object} pCurrentJQuery The current jQuerey selection scope based on the setSelector tag. 
        */
        function _runAjaxInterfaceRequest(pResponseXMLJQuery, pCurrentJQuery)
        {
        	var async = (typeof pResponseXMLJQuery.attr("async") == "undefined" || pResponseXMLJQuery.attr("async") == "true") ? "true" : "false";
           	// ajax callback function
           	var successCallback = function(){};
           	if (pResponseXMLJQuery.children().size() > 0)
           		successCallback = function(){
           			_parseResponse(pResponseXMLJQuery, pCurrentJQuery);
           		};
           	
               $.ajaxInterface({
                   url: _urldecode(pResponseXMLJQuery.attr("src")),
                   async: async,
                   success: successCallback
               });
        };

        /**
        * Sets the title of the document
        * @param {Object} pResponseXMLJQuery The jQuery object of the animation XML block
        */
        function _modifyTitle(pResponseXMLJQuery) {
            document.title = pResponseXMLJQuery.text();
        };

        /**
        * Parse the css / script block and include or remove the required files to/from the dom tree.
        * In case of JavaScript a function can be called. 
        * @param {Object} pResponseXMLJQuery The jQuery object of the animation XML block
        * @param {Object} pCurrentJQuery The current jQuerey selection scope based on the setSelector tag. 
        */
        function _include(pResponseXMLJQuery, pCurrentJQuery) {
            var fileType = pResponseXMLJQuery[0].nodeName;
            // run through all files
            pResponseXMLJQuery.children().each(function(pI) {
                var thisJq 			 = $(this);
                var elementType 	 = this.nodeName;
                var action 			 = thisJq.attr("action");
                var filePath 		 = _urldecode(thisJq.attr("src"));
                var functionName 	 = thisJq.attr("name");
                var functionValueObj = _parseJsonOrReturnString(thisJq.attr("value"));
                var eventName		 = thisJq.attr("event");

                switch (fileType.toLowerCase()) {
                case 'css':
	                // remove
                    if (action == "remove")                	
                    	$("head link[href='" + filePath + "']").remove();
					// add
                    else
                  		// allready added?
                    	if ($("head link[href=" + filePath + "]").size() == 0)
                    		$("head").append('<link rel="stylesheet" href="' + filePath + '" />');
                break;
                case 'script':
                    //adding an removing files
                    if (elementType == "file") 
                    {
                    	// impossible to remove js --> just add
                        if (action != "remove")
                            // already added?
                            if ($('body script[src="' + filePath + '"]').get().length == 0)
                                // include file
                                $("body").append('<script src="' + filePath + '"></script>');
                    }else if (elementType == "function")
                    	// event binding / unbinding
	                    if (typeof eventName != "undefined")
	                    	_handleEvent(thisJq, pCurrentJQuery);
	                    // just call the function
	                    else
	                    	window[functionName](functionValueObj);
                        
                    else
                        console.error("Unexpected template file element found: " + fileType);
                break;
                default:
                    console.error("Unexpected template file element found: " + fileType);
                };
            });
        };


        /**
        * Parse the animation block and perform the animations (recursive).
        * @param {Object} pResponseXMLJQuery The jQuery object of the animation XML block
        * @param {Object} pCurrentJQuery The current jQuerey selection scope based on the setSelector tag. 
        */
        function _runAnimation(pResponseXMLJQuery, pCurrentJQuery) {
            
            // animation parameter
            var animationName	 	= pResponseXMLJQuery.attr("name");
            var animationSpeed 		= (typeof pResponseXMLJQuery.attr("speed") != "undefined") ? pResponseXMLJQuery.attr("speed") : 0;
            var animationOpacity 	= (typeof pResponseXMLJQuery.attr("opacity") != "undefined") ? pResponseXMLJQuery.attr("opacity") : 0;
            var animationTop 		= pResponseXMLJQuery.attr("top");
            var animationBottom 	= pResponseXMLJQuery.attr("bottom");
            var animationLeft 		= pResponseXMLJQuery.attr("left");
            var animationRight 		= pResponseXMLJQuery.attr("right");
            var animationWidth 		= pResponseXMLJQuery.attr("width");
            var animationHeight 	= pResponseXMLJQuery.attr("height");
            var animationValueObj 	= _parseJsonOrReturnString(pResponseXMLJQuery.attr("value"));

            // any following animations?
            var followingAnimation = function() {};
            if (pResponseXMLJQuery.children().size() > 0)
                followingAnimation = function(){
                    // parse and run the following animations
                    _parseResponse(pResponseXMLJQuery, pCurrentJQuery);
                };

            // animation type             
            switch (animationName.toLowerCase()) {
            	case 'animation':
                	pCurrentJQuery.animate(animationValueObj, animationSpeed);
                break;
	            case 'delay':
    	            setTimeout(followingAnimation, animationSpeed);
                break;
        	    case 'hide':
            	    pCurrentJQuery.hide(animationSpeed, followingAnimation);
                break;
	            case 'show':
    	            pCurrentJQuery.show(animationSpeed, followingAnimation);
                break;
	            case 'fadein':
    	            pCurrentJQuery.fadeIn(animationSpeed, followingAnimation);
                break;
        	    case 'fadeout':
            	    pCurrentJQuery.fadeOut(animationSpeed, followingAnimation);
                break;
	            case 'fadeto':
    	            pCurrentJQuery.fadeTo(animationSpeed, animationOpacity, followingAnimation);
                break;
        	    case 'slideup':
            	    pCurrentJQuery.slideUp(animationSpeed, followingAnimation);
                break;
	            case 'slidedown':
    	            pCurrentJQuery.slideDown(animationSpeed, followingAnimation);
                break;
	            case 'moveto':
    	            if (pCurrentJQuery.css("position") == "static")
        	            pCurrentJQuery.css("position", "relative");
            		    var newPositionObj = new Object();
	                if (typeof animationTop != "undefined")
    	                newPositionObj.top = animationTop;
        	        if (typeof animationBottom != "undefined")
            	        newPositionObj.bottom = animationBottom;
	                if (typeof animationLeft != "undefined")
    	                newPositionObj.left = animationLeft;
        	        if (typeof animationRight != "undefined")
            	        newPositionObj.right = animationRight;
            	        
	                pCurrentJQuery.animate(newPositionObj, animationSpeed, followingAnimation);
                break;
    	        case 'resizeto':
        	        var newSizeObj = new Object();
	                if (typeof animationWidth != "undefined")
	                    newSizeObj.width = animationWidth;
	                if (typeof animationHeight != "undefined")
	                    newSizeObj.height = animationHeight;
	
	                pCurrentJQuery.animate(newSizeObj, animationSpeed, followingAnimation);
                break;
	            case 'shake':
    	            var eachSpeed = parseInt(animationSpeed) / 5;
	                if (pCurrentJQuery.css("position") == "static")
	                    pCurrentJQuery.css("position", "relative");
	                pCurrentJQuery.animate({
	                    left: "+=5"
	                }, eachSpeed).animate({
	                    left: "-=10"
	                }, eachSpeed).animate({
	                    left: "+=10"
	                }, eachSpeed).animate({
	                    left: "-=10"
	                }, eachSpeed).animate({
	                    left: "+=10"
	                }, eachSpeed).animate({
	                    left: "-=5"
	                }, eachSpeed, followingAnimation);
                break;
				case 'setcss':
	                pCurrentJQuery.css(animationValueObj);
	                followingAnimation();
				break;
	            default:
    	            console.error("Parsing Error: Unexpected animation: " + animationName);
            };
        };
        
        /**
        * URL decode
        * @param {String} pStr URL encoded strig
        * @returns URL string
        * @type String
        */
        function _urldecode(pStr) {
            return decodeURIComponent((pStr+'').replace(/\+/g, '%20'));
        };
        
        
        /**
        * Parse JSON to JS Object or return string
        * @param {String} pValue JSON or String
        * @returns JS object or String
        * @type mixed
        */
        function _parseJsonOrReturnString(pValue) {
        
            var returnStringOrObject = "";
            
            try
            {
                returnStringOrObject = $.parseJSON(pValue);
            }
            catch(pE){
                returnStringOrObject = pValue;
            };
            
            
            return returnStringOrObject;

        };
        
        /**
        * URL decode
        * @param {String} str XML string
        * @returns XML object
        * @type Object
        */
        function _stringToXML(str){
            if (window.ActiveXObject){
                var doc=new ActiveXObject('Microsoft.XMLDOM');
                doc.async='false';
                doc.loadXML(str);
            } else {
                var parser=new DOMParser();
                var doc=parser.parseFromString(str,'text/xml');
            };
            return doc;
        };

        return this;
    };
})(jQuery);