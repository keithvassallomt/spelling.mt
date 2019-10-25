var dictionary;
var spellingErrors = [];
var mt_check;
var selectedText;

$( document ).ready(function() {
  dictionary = new Typo("mt_MT", false, false, {
    dictionaryPath: "js/typo/dictionaries",
    asyncLoad: true,
    loadedCallback: onDictLoaded
  });
});

function onDictLoaded() {
  $('#loading_dict').remove();
  checkSpelling();
  bindListeners();
}

function bindListeners() {
  mt_check = $('.mt_check').highlightWithinTextarea({
    highlight: highlightWords
  });
  $('.mt_check').keyup(function(e) {
      if(e.keyCode == 32 || e.keyCode == 8 || e.keyCode == 46) { // space/backspace/delete
          checkSpelling();
      }
  });
  $(".mt_check").on('paste', function() {
    checkSpelling();
  });

  $('.mt_check').on('long-press', function(e){
    e.preventDefault();
    selectedText = getTouchSelectionText();
    suggestions = getSuggestions(selectedText);
    showContextMenu(suggestions);
  });

  // All of the below is for the context menu
  // Show the menu when a word in the textarea is right-clicked
  $(".mt_check").bind("contextmenu", function(event) {
    event.preventDefault();
    selectedText = getSelectionText();
    suggestions = getSuggestions(selectedText);
    showContextMenu(suggestions);
  });

  // Hide the menu if anywhere else is clicked
  $(document).bind("mousedown", function(e) {
    if (!$(e.target).parents(".custom-menu").length > 0) {
      $(".custom-menu").hide(100);
    }
  });

  // If the menu element is clicked
  $(document).on('click', 'ul.custom-menu li', function(){
    switch ($(this).attr("data-action")) {
      case "no":
        break;
      case "search":
        window.open('https://www.google.com/search?q='+selectedText, '_blank');
        break;
      default:
        let userText = $('.mt_check').val();
        let replacementWord = $(this).attr("data-action");
        let re = new RegExp("\\b" + selectedText + "\\b", "g");
        userText = userText.replace(re, replacementWord);
        $('.mt_check').val(userText);
        $('.mt_check').highlightWithinTextarea('update');
        break;
    }
    $(".custom-menu").hide(100);
  });
}

function showContextMenu(suggestions) {
  let menuEntries = "";
  $.each(suggestions, function(i, suggested){
    menuEntries += "<li data-action='" + suggested + "'>" + suggested + "</li>";
  });
  if (menuEntries == "") {
    menuEntries = "<li data-action='no'>No suggestions</li>";
  }
  menuEntries += "<li data-action='search'>Search Google for ''" + selectedText + "''</li>";
  $('.custom-menu').html(menuEntries);

  // Show contextmenu
  $(".custom-menu").finish().toggle(100).css({
    top: (event.pageY - $('#mt_spell_cont').position().top) + "px",
    left: (event.pageX - parseInt($('#mt_spell_cont').css('marginLeft'))) + "px"
  });
}

function checkSpelling() {
  let userText = $('.mt_check').val();
  spellingErrors = [];

  // Remove hyphens
  userText = userText.replace(/-/g, ' ');

  $.each(userText.split(' '), function(i, word) {
    word = word.replace(/[.,?!\s]/g, ''); // Remove punctuation
    if (!dictionary.check(word)) {
      spellingErrors.push(word);
    }
  });

  $(mt_check).highlightWithinTextarea('update');
}

function highlightWords() {
  if (spellingErrors.length == 0) return;

  let highlightArr = [];
  $.each(spellingErrors, function(i, word) {
    let highlightObj = {};
    highlightObj.highlight = word;
    highlightObj.className = 'red';
    highlightArr.push(highlightObj);
  });
  return highlightArr;
}

function getSuggestions(word) {
  return dictionary.suggest(word);
}

function getSelectionText() {
  var text = "";
  var activeEl = document.activeElement;
  var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
  if (
    (activeElTagName == "textarea" || activeElTagName == "input") &&
    /^(?:text|search|password|tel|url)$/i.test(activeEl.type) &&
    (typeof activeEl.selectionStart == "number")
  ) {
    text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
  } else if (window.getSelection) {
    text = window.getSelection().toString();
  }
  return text;
}

function getTouchSelectionText() {
  var sel_obj = window.getSelection();
  sel_obj.modify("move","forward","character");
  sel_obj.modify("extend","backward","word");

  sel_obj.modify("move","backward","character");
  sel_obj.modify("extend","forward","word");

  var text = sel_obj.toString().trim();
  text = text.replace(/(^,)|(,$)|(^\.)|(\.$)/g, ""); // remove commas and fullstops
  return text;
}
