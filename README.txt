jQuery.ajaxInterface V0.9.1

"you can cause any frontend modifications without writing a single line of javascript code!"

More information under: http://terehov.de#projects

SUMMARY:
- fast dynamization of existing back-end systems
- backend systems are good at generating HTML or XML (generation, validation, delivery)
- 5KB
- LGPL
- same browser support as the current jQuery version

jQuery.ajaxInterface is a XML wrapper for jQuery.
It's a powerful tool for quickly turning an entire website into an AJAX application and at the same time putting the power of jQuery into the hands of backend developers and template editors.

Idea

With the help of the jQuery.ajaxInterface you get a standardized way of realizing any frontend adjustments by simply generating an XML document the way you would generate a normal HTML page.

jQuery.ajaxInterface is abstracting the jQuery JavaScript code into an easy readable, editable and first of all generatable XML file.
You can replace any frontend content and meta information with the help of a small XML file (e.g. a template) without writing even one single line of JavaScript code!



Example

This example adds new content to the page and changes the page title:
--------------------------------------------
<?xml version="1.0"?>
<jquery>

  <setTitle>new page title</setTitle>
  <css>
    <file action="add" src="css/style.css" />
  </css>

  <setSelector value="body">
    <html action="append">
      <![CDATA[
        <h1>new content!</h1>
      ]]>
    </html>
    <setSelector value="body h1">
      <animation action="bind" event="click" name="shake" speed="1500">
        <animation event="click" name="fadeOut" speed="1000" />
      </animation>
    </setSelector>
  </setSelector>

  <response>
    true
  </response>
</jquery>
--------------------------------------------

The only thing you need to do in frontend is to add the library and load the links and submit the forms through the jQuery.ajaxInterface, which is like a tiny layer over the original jQuery AJAX functionality and has exactly the same API, including synchronous and asynchronous requests over POST and GET.

--------------------------------------------
<script src="jquery.js"></script>
<script src="jquery.ajaxinterface.js"></script>

// Turn all links into ajaxInterface requests
$('a').click(function(){ 
  $.ajaxInterface({url: this.href});
  return false; 
});
--------------------------------------------


Why?

So, you still wonder what you need it for?
Compared to a normal HTML file you have a time axis for a number of animations. You can run them one after the other, or bind them to events right through this one file. You can even include other libraries, call JavaScript functions and even start nested ajaxInterface calls. You have the option to add an optional parameter (e.g. "ajax=true") to every ajaxInterface request. In this case you gain the opportunity to separate the type of the request in backend and deliver either the common HTML file or just the altering part with the ajaxInterface XML document.