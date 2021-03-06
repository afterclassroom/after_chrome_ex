/*
 * Copyright 2011 Google Inc. All Rights Reserved.

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var pesome = new OAuth2('pesome', {
  client_id: '38af2b99adb35fba6add3baca152fef4',
  client_secret: '31d1cf26470694e442d1324a9ac98be6',
  api_scope: 'public'
});

pesome.authorize(function() {

	$('#loading').hide();
	$('#form_tick').show();
	
	$('#linkto_classroom').click(function(){
		chrome.tabs.create({'url' : $(this).attr('href')});  
	});
	
	var URL = 'http://pesome.com';
	
	callApi('getMe', URL + '/api/users/me', 'GET', '');
	callApi('tagList', URL + '/api/tags/list', 'GET', '');
	callApi('members', URL + '/api/petopics/all_members', 'GET', '');
	
	chrome.tabs.getSelected(null,function(tab) {
	   var link = tab.url;
	   var params = 'link=' + escape(link);
	   callApi('tickAttach', URL + '/api/peticks/attach_link', 'POST', params);
	   $('#link').html(link);
	   $('#link').attr('href', link);
	});
	
	function callApi(action, path, method, params) {
    // Make an XHR that creates the task
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(event) {
      if (xhr.readyState == 4) {
        if(xhr.status == 200) {
          // Great success: parse response with JSON
		  results = JSON.parse( xhr.responseText );
		  str_f = action + '(results)';
		  eval(str_f);
        } else {
          // Request failure: something bad happened
          $('#message').text('Error. Status returned: ' + xhr.status);
        }
      }
    };

    xhr.open(method, path, true);
	
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Content-length', params.length);
    xhr.setRequestHeader('Connection', 'close');
	
    xhr.setRequestHeader('Authorization', 'Bearer ' + pesome.getAccessToken());
    xhr.send(params);
  };
  
  function getMe(results){
	var id = jsonPath(results, '$.user.id');
	var name = jsonPath(results, '$.user.name');
	var image = jsonPath(results, '$.user.image');
	
	var link_mytick = URL + "/my_posts";
	
	$('.userImage').attr('src', image);
	$('.userName').html(name.toString());

	$('.myTick').click(function(){
		chrome.tabs.create({'url' : link_mytick});
	});
  }
  
  function tagList(results){
	var list = jsonPath(results, '$.list').toString();
	var arr = list.split(',');
	$('#tags').select2({
		tags: arr
	});
  }
  
  function members(results){
	var classrooms = jsonPath(results, '$..petopic');
	var cl_list = $('#cl_list');
	jQuery.each(classrooms, function(i, v) {
		var st = '<li><a href="#"><label class="checkbox"><input name="classroom_ids[]" value="' + v.id + '" type="checkbox" /><span>' + v.title + '</span></label></a></li>';
		cl_list.append(st);
   });

   $('.click-ctick').click(function() {
    clearTimeout(timeout);
    $("#tick_to_click").show();
   });
   
   $('#tick_to_click').mouseleave(doTimeout);
  }
  
  function tickAttach(results){
	var title = jsonPath(results, '$.openstruct.title').toString();
	var description = jsonPath(results, '$.openstruct.description').toString();
	var provider = jsonPath(results, '$.openstruct.provider').toString();
	var image = jsonPath(results, '$.openstruct.image').toString();
	
	if (provider == 'false' && image != 'false'){
		description = '<span style="float: left;margin-right: 10px"><img src="' + image + '" style="height: 145px;width: 145px"></span>' + description;
	}
	
	if (title != 'false'){
		$('#title').val(title);
	}
	if (description != 'false'){
		$('#description').html(description);
	}
	$('#send_bt').removeAttr('disabled');
	$('#send_bt').click(function(){
		if ($('input[name="classroom_ids[]"]:checked').length > 0){
			$('#send_bt').button('loading');
			saveTick();
		}else{
			$('#alertModal').modal('show');
		}
	});
  }
  
  function saveComplete(results){
	$('#send_bt').button('complete');
	$('#send_bt').unbind();
	$('#send_bt').click(function(){
		window.close();
	});
  }
  
  function saveTick(){
	var link = $('#link').attr('href');
	var title = $('#title').val();
	var tags = $('#tags').val();
	var val = [];
    $('input[name="classroom_ids[]"]:checked').each(function(i){
      val[i] = $(this).val();
    });
	var params = 'link=' + escape(link) + '&title=' + title + '&tags=' + tags + '&petopic_ids=' + val;
	callApi('saveComplete', URL + '/api/peticks', 'POST', params);
  }
});