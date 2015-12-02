/* This is an example plugin for Salor Hospitality (SH).
 * (c) 2015 Michael Franzl, MIT License
 * 
 * # Introduction
 * 
 * SH has received an experimental plugin architecture in fall of 2015.
 * The core features of SH seem to be stable, and the code should be frozen.
 * The plugin architecture could ensure that the code can be frozen while 
 * still being extensible.
 * 
 * The plugin system of SH is very similar to that of Wordpress. However,
 * in SH, plugin code runs in a JavaScript V8 sandbox which has access
 * only to those data and methods which are explicitly made available in
 * plugin_manager.rb. This is an intentional security feature.
 * 
 * Code of Wordpress plugins however is equally privileged as the
 * Wordpress PHP code itself. This is a security risk.
 * 
 * If you really need Ruby code that is equally privileged as the SH core,
 * consider using the infrastructure of Ruby on Rails plugins/engines
 * in .gem format.
 * 
 * A plugin is simply a .ZIP file of the contents of this repository and
 * can be installed/uploaded into SH via the Plugins main menu.
 * 
 * There are FILTERS and ACTIONS, both of which are very similar.
 * 
 * Filters take 2 parameters: an input, and one controlling argument.
 * Filters modify the input (which can be of any type) based on
 * the second argument, and then return that input.
 * 
 * Actions take just 1 parameter: one controlling argument.
 * Actions can DO something (e.g. do a HTTP request to localhost),
 * but are not supposed to return anything.
 * 
 * After defining the functions of a plugin, call SH.add_filter or SH.add_action
 * to 'hook' them into the SH code (see at the very end of this file).
 * 
 * SH.add_filter and SH.add_action take 2 arguments:
 *   - the required label of the filter or action
 *   - the name of the function as defined in this file (e.g. sh_test.after_invoice)
 * 
 * To find all currently supported "hook points" in SH, do for the source tree:
 *     grep -R --color 'apply_filter' app
 * 
 * 
 * # Features of this plugin
 * 
 * This plugin only illustrates the basic mechanisms of the plugin system.
 * Suitable programmers will easily be able to author plugins that do more
 * complex and useful tasks.
 * 
 * This plugin does:
 * 
 * 1. Change the background color of SH (see sh_test.css)
 * 2. Add JavaScript to the DOM (see sh_test.js)
 * 3. Add HTML to the DOM (see sh_test.html)
 * 4. Add a button to the main menu that, when clicked, creates an AJAX
 * request that is processed by this very plugin. It then shows a prompt dialog
 * with the current settings (meta values saved in the database).
 * 5. Add text showing the ID of an order to an invoice
 * 6. Add text showing the ID of an order to a thermal receipt
 */

SH.log_action_plugin("Initializing Plugin SH_TEST");

plugins.sh_test = {
  
  /* "metafields" is a mandatory function for every plugin.
   * It must return an object containing possible settings for this plugin.
   * The settings will be shown, and can be edited on the Plugin#edit page of SH.
   * You can access these settings by calling for example
   *     SH.get_meta("sh_test", "teststring")
   */
  metafields: function (fields) {
    var fields = {
      debug: {
        name: "debug",
        type: "yesorno",
        size: "10"
      },
      teststring: {
        name: "teststring",
        type: "string",
        size: "20",
      },
      testnumber: {
        name: "testnumber",
        type: "number",
        size: "20",
      },
    };
    return fields;
  },
  
  /* This is is a FILTER.
   * 
   * It simply concatenates the received input with the settings
   * "teststring" and "testnumber" (colon separated) and returns the result.
   * 
   * You can test this function with the following ajax call:
   * 
   * $.ajax({url: "/", data: {request_for_plugins: true, plugin_action: "sh_test"}})
   * 
   * The added button in the main menu will do the same for you.
   */
  ajax: function(res, params) {
    if (Params.plugin_action == "sh_test") {
      res.teststring = SH.get_meta("sh_test", "teststring");
      res.testnumber = SH.get_meta("sh_test", "testnumber");
      return res;
    } else {
      // do not modify res
      return res;
    }
  },
  
  /* This is a FILTER.
   * 
   * It simply concatenates HTML for a test button that will be displayed in the main menu.
   * However, having HTML in functions is really ugly and a bad design,
   * too much like PHP. Consider putting HTML in the sh_test.html file
   * and switch CSS visibility, or render it via underscore.js.
   */
  mainmenu_entry: function (res, params) {
    return res + '<a href="#" onclick="sh.data.plugins.sh_test.fn.ajaxtest();"><span>Testplugin</span></a>';
  },
  
  
  /* This is a FILTER.
   * 
   * It simply adds text to an invoice, reporting the ID of an order.
   * This can be easily extended to do more complex tasks.
   */
  after_invoice: function(res, params) {
    var order = params.model; // this is Order.info (see order.rb)
    res += "Plugin sh_test says: This order's ID is: " + order.id;
    return res;
  },
  
  /* this is a FILTER.
   * 
   * It simply adds text to a thermal invoice, reporting the ID of the order.
   * This can be easily extended to do more complex tasks (for example,
   * you could make here an HTTP request to localhost to fetch a
   * base64 representation of an image (2D barcode?) in escpos format
   * (see my own gem escper), and store it in `res.raw_insertations.label`.
   * You have to study `order.rb` and my `escper` gem to see exactly
   * what is needed.
   */
  after_receipt: function(res, params) {
    var order = params.model; // this is Order.info (see order.rb)
    res.text += "Plugin sh_test says: This order's ID is: " + order.id;
    return res;
  },
}

/* Finally, "hook" all of the above functions to places in the SH code. */
SH.add_filter("ajax_request", "sh_test.ajax");
SH.add_filter("after_mainmenu_common", "sh_test.mainmenu_entry");
SH.add_filter("after_invoice", "sh_test.after_invoice");
SH.add_filter("after_receipt", "sh_test.after_receipt");