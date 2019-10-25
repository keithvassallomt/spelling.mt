$(document).ready(function() {
  bindFlags();
  translate();
});

function bindFlags() {
  $('.lang_flag').click(function() {
    let siteLang = $(this).data('lang');
    localStorage.setItem('siteLang', siteLang);
    translate();
  });
}

function translate() {
  let siteLang = localStorage.getItem('siteLang');
  let strings = $('[data-string]');

  $.getJSON("/strings.json", function(stringsArr){
    $.each(strings, function(id, string){
      let stringName = $(this).data('string');
      let text = stringsArr.find(obj => {
        return obj.id === stringName
      });
      if (text && text[siteLang]) {
        $(this).html(text[siteLang]);
      }
    });
  });
}
