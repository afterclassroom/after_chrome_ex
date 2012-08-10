var timeout;

function hidepanel() {
            $('#tick_to_click').hide();
        }
   
        function doTimeout(){
            clearTimeout(timeout);
            timeout = setTimeout(hidepanel, 100);
        }