(function ( $ ) {
  jQuery(document).ready(function($) {

    //renderColors();
    renderSpecialFeatures();
    renderSchlagwort();
    initInputs();

    var ThemaJQ = JsonQuery(themas);

    var all_filters = [
      { field: 'thema'},
      { field: 'kennzahlenset'},
      { field: 'schlagwort'},
      { field: 'raeumlicheGliederung'}
    ]

    var checkbox_filters = [
      { field: 'thema'},
      { field: 'kennzahlenset'}
    ];

    var checkbox_array_filters = [
      { field: 'colors'}
    ];

    var checkbox_array_radio_filters = [
      { field: 'raeumlicheGliederung'},
      { field: 'schlagwort'}
    ];

    var queryHash = parseUrlHash();

    $.each(checkbox_filters, function(i, filter){
      var options = ThemaJQ.uniq(filter.field).pluck(filter.field).all;

      if(filter.order){
        //console.log(options)
        options = filter.sortFn(options, filter.order, filter.replace_str)
      }

      renderRadioFilters(filter.field, options, '#radio_template', '#filter_' + filter.field, filter.postfix, queryHash[filter.field] || []);
      //renderCheckboxFilters(options, '#checkbox_template', '#filter_' + filter.field, filter.postfix, queryHash[filter.field] || []);
    });

    var FJS = FilterJS(themas, '#filtered_themas', {
      template: '#thema_template',
      search: { ele: '#searchbox' },
      callbacks: {
        afterFilter: afterFilter,
        shortResult: shortResult
      },
      pagination: {
        container: '#pagination',
        paginationView: "#pagination_template",
        visiblePages: 5,
        perPage: {
          values: [15, 30, 60, 'All'],
          container: '#per_page'
        },
       }
    });

    $.each(checkbox_filters, function(i, filter){
      //FJS.addCriteria({field: filter.field, ele: '#filter_' + filter.field + ' input:checkbox'});
      FJS.addCriteria({field: filter.field, ele: '#filter_' + filter.field + ' input:radio'});
    });

    $.each(checkbox_array_filters, function(i, filter){
      FJS.addCriteria({field: filter.field, ele: '#filter_' + filter.field + ' input:checkbox', all: 'all'});
    });

    $.each(checkbox_array_radio_filters, function(i, filter){
      FJS.addCriteria({field: filter.field, ele: '#filter_' + filter.field + ' input:radio', all: 'all'});
    });

    var setParams = false;

    function afterFilter(result, jQ){
      var zero = result.length == 0,
          params = []

      $.each(checkbox_filters, function(i, filter){
        setCountAndUrl(filter.field, jQ, zero, params);
      })

      if(setParams){
        window.location.hash = params.join('&');
      }
      setParams = true;
    }

    var sortOptions = {};

    $("#l-sort-by").on('change', function(e){
      sortOptions = buildSortOptions($(this).val());
      FJS.filter();
      e.preventDefault();
    });

    function shortResult(query){
      if(sortOptions){
        query.order(sortOptions);
      }
    }

    window.FJS = FJS;


    var setParams = false;

    function afterFilter(result, jQ)
    {
      var zero = result.length == 0,
        params = []

      $.each(all_filters, function(i, filter)
      {
        setCountAndUrl(filter.field, jQ, zero, params);
      })

      if(setParams)
      {
        window.location.hash = params.join('&');
      }
      setParams = true;
    }


  });

  function initInputs(){
    //$('#filter_schlagwort :checkbox').prop('checked', true);

    /*$('#filter_schlagwort_all').on('click', function(){
      $('#filter_schlagwort :checkbox').prop('checked', $(this).is(':checked'));
    });*/
  }

  function renderCheckboxFilters(options, template_ele, append_to_ele, postfix, selectedValues){
    var tmplFn = FilterJS.templateBuilder($(template_ele).html());
    var $container = $(append_to_ele);

    $.each(options, function(i, option){
      var value = postfix ? option.replace(postfix, '') : option;
      var selected = selectedValues.indexOf(value) > -1

      $container.append(tmplFn({ value: value, name: value, postfix: postfix, selected: selected }));
    });
  }

  function renderRadioFilters(title, options, template_ele, append_to_ele, postfix, selectedValues){
    var tmplFn = FilterJS.templateBuilder($(template_ele).html());
    var $container = $(append_to_ele);

    $.each(options, function(i, option){
      var value = postfix ? option.replace(postfix, '') : option;
      var selected = selectedValues.indexOf(value) > -1

      $container.append(tmplFn({ title: title, value: value, name: value, postfix: postfix, selected: selected }));
    });
  }

  function renderColors(){
    var arr = ["Black","Blue","Brown","Green","Grey","Orange","Purple","Transparent","White","Yellow"];

    var html = $('#array-template').html();
    var templateFn = FilterJS.templateBuilder(html)
    var container = $('#filter_colors');

    $.each(arr, function(i, c){
      container.append(templateFn({ name: c, value: c }))
    });
  }

  function renderSpecialFeatures(){
    var arr = ["Kanton","Gemeinde","Wohnviertel","Bezirk","Block","Blockseite"];

    var html = $('#array_radio_template').html();
    var templateFn = FilterJS.templateBuilder(html)
    var container = $('#filter_raeumlicheGliederung');
    var title = 'raeumlicheGliederung';


    $.each(arr, function(i, c){
      container.append(templateFn({ title: title, name: c, value: c }))
    });
  }

  function renderSchlagwort(){
    var arr = ["Heimat","Gebäude","Personal","Einkommen","EuroAirport","Geschlecht","Haushalt","Ausländer","Alter","Religion"];

    var html = $('#array_radio_template').html();
    //var html = $('#array-template').html();
    var templateFn = FilterJS.templateBuilder(html)
    var container = $('#filter_schlagwort');
    var title = 'schlagwort';

    $.each(arr, function(i, c){
      //container.append(templateFn({ name: c, value: c }))
      container.append(templateFn({ title: title, name: c, value: c }))
    });
  }

  function parseUrlHash(){
    var values = {}, hash = window.location.hash;

    if(hash.length == 0){
      return values;
    }

    var params = hash.split('#')[1].split('&');

    $.each(params, function(i, param){
      var f = param.split('=');
      values[f[0]] = f[1].split(',');
    });

    //delete values['amount'];

    return values;
  }

  function setCountAndUrl(field, jQ, zero, params)
  {
    var $container = $('#filter_' + field),
        q = {},
        count = 0,
        $ele,
        label,
        vals = [];

    $.each($container.find(':radio',':checkbox'), function()
    {
      $ele = $(this);
      label =  $ele.data('label');

      if($ele.is(':checked'))
      {
        vals.push($ele.val());
      }

      if(!zero)
      {
        q[field] = $ele.val();
        count = zero ? 0 : jQ.where(q).count;
      }

      $ele.next().html(label + " ("+ count +")" );
      if(count == 0)
      {
        $ele.parent().parent().addClass('disabled');
        $ele.attr('disabled', true);
      }
      if(count != 0)
      {
        $ele.parent().parent().removeClass('disabled');
        $ele.attr('disabled', false);
      }

    });

    if(vals.length)
    {
      params.push(field + "=" +vals.join(','));
    }
  }

}( jQuery ));
