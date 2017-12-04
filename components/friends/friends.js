var friendsArray = [
    {
      "picture": {
        "data": {
          "is_silhouette": false,
          "url": "https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/13413617_10104041397957993_6420279511853818443_n.jpg?oh=0efcb9f5b0a970d9bbe57bbcdc05d1ae&oe=5A6CF326"
        }
      },
      "name": "Andrew Noonan",
      "id": "10103903551767863"
    },
    {
      "picture": {
        "data": {
          "is_silhouette": false,
          "url": "https://scontent.xx.fbcdn.net/v/t1.0-1/c56.107.575.575/s50x50/22049882_10159332882385257_5538387886090512159_n.jpg?oh=ed4288259b4cb3be26796c25ef2c2d96&oe=5A9ED369"
        }
      },
      "name": "Maria Attarian",
      "id": "10154213249510257"
    },
    {
      "picture": {
        "data": {
          "is_silhouette": false,
          "url": "https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/13435444_10153652407615869_8830619443597690481_n.jpg?oh=63cdf56d1801878144ceabd3151ac15e&oe=5AA6E9A5"
        }
      },
      "name": "James Gibbons",
      "id": "505330868"
    },
    {
      "picture": {
        "data": {
          "is_silhouette": false,
          "url": "https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/18157995_10154643040527404_5027267980336181938_n.jpg?oh=6061ed4c13c26afaf6240af8bd24b579&oe=5A68EF71"
        }
      },
      "name": "James Mishra",
      "id": "507427403"
    },
    {
      "picture": {
        "data": {
          "is_silhouette": false,
          "url": "https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/12644822_10153851910698704_2542036767312240303_n.jpg?oh=45de5fffb168d046be92073a2f99043c&oe=5AA76DCA"
        }
      },
      "name": "Aashni Shah",
      "id": "517148703"
    },
    {
      "picture": {
        "data": {
          "is_silhouette": false,
          "url": "https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/6262_10151579946588903_165426248_n.jpg?oh=7b82d647f0cbe77987a78ae1ebbe1add&oe=5AAE21B5"
        }
      },
      "name": "Edward Jiang",
      "id": "586603902"
    },
    {
      "picture": {
        "data": {
          "is_silhouette": false,
          "url": "https://scontent.xx.fbcdn.net/v/t1.0-1/c0.2.50.50/p50x50/21751661_10154682395031852_621252080632162237_n.jpg?oh=2eea27b5392e07dd24a1094032327383&oe=5A675E92"
        }
      },
      "name": "Peter McKee",
      "id": "10152393675876852"
    }
  ];

var friendCalendar = newCalendar('friend-calendar', null)
friendData.addObserver(friendCalendar.onDataChanged)

var friends = (function(){
    var obj = {}
    
    var friendsList = $('#friends-list')
    
    var friendItem = function (friend) {
        return `
        <div class="friend-item primary-bg accent-bg-hover user-course-item" onclick="displayFriendSchedule('${friend.id}')">
            <img class="friend-image" src="${friend.picture.data.url}"></img>
            <p class="flex-item center-text">${friend.name}</p>
        </div>
        `
    }
    
    obj.clearFriends = function () {
        friendsList.empty()
    }

    obj.loadFriends = function(data){
        obj.clearFriends()
        
        for(var i = 0; i < data.length; i++){
            friendsList.append(friendItem(data[i]))
        }
    }

    // obj.loadFriends($('#friends-list'));
    
    function onUserChanged(userID) {
        if (userID) {
            fbInterface.getFriends(function (data) {
                obj.loadFriends(data.data);
            })
        } else {
            obj.clearFriends()
        }
    }
    
    fbInterface.addObserver(onUserChanged)

    return obj
})()

function displayFriendSchedule(friendID) {
    // alert('Cannot display friend\'s schedule:\nNo backend implemented yet.')
    friendData.onUserChanged(friendID, null)
}

function findFriends(){
    alert("Not implemented yet.");
}

$('#message-input-box').keydown(function (e) {
    if ($('#message-input-box').val().length === 0) {
        return
    }
    $('#message-input-box').val('')
    
    var code = e.keyCode || e.which
    if (code == 13){ // enter
        var url = {
            url: '/api/messages',
            qs: {}
        }
        var message = {
            body: $('#message-input-box').val()
        }
        requestPromise(url, message, 'POST')
        .then(function (data) {
            refreshMessages()
        })
        .catch(function (err) {
            console.log(err);
        })
    }
})

function refreshMessages() {
    var url = {
        url: '/api/messages',
        qs: {}
    }
    requestPromise(url)
    .then(function (data) {
        if (data) {
            var msg = ''
            for (var i = 0, len = data.length; i < len; i++) {
                msg += '<b>' + data[i].id + '</b>' + ': ' + data[i].message.body + '<br>'
            }
            $('#msg-text').html(msg)
        }
    })
    .catch(function (err) {
        console.log(err);
    })
}

setInterval(refreshMessages, 1000)
