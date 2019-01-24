function show_variants_table() {

    var variants_table = $('#variants_table').DataTable({
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
        //"ajax": "{{ url_for('variants_data') }}",
        "ajax": "/variants_data",
        //"scrollX": true,
        "order": [
            [0, "asc"]
        ],
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
                data: "HGVSc"
            },
            {
                data: "HGVSp"
            },
            {
                data: "insight_class"
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
}
