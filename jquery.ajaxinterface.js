/*
 * jQuery.ajaxInterface 0.8.0
 *
 * Copyright 2010, Eugene Terehov
 * (LGPL V3) GNU Lesser General Public License Version 3
 * http://www.gnu.org/licenses/lgpl-3.0.html
 *
 */

(function($){
	    
	jQuery.ajaxInterface = function(pParams, pCallback){
	
	    // DEFAULT SETTINGS
	    if (typeof pParams == "undefined") pParams = new Array();
	    if (typeof pParams.async == "undefined") pParams.async = true;
	    if (typeof pParams.type == "undefined") pParams.type = "post";
	    
	    // SUPPORTED EVENTS
	    var _supportedEvents = new Array(
	        'blur', 'focus', 'focusin', 'focusout', 'load', 'resize', 'scroll', 
	        'unload', 'click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 
	        'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'change', 
	        'select', 'submit', 'keydown', 'keypress', 'keyup', 'error');
	    
	    
		// save the original callback in a closure
		(function(){
		   var originalSuccessCallback = pParams.success;
		   // overwrite the callback method
		   pParams.success = function(pData, pTextStatus, pXMLHttpRequest)
		   {
		     // parse and overwrite the real pData with the response part
		     var pData = _parseResponse(pData);
		     // Execute the original method if defined.
		     if (typeof originalSuccessCallback != "undefined")
			   originalSuccessCallback.apply(this, arguments);	     
		   };
		})();
		    
		// execute jquery ajax request
		return jQuery.ajax(pParams);
		
	
	    function _parseResponse(pResponseXML)
	    {	
	      // template XML parts
	      var xmlBefore = null;
	      var xmlContent = null;
	      var xmlAfter = null;
	      var returnResponse = null;
	
	      // parse all children
	      jQuery(pResponseXML).find('jquery').children().each(function(i)
	      {
	          switch (this.nodeName.toLowerCase())
	          {
	          case 'before':
	              xmlBefore = this;
	              break;
	          case 'after':
	              xmlAfter = this;
	              break;
	          case 'response':
	              returnResponse = this;
	              break;
	              
	          default:
	              xmlContent = this;
	          };
	      });
	  
	  
	      // run before if not empty
	      if (xmlBefore != null)
            _parseTemplateBlock(jQuery(xmlBefore));
	      // run content if not empty
	      if (xmlContent != null)
            _parseTemplateBlock(jQuery(xmlContent));
	      // run after if not empty
	      if (xmlAfter != null)
            _parseTemplateBlock(jQuery(xmlAfter));
	  
	      // return the response part, otherwise return false
	      if(jQuery(returnResponse).size() == 0) 
	        returnResponse = false;
	      else
	        returnResponse = returnResponse;
	    
	      return returnResponse;
	  };
	  
	  function _parseTemplateBlock(pXmlJq)
	  {
	    // parse all children
	    pXmlJq.children().each(function(i)
	    {
	      switch (this.nodeName.toLowerCase()) 
	      {
	        case 'title':
	          _modifyTitle(jQuery(this));
	          break;
	        case 'css':
	          _include(jQuery(this));
	          break;
	        case 'javascript':
	          _include(jQuery(this));
	          break;
	        case 'modification':
	          _modification(jQuery(this));
	          break;
	        default:
	          throw ("Unexpected template element found: " + this.nodeName);
	      };
	    });
	  };
	  
	  
	  /*###########
	   * Modifications
	   */
	
	  // sets the title of the document
	  function _modifyTitle(pXmlJq)
	  {
	    document.title = pXmlJq.text();
	  };
	  
	  // includes or removes files from the document
	  function _include(pXmlJq)
	  {
	    var fileType = pXmlJq[0].nodeName;
	    // run through all files
	    pXmlJq.children("file").each(function(pI)
	    {
	      
	      var action  = jQuery(this).attr("action");
	      var path  = jQuery(this).text();
	      
	      switch(fileType.toLowerCase())
	      {
	        case 'css':
	          if (action == "remove") // remove
	            jQuery("head link[href='" + path + "']").remove();
	          else // add
	            if (jQuery("head link[href=" + path + "]").size() == 0) // allready added?
	              jQuery("head").append('<link rel="stylesheet" href="' + path + '" />');
	          break;
	        case 'javascript':
	          if (action != "remove") // impossible to remove js --> just add
	            // already added?
	              if(jQuery('body script[src="' + path + '"]').get().length == 0)
	                // include file
	                jQuery("body").append('<script type="text/javascript" src="' + path +'"></script>');
	          break;
	        default: 
	          throw ("Unexpected template file element found: " + fileType);
	      };
	    });
	  };
	  
	  // runs the jQuery modifications
	  function _modification(pXmlJq)
	  {
      
	    var selector = pXmlJq.attr("selector");
	    var actionsJq = pXmlJq.children();
	    var selectedElementsJQuery = jQuery(selector);
	    
	    // parse all children
	    actionsJq.each(function(i)
	    {
	      thisJq = jQuery(this);
	      // basic parameter
	      var type = this.nodeName;
	      var action = thisJq.attr("action");
	      var value = thisJq.text();
	      var subActionsJq = thisJq.children("animation");
	      // animation parameter
	      var animationSequence = thisJq.attr("sequence");
	      var animationEvent = thisJq.attr("event");
	      
	      switch (type.toLowerCase()) 
	      {
	        case 'html':
	          // adding and repalcing content
	          if(action == "replace") selectedElementsJQuery.html(value);
	          else if(action == "remove") selectedElementsJQuery.remove();
              else selectedElementsJQuery.append(value);
	          break;
	        case 'class':
	          // adding and repalcing css classes
	          if(action == "replace") selectedElementsJQuery.removeClass().addClass(value.trim());
              else if(action == "remove")
              	(value.trim().length === 0) ? selectedElementsJQuery.removeClass() : selectedElementsJQuery.removeClass(value.trim());
	          else selectedElementsJQuery.addClass(value.trim());
	          break;
	        case 'id':
	          // replacing the ID
	          selectedElementsJQuery.attr("id", value.trim());
	          break;  
	        case 'styles':
	          // addign and replacing css styles
	          var oldStyle = (typeof selectedElementsJQuery.attr("style") == "undefined") ? "" : selectedElementsJQuery.attr("style").trim();
	          if(action == "replace") selectedElementsJQuery.removeAttr("style").attr("style",value.trim());
              else if(action == "remove") selectedElementsJQuery.removeAttr("style");
	          else selectedElementsJQuery.attr("style", oldStyle + value.trim());
	          break;
	        case 'animations':
	            // Event type
	            var animationEvent = thisJq.attr("event");
	            // bind event
	            if(typeof animationEvent != "undefined")
	            {
	              // couldn't find the event 
	              if(jQuery.inArray(animationEvent, _supportedEvents) == -1)
	                throw ("Parsing Error: Unexpected event action: " + animationEvent);
	              else
	                // parse and run the animations
	                subActionsJq.each(function(){
	                  var animationXmlJq = jQuery(this);
	                  selectedElementsJQuery.live(animationEvent, function(){
	                    _modificationAnimation(selectedElementsJQuery, animationXmlJq);
	                  });
	                });
	            }
	            // just run the animations
	            else
	            {
	              // parse and run the animations
	              subActionsJq.each(function(){
	                _modificationAnimation(selectedElementsJQuery, jQuery(this));
	              });
	            };
	          break;
	            
	        default:
	          throw ("Unexpected template element found: " + type);
	      };
	    });
	  };
	  
	  // runs the animation part of the jquery modifications (recursive)
	  function _modificationAnimation(pSelectedElementsJQuery, pAnimationXmlJq)
	  {
	    // animation parameter
	    var animationName = pAnimationXmlJq.attr("name");
	    var animationSpeed = (typeof pAnimationXmlJq.attr("speed") != "undefined") ? pAnimationXmlJq.attr("speed") : 0;
	    var animationOpacity = (typeof pAnimationXmlJq.attr("opacity") != "undefined") ? pAnimationXmlJq.attr("opacity") : 0;
	    var animationTop = pAnimationXmlJq.attr("top");
	    var animationBottom = pAnimationXmlJq.attr("bottom");
	    var animationLeft = pAnimationXmlJq.attr("left");
	    var animationRight = pAnimationXmlJq.attr("right");
	    var animationWidth = pAnimationXmlJq.attr("width");
	    var animationHeight = pAnimationXmlJq.attr("height");
	    var animationValueObj = jQuery.parseJSON(pAnimationXmlJq.attr("value"));
	    
	    //selected element for animation
	    var selectedElementsJQuery = (typeof pAnimationXmlJq.attr("selector") != "undefined") ? jQuery(pAnimationXmlJq.attr("selector")) : pSelectedElementsJQuery;
	    
	    // any following animations?
	    var followingAnimation = function(){};
	    if(pAnimationXmlJq.children("animation").size() > 0)
	      followingAnimation = function()
	      {
	        // parse and run the following animations
	        pAnimationXmlJq.children("animation").each(function(){
	          _modificationAnimation(selectedElementsJQuery, jQuery(this));
	        });
	      };
	    
	    // animation type             
	    switch(animationName.toLowerCase()) 
	    {
	      case 'animation':
		      selectedElementsJQuery.animate(animationValueObj, animationSpeed);
	        break;
	      case 'delay':
		      setTimeout(followingAnimation,animationSpeed);
	        break;
	      case 'hide':
	          selectedElementsJQuery.hide(animationSpeed, followingAnimation);
	        break;
	      case 'show':
	          selectedElementsJQuery.show(animationSpeed, followingAnimation);
	        break;
	      case 'fadein':
	          selectedElementsJQuery.fadeIn(animationSpeed, followingAnimation);
	        break;
	      case 'fadeout':
	          selectedElementsJQuery.fadeOut(animationSpeed, followingAnimation);
	        break;
	      case 'fadeto':
	          selectedElementsJQuery.fadeTo(animationSpeed, animationOpacity, followingAnimation);
	        break;
	      case 'slideup':
	          selectedElementsJQuery.slideUp(animationSpeed, followingAnimation);
	        break;
	      case 'slidedown':
	          selectedElementsJQuery.slideDown(animationSpeed, followingAnimation);
	        break;
	      case 'moveto':
	          if(selectedElementsJQuery.css("position") == "static")
	            selectedElementsJQuery.css("position","relative");
	          var newPositionObj = new Object();
	          if(typeof animationTop != "undefined")
	            newPositionObj.top = animationTop;
	          if(typeof animationBottom != "undefined")
	            newPositionObj.bottom = animationBottom;
	          if(typeof animationLeft != "undefined")
	            newPositionObj.left = animationLeft;
	          if(typeof animationRight != "undefined")
	            newPositionObj.right = animationRight;
	          
	          selectedElementsJQuery.animate(newPositionObj, animationSpeed, followingAnimation);
	        break;
	      case 'resizeto':
	          var newSizeObj = new Object();
	          if(typeof animationWidth != "undefined")
	            newSizeObj.width = animationWidth;
	          if(typeof animationHeight != "undefined")
	            newSizeObj.height = animationHeight;
	            
	          selectedElementsJQuery.animate(newSizeObj, animationSpeed, followingAnimation);
	        break;
	      case 'shake':
	          var eachSpeed = parseInt(animationSpeed) / 5;
	          if(selectedElementsJQuery.css("position") == "static")
	            selectedElementsJQuery.css("position", "relative");
	          selectedElementsJQuery
	            .animate({ left: "+=5"}, eachSpeed)
	            .animate({ left: "-=10"}, eachSpeed)
	            .animate({ left: "+=10"}, eachSpeed)
	            .animate({ left: "-=10"}, eachSpeed)
	            .animate({ left: "+=10"}, eachSpeed)
	            .animate({ left: "-=5"}, eachSpeed, followingAnimation);
	        break;
	      case 'setcss':
	          selectedElementsJQuery.css(animationValueObj);
	          followingAnimation();
	        break;
	      default: 
	        throw ("Parsing Error: Unexpected animation: " + animationName);
	    };
	  };
	
	  return this;
	};
})(jQuery);	
