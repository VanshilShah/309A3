var login = (function(){
    var obj = {}
    
    obj.ifLoggedIn = function (callback) {
        $('#login-text').text('Loading ...')
        $('#fb-login-btn').addClass('hidden')
        
        fbInterface.checkLoginState(function (response) {
            if (response && response.status == 'connected') {
                $('#navbar-logout').removeClass('hidden')
                $('#navbar-friends').text('Friends')
                if (callback) {
                    callback()
                }
            }
            else {
                $('#login-text').text('Login with Facebook to share your schedule')
                $('#fb-login-btn').removeClass('hidden')
            }
        })
    }
    
    obj.gotoFriends = function () {
        navbar.showPage('friends')
    }
    
    obj.gotoCourses = function () {
        navbar.showPage('courses')
    }
    
    obj.tryLogOut = function () {
        if (confirm("Are you sure you want to log out?")) {
            FB.logout(function (respose) {
                $('#navbar-logout').addClass('hidden')
                $('#navbar-friends').text('Log In')
                navbar.showPage('login')
                obj.ifLoggedIn(obj.gotoFriends)
            })
        }
    }
    
    return obj
})()
