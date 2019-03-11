var global = {
    'variant_information': [], // all the rows of variant information
};

function show_variants_table() {

    var variants_table = $('#variants_table').DataTable({
        "dom": 'Blfrtip',
        buttons: [{
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
            [0, "asc"], // sort by gene name first
            [2, "asc"], // then sort by genome position second
        ],
        "scrollX": true,
        "autoWidth": false,
        "pageLength": 25,
        "columns": [{
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
                data: "mtr",
                visible: false,
            },
            {
                data: "mtr_genemean",
                visible: false,
            },
            {
                data: "mtr_genemedian",
                visible: false,
            },
            {
                data: "diff_mtr_gene_mean",
                visible: false,
            },
            {
                data: "diff_mtr_gene_median",
                visible: false,
            },
            {
                data: "diff_mtr_genome_mean",
                visible: false,
            },
            {
                data: "diff_mtr_genome_median",
                visible: false,
            },
            {
                data: "ratio_mtr_gene_mean",
                visible: false,
            },
            {
                data: "ratio_mtr_gene_median",
                visible: false,
            },
            {
                data: "ratio_mtr_genome_mean",
                visible: false,
            },
            {
                data: "ratio_mtr_genome_median",
                visible: false,
            },
            {
                data: "ToPRO",
                visible: false,
            },
            {
                data: "ToGLY",
                visible: false,
            },
            {
                data: "FromPRO",
                visible: false,
            },
            {
                data: "FromGLY",
                visible: false,
            },
            {
                data: "Phi",
                visible: false,
            },
            {
                data: "Psi",
                visible: false,
            },
            {
                data: "Omega",
                visible: false,
            },
            {
                data: "PositivePhiGLY",
                visible: false,
            },
            {
                data: "provean",
                visible: false,
            },
            {
                data: "provean_pred",
                visible: false,
            },
            {
                data: "sift",
                visible: false,
            },
            {
                data: "sift_pred",
                visible: false,
            },
            {
                data: "dist_lig",
                visible: false,
            },
            {
                data: "dist_na",
                visible: false,
            },
            {
                data: "dist_ppi",
                visible: false,
            },
            {
                data: "pph2",
                visible: false,
            },
            {
                data: "pph2_prediction",
                visible: false,
            },
            {
                data: "mcsm_na",
                visible: false,
            },
            {
                data: "mcsm_ppi",
                visible: false,
            },
            {
                data: "ddg_encom",
                visible: false,
            },
            {
                data: "dds_encom",
                visible: false,
            },
            {
                data: "ddg_duet",
                visible: false,
            },
            {
                data: "ddg_dynamut",
                visible: false,
            },
            {
                data: "ddg_mcsm",
                visible: false,
            },
            {
                data: "ddg_sdm",
                visible: false,
            },
            {
                data: "predicted",
                visible: true,
            },
            {
                data: null
            },
        ],
        "columnDefs": [{
            "targets": -1,
            "data": null,
            "render": function(data, type, row) {
                var variant_identifiers = [row.chrom, row.pos, row.ref, row.alt];
                var this_url = "variant/" + variant_identifiers.join("-");
                return "<a href=" + this_url + ">details</a>";
            }
        }]
    });

    // The below code is needed to get the DataTable to re-draw itself to get the
    // column widths correct. See https://github.com/DataTables/Responsive/issues/40
    // and http://stackoverflow.com/questions/8278981/datatables-on-the-fly-resizing/39157482#39157482
    $($.fn.dataTable.tables(true)).css('width', '100%');
    $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();

    return variants_table;
}

function main() {

    /* event handlers */
    $("#plot_x_axis").change(function() {
        plot_variant_attributes_two_variables(null);
    });

    /* event handlers */
    $("#plot_y_axis").change(function() {
        plot_variant_attributes_two_variables(null);
    });

    /* event handlers */
    $("#log_x_axis").change(function() {
        plot_variant_attributes_two_variables(null);
    });

    /* event handlers */
    $("#log_y_axis").change(function() {
        plot_variant_attributes_two_variables(null);
    });

    /* set up the axis options for plotting the variant attributes */
    set_plot_select_options_both_axes();

    $.ajax({
        type: "GET",
        url: "/variants_data",
        cache: false,
        success: function(response) {
            global['variant_information'] = response.data;
            table = show_variants_table();
            global['variants_table'] = table;
            plot_variant_attributes_two_variables(null);
        }
    });
}
