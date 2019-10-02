/*
# Copyright (c) 2017 LINE Corporation
# These sources are released under the terms of the MIT license: see LICENSE
*/

function update_page(data) {
  for (var key in data) {
    console.log("Replacing %s", key);
    var ele = $(data[key]);
    $(key).replaceWith(ele);
  }
}

$(document).ready(function() {
  $('[data-toggle="popover"]').popover();
  $('[data-toggle="tooltip"]').tooltip();

  // For querying information such as number of samples being scraped or number
  // of active exporters, query Prometheus (based on the passed URL) and return
  // a formatted number
  // <span class='prom-query'
  //   data-href='http://prometheus.example/api/v1/query'
  //   data-query='count(up)'>
  $('.prom-query').each(function(index) {
    var ele = $(this)
    $.ajax({url: this.dataset.href, data: {'query': this.dataset.query}}).done(function(response) {
      if (response.status=='success') {
        ele.text(
          Number.parseInt(response.data.result[0].value[1]).toLocaleString()
        )
        ele.parent().addClass('label-info').show()
      }
    }).fail(function(response){
      ele.text(response.statusText)
      ele.parent().addClass('label-warning').show()
    })
  })

  $('[data-source]').click(function() {
    var btn = $(this);
    var query = btn.data('source') === 'self' ? btn.text() : $(btn.data('source')).val();

    $(btn.data('target')).html('Loading...').show();
    btn.data('query', query);
    console.log("Testing Query: %s", query);
    $.post(btn.data('href'), btn.data()).done(update_page);
  }).css('cursor', 'pointer');

  $('[data-form]').click(function() {
    var form = document.querySelector(this.dataset.form);
    $(this.dataset.target).html('Loading...').show();
    // TODO: Make this more general ?
    $.post(this.dataset.href, {
      'target': this.dataset.target,
      'job': form.elements.job.value,
      'port': form.elements.port.value,
      'path': form.elements.path.value,
      'csrfmiddlewaretoken': form.elements.csrfmiddlewaretoken.value
    }).done(update_page);
  }).css('cursor', 'pointer');

  $('[data-copyto]').click(function(){
    var ele = $(this);
    $(ele.data('copyto')).val(ele.text())
  }).css('cursor', 'pointer');

  $('[data-filter]').change(function(){
    var search = this.value.toUpperCase();
    $(this.dataset.filter).each(function(i, ele){
      var txt = $(this).text().toUpperCase();
      ele.style.display = txt.indexOf(search) > -1 ? "" : "none"
    })
  });
});
