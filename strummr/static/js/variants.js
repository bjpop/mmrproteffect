var global = {
   'variant_information': [],    // all the rows of variant information 
};

function show_variants_table() {

    var variants_table = $('#variants_table').DataTable({
        "dom": 'Blfrtip',
        buttons: [
            {
               extend: "colvis",
               className: "btn-sm btn-outline-primary",
               titleAttr: 'Column visibility',
               text: 'Columns'
            },
            {
               extend: "copy",
               className: "btn-sm btn-outline-primary",
               titleAttr: 'Copy data',
               text: 'Copy'
            }
        ],
        "data": global['variant_information'],
        "order": [
            [0, "asc"],  // sort by gene name first
            [2, "asc"],  // then sort by genome position second
        ],
        "scrollX": true,
	"autoWidth": false,
        "pageLength": 25,
        "columns": [
            {   
                data: "gene",
            },
            {   
                data: "chrom",
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
                data: "genetic_origin",
                visible: false,
            },
            {
                data: "protein_position",
                visible: false,
            },
            {
                data: "exon",
                visible: false,
            },
            {
                data: "intron",
                visible: false,
            },
            {
                data: "gnomad_af",
                visible: false,
            },
            {
                data: "num_homozygotes",
                visible: false,
            },
            {
                data: "consequence",
                visible: false,
            },
            {
                data: "impact",
                visible: false,
            },
            {
                data: "cadd_phred",
                visible: false,
            },
            {
                data: "revel_score",
                visible: false,
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
        cache: false,
        success: function(response) {
            global['variant_information'] = response.data;
            table = show_variants_table();
            global['variants_table'] = table;
            plot_population_frequencies();
        }
    });
}
