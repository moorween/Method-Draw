var baseUrl;
var accessToken = localStorage.getItem('cognito_IdToken');
var saveNotification = 'Processing image save, please wait...';
var openButtonTitle = 'Open latest';

function init() {
  $.getJSON('prefs.json', function (prefs) {
    $.each(prefs.domainMatch, function (_, val) {
      if (window.location.host.indexOf(val.host) > -1 || val.host === 'default') {
        baseUrl = val.baseUrl;
        return false;
      }
    })
  });

  var params = new URLSearchParams(window.location.href)
  var username = params.get('username');
  var password = params.get('password');

  if (username && password) {
    console.log('Using credentials: ', username, password);
    $.ajax({
      url: 'https://api-v1.inductforwork.com.au/v1/user/login',
      type: 'post',
      data: `{"username": "${username}","password": "${password}"}`,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      dataType: 'json',
      success: function (data) {
        if (data.AuthenticationResult) {
          var token = data.AuthenticationResult.IdToken
          localStorage.setItem('cognito_IdToken', token);
          accessToken = token;
          loadCert();
        }
      }
    });

  } else {
    if (accessToken) {
      loadCert();
    } else {
      alert('Access Token not found.')
    }
  }
}

function loadSvgString(str, callback) {
  var success = methodDraw.canvas.setSvgString(str) !== false;
  callback = callback || $.noop;
  if(success) {
    callback(true);
  } else {
    $.alert(uiStrings.notification.errorLoadingSVG, function() {
      callback(false);
    });
  }

  $(str).find('[font-family]').each(function (val) {
    loadFont($(this).attr('font-family'));
  });
}

function loadCert() {
  $.ajax({
    url: `${baseUrl}/company/company-certificate/`,
    type: 'get',
    headers: {
      'Authorization': accessToken.replace(/"/g, ''),
      'Content-Type': 'application/json;charset=UTF-8'
    },
    dataType: 'json',
    beforeSend: function() {
      $.process_cancel(uiStrings.notification.loadingImage);
    },
    success: function (data) {
      if (data.link) {
        var link = data.link.indexOf('https://') === 0 ? data.link : `https:${data.link}`;
        methodDraw.ready(function() {
          $.ajax({
            'url': link,
            'dataType': 'text',
            success: function(str) {
              var start = str.indexOf('<svg');
              var end = str.indexOf('</svg>');

              str = str.substring(start, end + 6);
              loadSvgString(str, function() {
                $('#dialog_box').hide();
              });
            },
            error: function(xhr, stat, err) {
              if(xhr.status != 404 && xhr.responseText) {
                loadSvgString(xhr.responseText, null);
              } else {
                $.alert(uiStrings.notification.URLloadFail + ": \n"+err+'', cb);
              }
              $('#dialog_box').hide();
            }
          });
        });
      }
    },
    error: function (err) {
      console.error(err);
      $.alert('Unable to load certificate', function () {
      });
    }
  });
}

function saveCert() {
  if (accessToken) {
    $.ajax({
        url: `${baseUrl}/company/company-certificate-signed-url/`,
        type: 'get',
        headers: {
          'Authorization': accessToken.replace(/"/g, ''),
          'Content-Type': 'application/json;charset=UTF-8'
        },
        dataType: 'json',
        beforeSend: function beforeSend() {
          $.process_cancel(saveNotification);
        },
        success: function (data) {
          var blob = new Blob([svgCanvas.svgCanvasToString()], {type: data.contentType});
          var formData = new FormData();
          formData.append('file', blob);

          $.ajax({
            url: data.signedURL,
            type: 'PUT',
            data: formData,
            processData: false,
            headers: {
              'Content-Type': data.contentType
            },
            success: function (res) {
              console.log(res, 'success');
              $.ajax({
                url: `${baseUrl}/company/company-certificate/`,
                type: 'PUT',
                data: `{"link": "${data.link}"}`,
                processData: false,
                headers: {
                  'Authorization': accessToken.replace(/"/g, ''),
                  'Content-Type': 'application/json;charset=UTF-8'
                },
                error: function error(xhr, stat, err) {
                },
                success: function (data) {
                  console.log(data, 'success');
                }
              })
            },
            complete: function complete() {
              $('#dialog_box').hide();
            }
          })
        },
        error: function error(xhr, stat, err) {
          alert('Error: ', err);
        }
      }
    );
  }
}

methodDraw.addExtension("Storage", function (S) {
  init();

  methodDraw.canvas.save = function() {
    saveCert();
  }

  methodDraw.canvas.open = function() {
    loadCert();
  }

  $('#tool_open > input,#fileinputs').remove();
  $('#tool_open').text(openButtonTitle);

  return {
    name: "Storage",
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

