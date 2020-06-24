$(document).ready(function() {
    pageTranslate();
  });

function pageTranslate() {
    let siteLang = localStorage.getItem('siteLang');
    
    if (siteLang === null) {
        siteLang = "en";
    }

    let switchImages = $('[data-switchimg]');
    $.each(switchImages, function() {
        let filename = 'images/' + $(this).data('switchimg') + '_' + siteLang + '.png';
        $(this).attr('src', filename);
    });

    if (siteLang === "en") {
        $('#wordleech_en_video').show();
        $('#wordleech_mt_video').hide();
    } else if (siteLang === "mt") {
        $('#wordleech_en_video').hide();
        $('#wordleech_mt_video').show();
    }
}