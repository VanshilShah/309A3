

var components = [
    'navbar',
    'login',
    'courses',
    'friends'
]

var pages = [
    'login',
    'courses',
    'friends'
]

function main() {
    loadComponents()
    showPage('courses')
    console.log('main function called.')
}

function loadComponents() {
    for (var i = 0, len = components.length; i < len; i++) {
        (function () {
        var componentName = components[i]
        var componentPath = 'components/' + componentName + '/' + componentName
            
        $('<link/>', {
            rel: 'stylesheet',
            type: 'text/css',
            href: componentPath + '.css'
        }).appendTo('head');
        
        $('#' + componentName).load(componentPath + '.html', function () {
            $.getScript(componentPath + '.js', function (data, status) {
                
            })
        })
        })()
    }
}

function showPage(pageName){
    for (var i = 0, len = pages.length; i < len; i++) {
        $('#' + pages[i]).hide()
        $('#navbar-' + pages[i]).removeClass('navbar-item-active')
    }
    $('#' + pageName).show()
    $('#navbar-' + pageName).addClass('navbar-item-active')
}

$(document).ready(main);
