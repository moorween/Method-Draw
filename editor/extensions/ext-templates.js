methodDraw.addExtension("Templates", function () {
  $.getJSON('prefs.json', function (prefs) {

    $('#template_select > [data-additional]').remove();
    $.each(prefs.templates, function (_, val) {
      var option = $(`<option value="${val.template}" data-type="${val.type}" data-additional="true">${val.title}</option>`);
      $('#template_select').append(option);
    })

  });

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
          canv.setMode(mode_id);
        }
      }
    }],
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

