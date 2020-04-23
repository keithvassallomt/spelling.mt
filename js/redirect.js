$( document ).ready(function() {
    if (window.location.host == "linux.org.mt") {
        if (window.location.host == "/spellcheck") {
            window.location.replace("https://spelling.mt/check.html?redirect=mlug");
        }
        window.location.replace("https://spelling.mt/mlug.html");
    }
});