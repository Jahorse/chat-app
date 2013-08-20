var username = null;
var socket = null;

$(document).ready(function() {
	
	// Set up creating a username and connecting to the chat server \
	$('#usernameSubmit').click(connectToServer); //					|
	//																|
	$('#usernameInput').keypress(function(e) { //					|
		if (e.keyCode == 13) { //									|
			connectToServer(); //									|
		} //														|
	}); //															|
	// -------------------------------------------------------------/
	
	// Set up a monitoring function to keep window placement while new messages are added --\
	var monitor = function() { //															|
	    var $this = $(this), //																|
	        wrap = $this.find('#innerChitChatBox'), //										|
	        height = $this.height(), //														|
	        maxScroll = wrap.height() - height, //											|
	        top = $this.scrollTop(); //														|
	    if (maxScroll >= (top - 10) && maxScroll <= (top + 10)) { //						|
	        $this.addClass('atBottom'); //													|
	    } else { //																			|
	        $this.removeClass('atBottom'); //												|
	    } //																				|
	}; //																					|
	//																						|
    window.setInterval(function() { //														|
        monitor.call($('#chitChatBox').get(0)); //											|
    }, 350); //																				|
    // -------------------------------------------------------------------------------------/
    
	$('#chitChatBox').bind('addMessage', function(e, message) {
	    var $this = $(this),
	        top = $this.scrollTop(),
	        scroll = $this.hasClass('atBottom');
	    $this.find('#innerChitChatBox').append(message);
	    if (scroll) {
	        var wrap = $this.find('#innerChitChatBox'),
	            height = $this.height(),
	            maxScroll = wrap.height() - height;
	        $this.scrollTop(maxScroll);
	    }
	});
	
	// Set up submitting messages-------------------\
	$('#messageSubmit').click(sendMessage); //		|
	//												|
	$('#messageInput').keypress(function(e) { //	|
		if (e.keyCode == 13) { //					|
			sendMessage(); //						|
		} //										|
	}); //											|
	// ---------------------------------------------/
});

function connectToServer(){
	if ($('#usernameInput').val() != '') {
		username = $('#usernameInput').val();
		
		socket = io.connect('http://localhost:5000');
		
		socket.emit('username', { username: username });
		
		socket.on('userListUpdate', function (data) {
			updateUserList(data.userList);
			console.log(data);
		});

		socket.on('message', function (data) {
			receiveMessage(data.message);
			console.log(data);
		});
		
		$('#usernameInput').attr('disabled', 'disabled');
		$('#usernameSubmit').val('Connected');
		$('#usernameSubmit').attr('disabled', 'disabled');
	} else {
		alert("Please enter a username")
	}
}

function updateUserList(userList){
	$('#userListContainer').html(userList);
}

function sendMessage() {
	if (username && socket) {
		if ($('#messageInput').val() != '') {
			var message = '';
	
			message = username + ": <span style='color:" + $('#colorPicker').val() + ";'>" + $('#messageInput').val() + "</span><br/>";
	
			socket.emit('message', { message: message });
		    $('#messageInput').val('');
		    $('#messageInput').focus();
		}
	} else {
		alert("Please enter a username");
	}
}

function receiveMessage(message) {
	$('#chitChatBox').trigger('addMessage', message);
}