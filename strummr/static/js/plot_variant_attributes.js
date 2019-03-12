var plot_axis_types = {
    'gene': 'categorical',
    'insight_class': 'categorical',
    'consequence': 'categorical',
    'impact': 'categorical',
    'exon': 'categorical',
    'intron': 'categorical',
    'cdna_position': 'numerical',
    'cds_position': 'numerical',
    'protein_position': 'numerical',
    'ada_score': 'numerical',
    'rf_score': 'numerical',
    'cadd_phred': 'numerical',
    'revel_score': 'numerical',
    'maxentscan_alt': 'numerical',
    'maxentscan_diff': 'numerical',
    'maxentscan_ref': 'numerical',
    'gnomad_af': 'numerical',
    'num_homozygotes': 'numerical',
    'mtr': 'numerical',
    'mtr_genemean': 'numerical',
    'mtr_genemedian': 'numerical',
    'diff_mtr_gene_mean': 'numerical',
    'diff_mtr_gene_median': 'numerical',
    'diff_mtr_genome_mean': 'numerical',
    'diff_mtr_genome_median': 'numerical',
    'ratio_mtr_gene_mean': 'numerical',
    'ratio_mtr_gene_median': 'numerical',
    'ratio_mtr_genome_mean': 'numerical',
    'ratio_mtr_genome_median': 'numerical',
    'ToPRO': 'categorical',
    'ToGLY': 'categorical',
    'FromPRO': 'categorical',
    'FromGLY': 'categorical',
    'Phi': 'numerical',
    'Psi': 'numerical',
    'Omega': 'numerical',
    'PositivePhiGLY': 'categorical',
    'provean': 'numerical',
    'provean_pred': 'categorical',
    'sift': 'numerical',
    'sift_pred': 'categorical',
    'dist_lig': 'numerical',
    'dist_na': 'numerical',
    'dist_ppi': 'numerical',
    'pph2': 'numerical',
    'pph2_prediction': 'categorical',
    'mcsm_na': 'numerical',
    'mcsm_ppi': 'numerical',
    'ddg_encom': 'numerical',
    'dds_encom': 'numerical',
    'ddg_duet': 'numerical',
    'ddg_dynamut': 'numerical',
    'ddg_mcsm': 'numerical',
    'ddg_sdm': 'numerical',
    'predicted': 'categorical',
};

// Set the axes separately to make the code more reusable.
// Can be used for plots that compare two variables, and
// also plots that consider a single variable
function set_plot_select_options_both_axes() {
    set_plot_select_options_x_axis();
    set_plot_select_options_y_axis();
}

function set_plot_select_options_x_axis() {
    Object.keys(plot_axis_types).forEach(key => {
        var x_options = $('#plot_x_axis')
            .append($("<option></option>")
                .attr("value", key)
                .text(key));
    });
    $('#plot_x_axis').find('option[value="insight_class"]').attr("selected", "selected");
}

function set_plot_select_options_y_axis() {
    Object.keys(plot_axis_types).forEach(key => {
        var y_options = $('#plot_y_axis')
            .append($("<option></option>")
                .attr("value", key)
                .text(key));
    });
    $('#plot_y_axis').find('option[value="predicted"]').attr("selected", "selected");
}

function plot_variant_attributes_one_variable(gene_symbol, variant_info) {

    var selected_plot_x_axis = document.getElementById("plot_x_axis");
    var selected_plot_x_axis_value = selected_plot_x_axis.options[selected_plot_x_axis.selectedIndex].value;
    var x_axis_type = plot_axis_types[selected_plot_x_axis_value];

    if (x_axis_type === 'categorical') {
        bar_plot_one_variable(gene_symbol, selected_plot_x_axis_value, variant_info);
    } else if (x_axis_type === 'numerical') {
        histogram_one_variable(gene_symbol, selected_plot_x_axis_value, variant_info);
    }
}

function histogram_one_variable(gene_symbol, x_axis_attribute, variant_info) {

    var attribute_values = [];

    if (x_axis_attribute in variant_info) {
       this_variant_value = parseFloat(variant_info[x_axis_attribute]);
    }

    for (var i = 0; i < global['variant_information'].length; i++) {
        var v = global['variant_information'][i];
        if (gene_symbol === null || v.gene == gene_symbol) {
            var x_value = parseFloat(v[x_axis_attribute]);
            if (x_value) {
                attribute_values.push(x_value);
            }
        }
    }

    var min_value = Math.min(...attribute_values);
    var max_value = Math.max(...attribute_values);
    var histGenerator = d3.histogram().domain([min_value,max_value]).thresholds(19);
    var bins = histGenerator(attribute_values);
    var bin_counts = [];
    var bin_bounds = [];
    var bar_colors = [];
    var default_color = 'rgba(204,204,204,1)';
    var highlight_color = 'rgba(222,45,38,0.8)';

    for (var i = 0; i < bins.length; i++) {
        var this_bin = bins[i];
        bin_counts.push(this_bin.length);
        bin_bounds.push(parseFloat(this_bin.x0).toFixed(2) + " : " + parseFloat(this_bin.x1).toFixed(2));
        // The last bin is inclusive in both bounds
        if (i == bins.length - 1) {
            if (this_variant_value >= this_bin.x0 && this_variant_value <= this_bin.x1) {
                bar_colors.push(highlight_color);
            }
            else {
                bar_colors.push(default_color);
            }
        }
        // all other bins are inclusive in the lower bound and exclusive in the upper bound
        else {
            if (this_variant_value >= this_bin.x0 && this_variant_value < this_bin.x1) {
                bar_colors.push(highlight_color);
            }
            else {
                bar_colors.push(default_color);
            }
        }
    }

    var plot_traces = [{
        y: bin_counts,
        //x: x_axis_labels,
        x: bin_bounds,
        type: 'bar',
        name: x_axis_attribute,
        marker: {color: bar_colors},
    }];

    var layout = {
        title: {
            text: x_axis_attribute,
        },
        yaxis: {
            autorange: true,
            title: "count",
        },
        xaxis: {
            title: x_axis_attribute,
            type: 'category',
        },
        height: 600,
    };

    Plotly.newPlot('variant_attributes_plot', plot_traces, layout);

/*
    var plot_traces = [{
        x: attribute_values,
        type: 'histogram',
        name: x_axis_attribute,
    }];

    var layout = {
        title: {
            text: x_axis_attribute,
        },
        yaxis: {
            autorange: true,
            title: "count",
        },
        xaxis: {
            title: x_axis_attribute,
        },
        height: 600,
    };

    Plotly.newPlot('variant_attributes_plot', plot_traces, layout);
    */
}

function bar_plot_one_variable(gene_symbol, x_axis_attribute, variant_info) {

    var group_counts = {};
    var this_variant_group = null;

    if (x_axis_attribute in variant_info) {
       this_variant_group = variant_info[x_axis_attribute];
    }

    for (var i = 0; i < global['variant_information'].length; i++) {
        var v = global['variant_information'][i];
        if (gene_symbol === null || v.gene == gene_symbol) {
            var x_value = v[x_axis_attribute];
            if (x_value) {
                if (!(x_value in group_counts)) {
                    group_counts[x_value] = 0;
                }
                group_counts[x_value]++;
            }
        }
    }

    var x_axis_labels = [];
    var y_counts = [];
    var bar_colors = [];
    var default_color = 'rgba(204,204,204,1)';
    var highlight_color = 'rgba(222,45,38,0.8)';

    Object.keys(group_counts).forEach(group => {
        x_axis_labels.push(group);
    });
    x_axis_labels.sort();

    for (var i = 0; i < x_axis_labels.length; i++) {
        var this_x_label = x_axis_labels[i];
        y_counts.push(group_counts[this_x_label]);
        if (this_x_label === this_variant_group) {
            bar_colors.push(highlight_color);
        }
        else {
            bar_colors.push(default_color);
        }
    }

    var plot_traces = [{
        y: y_counts,
        x: x_axis_labels,
        type: 'bar',
        name: x_axis_attribute,
        marker: {color: bar_colors},
    }];

    var layout = {
        title: {
            text: x_axis_attribute,
        },
        yaxis: {
            autorange: true,
            title: "count",
        },
        xaxis: {
            title: x_axis_attribute,
            type: 'category',
        },
        height: 600,
    };

    Plotly.newPlot('variant_attributes_plot', plot_traces, layout);
}

function plot_variant_attributes_two_variables(gene_symbol) {

    var selected_plot_x_axis = document.getElementById("plot_x_axis");
    var selected_plot_x_axis_value = selected_plot_x_axis.options[selected_plot_x_axis.selectedIndex].value;
    var selected_plot_y_axis = document.getElementById("plot_y_axis");
    var selected_plot_y_axis_value = selected_plot_y_axis.options[selected_plot_y_axis.selectedIndex].value;
    var x_axis_type = plot_axis_types[selected_plot_x_axis_value];
    var y_axis_type = plot_axis_types[selected_plot_y_axis_value];

    if (x_axis_type === 'categorical' && y_axis_type === 'numerical') {
        box_plot_variant_attributes(gene_symbol, selected_plot_x_axis_value, selected_plot_y_axis_value);
    } else if (x_axis_type === 'categorical' && y_axis_type === 'categorical') {
        stacked_bar_plot_variant_attributes(gene_symbol, selected_plot_x_axis_value, selected_plot_y_axis_value);
    } else if (x_axis_type === 'numerical' && y_axis_type === 'numerical') {
        scatter_plot_variant_attributes(gene_symbol, selected_plot_x_axis_value, selected_plot_y_axis_value);
    } else if (x_axis_type === 'numerical' && y_axis_type === 'categorical') {
        stacked_histogram_plot_variant_attributes(gene_symbol, selected_plot_x_axis_value, selected_plot_y_axis_value);
    }
}

function stacked_bar_plot_variant_attributes(gene_symbol, x_axis_attribute, y_axis_attribute) {

    var y_axis_groups = {};
    var x_axis_labels_set = new Set();

    $('#log_x_axis').prop('disabled', true);
    $('#log_y_axis').prop('disabled', false);

    for (var i = 0; i < global['variant_information'].length; i++) {
        var v = global['variant_information'][i];
        if (gene_symbol === null || v.gene == gene_symbol) {
            var x_value = v[x_axis_attribute];
            var y_value = v[y_axis_attribute];
            if (x_value && y_value) {
                x_axis_labels_set.add(x_value);
                if (!(y_value in y_axis_groups)) {
                    y_axis_groups[y_value] = {};
                }
                if (!(x_value in y_axis_groups[y_value])) {
                    y_axis_groups[y_value][x_value] = 0;
                }
                y_axis_groups[y_value][x_value]++;
            }
        }
    }

    var plot_traces = [];
    var x_axis_labels = Array.from(x_axis_labels_set).sort();

    Object.keys(y_axis_groups).forEach(y_axis_group => {
        var x_counts = [];
        for (var i = 0; i < x_axis_labels.length; i++) {
            var this_x_label = x_axis_labels[i];
            if ((this_x_label in y_axis_groups[y_axis_group])) {
                x_counts.push(y_axis_groups[y_axis_group][this_x_label]);
            }
            else {
                x_counts.push(0);
            }
        }
        var this_trace = {
            y: x_counts,
            x: x_axis_labels,
            type: 'bar',
            name: y_axis_group,
        };
        plot_traces.push(this_trace);
    });

    var y_axis_type = 'linear';
    var y_axis_label = y_axis_attribute;
    if ($('#log_y_axis').is(":checked")) {
        y_axis_type = 'log';
        y_axis_label = y_axis_attribute + ' (log)';
    }

    var layout = {
        title: {
            text: x_axis_attribute + ' versus ' + y_axis_attribute,
        },
        yaxis: {
            type: y_axis_type,
            autorange: true,
            title: y_axis_label,
        },
        xaxis: {
            title: x_axis_attribute,
            type: 'category',
        },
        height: 600,
        barmode: 'stack',
    };

    Plotly.newPlot('variant_attributes_plot', plot_traces, layout);
}

function scatter_plot_variant_attributes(gene_symbol, x_axis_attribute, y_axis_attribute) {

    $('#log_x_axis').prop('disabled', false);
    $('#log_y_axis').prop('disabled', false);

    var x_values = [];
    var y_values = [];

    for (var i = 0; i < global['variant_information'].length; i++) {
        var v = global['variant_information'][i];
        if (gene_symbol === null || v.gene == gene_symbol) {
            var this_x_value = v[x_axis_attribute];
            var this_y_value = v[y_axis_attribute];
            if (this_x_value && this_y_value) {
                this_x_value_numerical = parseFloat(this_x_value);
                this_y_value_numerical = parseFloat(this_y_value);
                x_values.push(this_x_value_numerical);
                y_values.push(this_y_value_numerical);
            }
        }
    }

    var this_trace = {
        x: x_values,
        y: y_values,
        type: 'scatter',
        mode: 'markers',
    };

    var plot_traces = [this_trace];

    var x_axis_type = 'linear';
    var x_axis_label = x_axis_attribute;
    if ($('#log_x_axis').is(":checked")) {
        x_axis_type = 'log';
        x_axis_label = x_axis_attribute + ' (log)';
    }

    var y_axis_type = 'linear';
    var y_axis_label = y_axis_attribute;
    if ($('#log_y_axis').is(":checked")) {
        y_axis_type = 'log';
        y_axis_label = y_axis_attribute + ' (log)';
    }

    var layout = {
        title: {
            text: x_axis_attribute + ' versus ' + y_axis_attribute,
        },
        yaxis: {
            type: y_axis_type,
            autorange: true,
            title: y_axis_label,
        },
        xaxis: {
            type: x_axis_type,
            autorange: true,
            title: x_axis_label,
        },
        height: 600
    };

    Plotly.newPlot('variant_attributes_plot', plot_traces, layout);
}

function stacked_histogram_plot_variant_attributes(gene_symbol, x_axis_attribute, y_axis_attribute) {
    var values_per_group = {};

    $('#log_x_axis').prop('disabled', true);
    $('#log_y_axis').prop('disabled', false);

    for (var i = 0; i < global['variant_information'].length; i++) {
        var v = global['variant_information'][i];
        if (gene_symbol === null || v.gene == gene_symbol) {
            var this_value = v[x_axis_attribute];
            var this_group = v[y_axis_attribute];
            if (this_value && this_group) {
                this_value_numerical = parseFloat(this_value);
                if (!(this_group in values_per_group)) {
                    values_per_group[this_group] = [];
                }
                values_per_group[this_group].push(this_value_numerical);
            }
        }
    }

    var plot_traces = [];

    Object.keys(values_per_group).forEach(group_name => {
        var this_group_values = values_per_group[group_name];
        var this_trace = {
            x: this_group_values,
            type: 'histogram',
            name: group_name,
        };
        plot_traces.push(this_trace);
    });

    var y_axis_type = 'linear';
    var y_axis_label = y_axis_attribute;
    if ($('#log_y_axis').is(":checked")) {
        y_axis_type = 'log';
        y_axis_label = y_axis_attribute + ' (log)';
    }

    var layout = {
        title: {
            text: x_axis_attribute + ' versus ' + y_axis_attribute,
        },
        yaxis: {
            type: y_axis_type,
            autorange: true,
            title: y_axis_label,
        },
        xaxis: {
            title: x_axis_attribute,
        },
        height: 600,
        barmode: 'stack',
    };

    Plotly.newPlot('variant_attributes_plot', plot_traces, layout);
}

function box_plot_variant_attributes(gene_symbol, x_axis_attribute, y_axis_attribute) {
    var values_per_group = {};

    $('#log_x_axis').prop('disabled', true);
    $('#log_y_axis').prop('disabled', false);

    for (var i = 0; i < global['variant_information'].length; i++) {
        var v = global['variant_information'][i];
        if (gene_symbol === null || v.gene == gene_symbol) {
            var this_value = v[y_axis_attribute];
            var this_group = v[x_axis_attribute];
            if (this_value && this_group) {
                this_value_numerical = parseFloat(this_value);
                if (!(this_group in values_per_group)) {
                    values_per_group[this_group] = [];
                }
                values_per_group[this_group].push(this_value_numerical);
            }
        }
    }

    var plot_traces = [];

    Object.keys(values_per_group).forEach(group_name => {
        var this_group_values = values_per_group[group_name];
        var this_trace = {
            y: this_group_values,
            type: 'box',
            name: group_name,
            boxpoints: 'all',
            jitter: 0.3,
            pointpos: -1.8,
        };
        plot_traces.push(this_trace);
    });

    var y_axis_type = 'linear';
    var y_axis_label = y_axis_attribute;
    if ($('#log_y_axis').is(":checked")) {
        y_axis_type = 'log';
        y_axis_label = y_axis_attribute + ' (log)';
    }

    var layout = {
        title: {
            text: x_axis_attribute + ' versus ' + y_axis_attribute,
        },
        yaxis: {
            type: y_axis_type,
            autorange: true,
            title: y_axis_label,
        },
        xaxis: {
            title: x_axis_attribute,
            type: 'category',
        },
        height: 600
    };

    Plotly.newPlot('variant_attributes_plot', plot_traces, layout);
}
