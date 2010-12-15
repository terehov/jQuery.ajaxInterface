$(document).ready(main);

function main()
{
  jQuery.ajaxInterface({
    url: "template.xml",
    async: true,
    success: function(pData)
    {
    	//alert('###: ' + pData);
        console.log(pData);
    } 
  });

}
