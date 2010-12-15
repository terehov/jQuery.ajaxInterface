jQuery.ajaxInterface V0.8

Summary:
jQuery.ajaxInterface is a XML wrapper for jQuery. 
It's a powerful tool for quickly turning an entire website into an AJAX application and at the same time putting the power of jQuery into the hands of backend developers and template editors. 

Idea:
jQuery.ajaxInterface is abstracting the jQuery JavaScript code into an easy readable, editable and first of all generatable XML file.  

With the help of a small XML file (e.g. a template) you can replace any frontend content and meta information without writing even one single line of JavaScript code!

Roadmap:
The next version is going to add support for jQuery plugins like jQuery UI. 

Example:
This example adds new content to the page and changes the page title:
<?xml version="1.0" ?>
<jquery>
  <content>
    <title>new page title</title>
    <modification selector="body">
      <html action="append">
        <![CDATA[
          <h1>new content!</h1>
        ]]>
      </html>
    </modification>
  </content>
</jquery>

The only thing you need to do in frontend is to add the library and load the links through the jQuery.ajaxInterface, which is like a tiny layer over the original jQuery Ajax functionality and has exactly the same APIÑincluding synchronous and asynchronous requests over POST and GET.

<script src="jquery.js"></script>
<script src="jquery.ajaxinterface.js"></script>

// Turn all links into ajaxInterface requests
$('a').click(function(){ 
	$.ajaxInterface({url: this.href});
	return false; 
});

Why?
jQuery.ajaxInterface comes pretty handy, when you have a certain backend functionality and would like to boost the performance of your web application with the help of AJAX.
In this case you can either deliver the content the common way (by generating the whole page with every single request), or create just the altering part describing the exact position it has to be added to with the help of this XML file. You can even combine both possibilities by adding a parameter (like "ajax=true") to every ajaxInterface request. In this case you could add a simple if-statement to decide whether the whole page needs to be generated or just the altering part. 