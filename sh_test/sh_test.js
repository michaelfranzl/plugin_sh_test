/* This file will be appended into the <head> section
 * of the main SalorHospitality template.
 */

sh.data.plugins.sh_test.fn = {}

sh.data.plugins.sh_test.fn.ajaxtest = function() {
  $.ajax({
    url: "/",
    data: {
      plugin_request: true,
      plugin_action: "sh_test",
    },
    success: function(data) {
      alert(JSON.stringify(data));
    },
  });
}

$(function() {
  // documentready code here
});