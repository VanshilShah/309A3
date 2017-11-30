/*
function main() {
    showPage('Friends');
    console.log('main function called.');
}

function showPage(pageName){
  $('#Login').hide();
  $('#Courses').hide();
  $('#Friends').hide();
  $('#' + pageName).show();
}

$(document).ready(main);
*/

$('form').submit(function () {

    // Get the Login Name value and trim it
    var name = $.trim($('#Username').val());
    var pw = $.trim($('#Password').val());

    // Check if empty of not
    if (name  === '' || pw === '') {
        alert('Text-field is empty.');
        return false;
    }
});
