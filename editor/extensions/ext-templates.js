methodDraw.addExtension("Templates", function () {
  $('head').append('<link rel="stylesheet" href="extensions/ext-templates.css"/>');
  var canv = methodDraw.canvas;
  var data;
  var newElement;

  return {
    svgicons: "extensions/ext-templates.xml",
    buttons: [{
      id: "tool_templates",
      type: "mode_flyout", // _flyout
      position: 7,
      title: "Templates",
      icon: "extensions/brackets.png",
      events: {
        "click": function() {
            canv.setMode('templates');
            $('#tools_templates').fadeIn();
        }
      }
    }],
    callback: function() {
        var templates = $('<div id="templates">');

        $.getJSON('prefs.json', function (prefs) {
            $.each(prefs.templates, function (_, val) {
                var item = $(`<div data-type="${val.type}" data-template="${val.template}">${val.title}</option>`);
                $(templates).append(item)
            })

        });

        $('#tools_templates').append(templates);
        $('#tool_templates').remove();

        var h = $('#tools_templates').height();
        $('#tools_templates').css({
            'margin-top': -(h/2),
            'margin-left': 3
        });

        $(templates).mouseup(function(evt) {
            data = evt.target.dataset;
            $('.tools_flyout').fadeOut();
            canv.setMode(data.type);
        });
    },
    // This is triggered when the main mouse button is pressed down
    // on the editor canvas (not the tool panels)
    mouseDown: function (opts) {
        var mode = canv.getMode();
        var style = canv.getStyle();
        var typeMatch = false;

        switch (mode) {
            case 'text_template':
                newElement = canv.addSvgElementFromJson({
                    "element": "text",
                    "curStyles": true,
                    "attr": {
                        "x": opts.start_x,
                        "y": opts.start_y,
                        "id": canv.getNextId(),
                        "fill": style.fill,
                        "stroke-width": style.stroke_width,
                        "font-size": canv.getFontSize(),
                        "font-family": canv.getFontFamily(),
                        "text-anchor": "start",
                        "xml:space": "preserve",
                        "opacity": style.opacity
                    }
                });
                newElement.textContent = data.template;
                typeMatch = true;
                break;
            case 'image_template':
                newElement = canv.addSvgElementFromJson({
                    "element": 'image',
                    "attr": {
                        "x": opts.start_x,
                        "y": opts.start_y,
                        "width": 300,
                        "height": 150,
                        "id": canv.getNextId(),
                        "opacity": canv.getStyle().opacity / 2,
                        "style": 'pointer-events:inherit'
                    }
                });
                canv.setHref(newElement, data.template);
                typeMatch = true;
                break;
            case 'templates':
                canv.setMode('select');
                break;
        }

        $('.tools_flyout').fadeOut();
        if (typeMatch) {
            return {started: true};
        }
    },

    // This is triggered from anywhere, but "started" must have been set
    // to true (see above). Note that "opts" is an object with event info
    mouseUp: function (opts) {
        var mode = canv.getMode();
        switch (mode) {
            case 'text_template':
            case 'image_template':
                canv.setMode("select");
                return {
                    keep: true,
                    element: newElement,
                    started: false
                }
        }
    }
  };
});

