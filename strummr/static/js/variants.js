var global = {
   'variant_information': [],    // all the rows of variant information 
};

function show_variants_table() {

    var variants_table = $('#variants_table').DataTable({
        /*
        "initComplete": function() {

            this.api().columns([2, 5, 6]).every(function() {
                var that = this;
                var column = this;
                var textinput = $('<input type="text" placeholder="Search"/>')
                    .appendTo($(column.footer()).empty())
                    .on('keyup change', function() {
                        if (that.search() !== this.value) {
                            that.search(this.value).draw();
                        }
                    });
            });

            this.api().columns([0, 1, 3, 4, 7]).every(function() {
                var column = this;
                var select = $('<select><option value="" disabled selected hidden>Search</option></select>')
                    .appendTo($(column.footer()).empty())
                    .on('change', function() {
                        var val = $.fn.dataTable.util.escapeRegex(
                            $(this).val()
                        );

                        column
                            .search(val ? '^' + val + '$' : '', true, false)
                            .draw();
                    });

                column.data().unique().sort().each(function(d, j) {
                    select.append('<option value="' + d + '">' + d + '</option>')
                });
            });
        },
        */
        //"ajax": "/variants_data",
        "data": global['variant_information'],
        "order": [
            [0, "asc"]
        ],
        "scrollX": true,
	"autoWidth": false,
        "pageLength": 20,
        "lengthMenu": [
            [10, 20, 50, 100],
            [10, 20, 50, 100]
        ],
        "columns": [{
                data: "gene"
            },
            {
                data: "chrom"
            },
            {
                data: "pos"
            },
            {
                data: "ref"
            },
            {
                data: "alt"
            },
            {
                data: "hgvsc"
            },
            {
                data: "hgvsp"
            },
            {
                data: "insight_class"
            },
            {
                data: null
            },
        ],
        "columnDefs": [
	   {
            "targets": -1,
            "data": null,
            "render": function(data, type, row) {
                var variant_identifiers = [row.chrom, row.pos, row.ref, row.alt];
                var this_url = "variant/" + variant_identifiers.join("-");
                return "<a href=" + this_url + ">details</a>";
            }
          }
	]
    });

    // The below code is needed to get the DataTable to re-draw itself to get the
    // column widths correct. See https://github.com/DataTables/Responsive/issues/40
    // and http://stackoverflow.com/questions/8278981/datatables-on-the-fly-resizing/39157482#39157482
    $($.fn.dataTable.tables( true ) ).css('width', '100%');
    $($.fn.dataTable.tables( true ) ).DataTable().columns.adjust().draw();

    return variants_table;
}


function plot_population_frequencies() {

    frequecies_per_class = {};

    var variants = [];
    for (var i = 0; i < global['variant_information'].length; i++) {
        var v = global['variant_information'][i];
        var this_af = v.gnomad_af;
        if (this_af) {
            this_af = parseFloat(this_af);
            var this_class = v.insight_class;
            if (!(this_class in frequecies_per_class)) {
                frequecies_per_class[this_class] = [];
            }
            frequecies_per_class[this_class].push(this_af);
        }
    }

    var insight_classes = ['N/A', '1', '2', '3', '4', '5'];
    var plot_traces = [];
    var insight_classes = ['N/A', '1', '2', '3', '4', '5'];
    var plot_traces = [];

    insight_classes.forEach(function (class_name) {
        if (class_name in frequecies_per_class) {
            var this_class_frequencies = frequecies_per_class[class_name];
        }
        else {
            var this_class_frequencies = [];
        }
        var this_trace = {
            y: this_class_frequencies,
            type: 'box',
            name: 'Class ' + class_name,
            boxpoints: 'all',
            jitter: 0.3,
            pointpos: -1.8,
        };
        plot_traces.push(this_trace);
    });

    var layout = {
        title: { text:'gnomAD population frequency versus InSiGHT class' },
        yaxis: {
            type: 'log',
            autorange: true,
            title: 'gnomAD population frequency (log scale)',
        },
        xaxis: {
            title: 'InSiGHT class',
        },
        height: 600
    };

    Plotly.newPlot('population_frequencies', plot_traces, layout);

}



function main () {
  $.ajax({
        type: "GET",
        url: "/variants_data",
//        data: {'gene':gene_symbol},
        cache: false,
        success: function(response) {
            global['variant_information'] = response.data;
            table = show_variants_table();
            global['variants_table'] = table;
            plot_population_frequencies();
        }
    });

}
