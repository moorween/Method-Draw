function loadFont(font) {
  if (!$(`head > [data-fid="${font}"]`).length) {
    console.log('Loading font: ' + font);
    $('head').append(`<link href="https://fonts.googleapis.com/css?family=${font}" rel="stylesheet" data-fid="${font}">`);
  }
}

methodDraw.addExtension("Google Fonts", function (S) {
  if ($('#font_family_dropdown').length) {
    $('#font_family_dropdown > option').remove();

    $('#font_family_dropdown').on('change', function(e) {
      loadFont(e.target.value);
    })

    $.getJSON('gfonts.json', function (data) {
      $.each(data.fonts, function(_, val) {
        var option = $(`<option ${val.default ? 'selected="selected"' : ''} value="${val.name}">${val.name}</option>`);
        $('#font_family_dropdown').append(option);

        if (val.default) {
          $('#font_family_dropdown').val(val.name).change();
        }
      })
    });
  }

  return {
    name: "Google Fonts",
    // For more notes on how to make an icon file, see the source of
    // the hellorworld-icon.xml
    svgicons: "extensions/helloworld-icon.xml",

    // Multiple buttons can be added in this array
    buttons: [],
    // This is triggered when the main mouse button is pressed down
    // on the editor canvas (not the tool panels)
    mouseDown: function () {
    },

    // This is triggered from anywhere, but "started" must have been set
    // to true (see above). Note that "opts" is an object with event info
    mouseUp: function (opts) {
    }
  };
});

