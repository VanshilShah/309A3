
var navbar = (function () {
    var obj = {}

    var pages = [
        'login',
        'courses',
        'friends',
        'about'
    ]

    obj.showPage = function (pageName) {
        for (var i = 0, len = pages.length; i < len; i++) {
            $('#' + pages[i]).removeClass('hidden')
            $('#' + pages[i]).hide()
            $('#navbar-' + pages[i]).removeClass('navbar-item-active')
        }
        $('#' + pageName).show()
        $('#navbar-' + pageName).addClass('navbar-item-active')
        if(pageName === "login"){
          $('#navbar-friends').addClass('navbar-item-active')
        }
        $(window).trigger('resize')
    }

    obj.showPage('courses')

    return obj
})()
