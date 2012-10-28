var username = null;
var socket = null;

$(document).ready(function() {
	
	$('#usernameSubmit').click(connectToServer);
	
	$('#usernameInput').keypress(function(e) {
		if (e.keyCode == 13) {
			connectToServer();
		}
	});
	
	var monitor = function() {
	    var $this = $(this),
	        wrap = $this.find('#innerChitChatBox'),
	        height = $this.height(),
	        maxScroll = wrap.height() - height,
	        top = $this.scrollTop();
	    if (maxScroll >= (top - 10) && maxScroll <= (top + 10)) {
	        $this.addClass('atBottom');
	    } else {
	        $this.removeClass('atBottom');
	    }
	}
	
    window.setInterval(function() {
        monitor.call($('#chitChatBox').get(0));
    }, 350);
    
	$('#chitChatBox').bind('addMessage', function(e, message) {
	    var $this = $(this),
	        top = $this.scrollTop(),
	        scroll = $this.hasClass('atBottom');
	    $this.find('#innerChitChatBox').append(message);
	    if (scroll) {
	        var wrap = $this.find('#innerChitChatBox'),
	            height = $this.height(),
	            maxScroll = wrap.height() - height
	        $this.scrollTop(maxScroll);
	    }
	});
	
	$('#messageInput').keypress(function(e) {
		if (e.keyCode == 13) {
			sendMessage();
		}
	});
	
	$('#messageSubmit').click(sendMessage);
});

function connectToServer(){
	if ($('#usernameInput').val() != '') {
		username = $('#usernameInput').val();
		
		socket = io.connect('http://localhost:3000');
		socket.emit('username', { username: username });
		socket.on('message', function (data) {
			receiveMessage(data.message);
			console.log(data);
		});
		
		$('#usernameInput').val('');
		$('#usernameInput').attr('placeholder', username);
	} else {
		alert("Please enter a username")
	}
}

function sendMessage() {
	if (username && socket) {
		if ($('#messageInput').val() != '') {
			var message = '';
	
			message = "<span style='color:" + $('#colorPicker').val() + ";'>" 
					+ username + ": " + $('#messageInput').val() + "</span><br/>";
	
			socket.emit('message', { message: message });
			$('#chitChatBox').trigger('addMessage', message);
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