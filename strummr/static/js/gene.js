var global = {
    'stage': null, // overall object for protein visualisation
    'pdb_component': null, // component for the loaded PDB structure
    'variants_table': null, // the data table of variants for this gene
    'highlighted_variants': {}, // map from variant protein position to highlight component
    'gene_symbol': null, // name of the gene we are working with
    'variant_information': [], // all the rows of variant information
};

function visualise_protein_structure() {

    var stage = new NGL.Stage("protein_structure_viewport", {
        backgroundColor: "white"
    });
    global['stage'] = stage;

    $('#spin_protein').on('click', function() {
        if ($(this).hasClass("btn-outline-secondary")) {
            $(this).removeClass("btn-outline-secondary");
            $(this).addClass("btn-secondary");
        } else {
            $(this).removeClass("btn-secondary");
            $(this).addClass("btn-outline-secondary");
        }
        stage.toggleSpin();
    });

    $("#screenshot").on("click", function(e) {
        stage.makeImage({
            factor: 1,
            antialias: true,
            trim: false,
            transparent: true
        }).then(function(blob) {
            NGL.download(blob, "screenshot.png");
        });
    });

    $("#fullscreen").on("click", function(e) {
        stage.toggleFullscreen();

    });

    $('#help').on('click', function() {
        if ($(this).hasClass("btn-outline-secondary")) {
            $(this).removeClass("btn-outline-secondary");
            $(this).addClass("btn-secondary");
        } else {
            $(this).removeClass("btn-secondary");
            $(this).addClass("btn-outline-secondary");
        }
    });

    $('#show_msh6, #show_msh2, #show_dna').change(function() {
        toggle_component($(this).prop("name"), this.checked);
    });

    // Handle window resizing
    window.addEventListener("resize", function(event) {
        stage.handleResize();
    }, false);

    $.ajax({
        type: "GET",
        url: "/pdb",
        cache: false,
        success: function(response) {
            var stringBlob = new Blob([response.data], {
                type: 'text/plain'
            });
            stage.loadFile(stringBlob, {
                ext: "pdb",
                //defaultRepresentation: false
            }).then(initialise_pdb_component)
            .then(function(){
                $("#spinner").hide();
            });
        }
    });
}

function average(arr) {
    if (arr.length) {
        sum = arr.reduce(function(a, b) {
            return a + b;
        });
        return sum / arr.length;
    } else {
        return null;
    }
}

function get_residue_coords(structure, chain_id, residue) {
    var xs = [];
    var ys = [];
    var zs = [];

    var selection_string = chain_id + " and " + residue;
    var selection = new NGL.Selection(selection_string);
    structure.eachAtom(function(ap) {
        xs.push(ap.x);
        ys.push(ap.y);
        zs.push(ap.z);
    }, selection)

    if (xs.length) {
        var x = average(xs);
        var y = average(ys);
        var z = average(zs);
        return [x, y, z];
    } else {
        return null;
    }
}

// Map gene symbol to the corresponding chain ID in the PDB file
var gene_to_pdb_chain = {
    "MSH2": ":A",
    "MSH6": ":B",
};

function highlight_variant_in_structure(protein_pos, insight_class) {
    // Don't highlight variants that are already highlighted
    var highlighted_variants = global['highlighted_variants'];
    if (!(protein_pos in highlighted_variants)) {
        var gene_symbol = global['gene_symbol'];
        var colour = new NGL.Color(insight_class_colour(insight_class));
        var radius = 5;
        var pdb_chain = gene_to_pdb_chain[gene_symbol];
        var shape_component = highlight_residue(radius, colour, pdb_chain, protein_pos);
        if (shape_component) {
            highlighted_variants[protein_pos] = shape_component;
        }
    }
}

function un_highlight_variant_in_structure(protein_pos) {
    // Only try to un-highlight variants that are already highlighted
    var highlighted_variants = global['highlighted_variants'];
    if (protein_pos in highlighted_variants) {
        var this_shape_component = highlighted_variants[protein_pos];
        global['stage'].removeComponent(this_shape_component);
        delete highlighted_variants[protein_pos];
    }
}

function toggle_component(component_name, show) {
    var component = global['pdb_component']
    var chain_id = gene_to_pdb_chain[component_name];

    if (show) {
        if (component_name == "DNA") {
            component.addRepresentation("base", {
                name: 'DNA',
                sele: ":E or :F",
                quality: "high"
            });
            component.addRepresentation("cartoon", {
                name: 'DNA',
                sele: ":E or :F",
                quality: "high"
            });
        } else {
            component.addRepresentation("cartoon", {
                name: component_name,
                sele: chain_id,
                quality: "high"
            });
            component.addRepresentation("ball+stick", {
                name: component_name,
                sele: "(hetero and " + chain_id + ") and not (water)",
                quality: "high"
            });
        }
    } else {
        component.stage.getRepresentationsByName(component_name).dispose();
    }
}

function highlight_residue(radius, colour, chain_id, residue_pos) {
    var stage = global['stage'];
    var structure = global['pdb_component'].structure;
    var coords = get_residue_coords(structure, chain_id, residue_pos);
    if (coords) {
        var shape = new NGL.Shape("shape", {
            disableImpostor: true
        });
        shape.addSphere(coords, colour, radius);
        var component = stage.addComponentFromObject(shape);
        component.addRepresentation("buffer", {
            opacity: 0.5
        });
        return component;
    } else {
        return null;
    }
}

function set_default_representation(component) {
    component.addRepresentation("cartoon", {
        name: 'MSH2',
        sele: ":A",
        color: "chainid",
        quality: "high"
    });
    component.addRepresentation("ball+stick", {
        name: 'MSH2',
        sele: "(hetero and :A) and not (water)",
        quality: "high"
    });
    component.addRepresentation("cartoon", {
        name: 'MSH6',
        sele: ":B",
        color: "chainid",
        quality: "high"
    });
    component.addRepresentation("ball+stick", {
        name: 'MSH6',
        sele: "(hetero and :B) and not (water)",
        quality: "high"
    });
    component.addRepresentation("base", {
        name: 'DNA',
        sele: ":E or :F",
        color: "element",
        quality: "high"
    });
    component.addRepresentation("cartoon", {
        name: 'DNA',
        sele: ":E or :F",
        color: "entitytype",
        quality: "high"
    });
    component.autoView();
}

function initialise_pdb_component(component) {
    set_default_representation(component);
    global['pdb_component'] = component;
}

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
            [2, "asc"] // sort by genome position by default
        ],
        "scrollX": true,
        "pageLength": 10,
        "autoWidth": false, // Needed to get column width displayed correctly, see comments below about redraw
        "select": {
            style: 'multi'
        },
        "columns": [{
                data: "gene",
                visible: false
            },
            {
                data: "chrom",
                visible: false
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

    variants_table.on('select', function(e, dt, type, indexes) {
            var row = table.rows(indexes).data()[0];
            highlight_variant_in_structure(row['protein_position'], row['insight_class']);
        })
        .on('deselect', function(e, dt, type, indexes) {
            var row = table.rows(indexes).data()[0];
            un_highlight_variant_in_structure(row['protein_position']);
        });

    return variants_table;
}


function insight_class_colour(insight_class) {
    switch (insight_class) {
        case '5':
            return 'red';
        case '4':
            return 'orange';
        case '3':
            return 'grey'
        case '2':
            return 'blue';
        case '1':
            return 'green';
        default:
            return 'black';
    }
}

function get_protein_info(gene_symbol) {
    switch (gene_symbol) {
        case 'MSH2':
            return msh2_pfam;
        case 'MSH6':
            return msh6_pfam;
        default:
            return {};
    }
}

function make_insight_url(gene_symbol) {
    if (gene_symbol === 'MSH2') {
        url = "https://www.insight-database.org/#tabs-4";
    }
    else if (gene_symbol === 'MSH6') {
        url = "https://www.insight-database.org/#tabs-5";
    }
    //return "<a href=https://" + url + ">" + url + "</a>";
    return url;
}

function make_uniprot_url(accession) {
    var url = "https://www.uniprot.org/uniprot/" + accession
    //return "<a href=https://" + url + ">" + url + "</a>";
    return url;
}

function gene_metadata(gene_symbol) {
    var protein_info = get_protein_info(gene_symbol);
    $("#uniprot_link").attr("href", make_uniprot_url(protein_info.metadata.accession));
    $("#insight_link").attr("href", make_insight_url(gene_symbol));
}

function is_class_selected(variant_class) {
    var selections = $('#lollipop_class option:selected');
    var selected_classes = [];
    $(selections).each(function() {
        selected_classes.push($(this).val());
    });
    for (var i = 0; i < selected_classes.length; i++) {
        var this_selected_class = selected_classes[i];
        switch (this_selected_class) {
            case "N/A":
                if (variant_class === "N/A") {
                    return true;
                }
                break;
            case "1":
                if (variant_class === "1") {
                    return true;
                }
                break;
            case "2":
                if (variant_class === "2") {
                    return true;
                }
                break;
            case "3":
                if (variant_class === "3") {
                    return true;
                }
                break;
            case "4":
                if (variant_class === "4") {
                    return true;
                }
                break;
            case "5":
                if (variant_class === "5") {
                    return true;
                }
                break;
        }
    }
    return false;
}

function is_impact_selected(impact) {
    var selections = $('#lollipop_impact option:selected');
    var is = [];
    $(selections).each(function() {
        is.push($(this).val());
    });
    for (var i = 0; i < is.length; i++) {
        var selected_impact = is[i];
        switch (selected_impact) {
            case "N/A":
                if (impact === "N/A") {
                    return true;
                }
                break;
            case "Low":
                if (impact === "LOW") {
                    return true;
                }
                break;
            case "Moderate":
                if (impact === "MODERATE") {
                    return true;
                }
                break;
            case "Modifier":
                if (impact === "MODIFIER") {
                    return true;
                }
                break;
            case "High":
                if (impact === "HIGH") {
                    return true;
                }
                break;
        }
    }
    return false;
}

function is_consequence_selected(consequence) {
    var selections = $('#lollipop_consequence option:selected');
    var cs = [];
    $(selections).each(function() {
        cs.push($(this).val());
    });
    for (var i = 0; i < cs.length; i++) {
        var selected_consequence = cs[i];
        switch (selected_consequence) {
            case "Missense":
                if (consequence.includes("missense")) {
                    return true;
                }
                break;
            case "Stop gained":
                if (consequence.includes("stop_gained")) {
                    return true;
                }
                break;
            case "Splice":
                if (consequence.includes("splice")) {
                    return true;
                }
                break;
            case "Frameshift":
                if (consequence.includes("frameshift")) {
                    return true;
                }
                break;
            case "Start lost":
                if (consequence.includes("start_lost")) {
                    return true;
                }
                break;
            case "Synonymous":
                if (consequence.includes("synonymous")) {
                    return true;
                }
                break;
        }
    }
    return false;
}

function gene_lollipop(gene_symbol) {

    // XXX these width and height values probably shouldn't be hard-coded here
    var display_width = 1100;
    var display_height = 200;
    var target_div = "#lollipop_plot";
    var margin = {
        top: 20,
        right: 40,
        bottom: 20,
        left: 40
    };

    var protein_info = get_protein_info(gene_symbol);

    var variants = [];
    for (var i = 0; i < global['variant_information'].length; i++) {
        var v = global['variant_information'][i];
        if (v.gene == gene_symbol && (is_class_selected(v.insight_class) ||
                is_impact_selected(v.impact) ||
                is_consequence_selected(v.consequence))) {
            var this_colour = insight_class_colour(v.insight_class);
            var position_integer = parseInt(v.protein_position, 10);
            if (position_integer) {
                variants.push({
                    'pos': position_integer,
                    'label': v.HGVSp,
                    'colour': this_colour
                });
            }
        }
    }
    variants.sort(function(x, y) {
        return x.pos - y.pos
    });

    make_lollipop(display_width, display_height, margin, protein_info.length, protein_info.regions, variants, target_div);
}

function make_lollipop(total_width, total_height, margin, protein_length, regions, variants, target_div) {

    /* Precondition: we assume the variants are in sorted order of protein position */

    var backbone_colour = d3.rgb(186, 189, 182);
    var lollipop_radius = 3;

    var drawing_width = total_width - (margin.left + margin.right);
    var drawing_height = total_height - (margin.top + margin.bottom);

    /* all protein X dimensions should be given in the range (0 - protein_length) */
    var xScale = d3.scaleLinear()
        .domain([0, protein_length])
        .range([0, drawing_width]);

    /* all Y dimensions should be given as a percentage (0 - 1) of the SVG height. */
    var yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, drawing_height]);

    var backbone_height = 0.1;
    var feature_height = 2 * backbone_height;

    /* XXX it should be possible to avoid removing the whole SVG, but I can't get it to work at the moment without it */
    d3.select("svg").remove();
    var svg = d3.select(target_div)
        .append("svg")
        .attr("width", total_width)
        .attr("height", total_height);

    /* plot the axis */

    var axisScale = d3.scaleLinear()
        .domain([0, protein_length]).range([0, drawing_width]);

    var ticks = [];
    var next_tick = 0;
    var tick_gap = 100;
    while (next_tick <= protein_length) {
        ticks.push(next_tick);
        next_tick += tick_gap;
    }

    if (ticks.length > 0 && (protein_length - ticks[ticks.length - 1]) >= 10) {
        ticks.push(protein_length);
    }

    var xAxis = d3.axisBottom()
        .scale(axisScale)
        .tickValues(ticks);

    var xAxisGroup = svg.append("g")
        .attr("transform", function(d) {
            return "translate(" + margin.left + "," + yScale(0.8) + ")";
        })
        .call(xAxis);

    xAxisGroup
        .selectAll('path')
        .style({
            'stroke': 'black',
            'fill': 'none',
            'stroke-width': '1px'
        });

    /* plot the variants above the protein */

    var previous_variant_pos = null;
    var min_lollipop_level = 1;
    var lollipop_level = min_lollipop_level;
    var lollipop_min_gap = 3;
    var max_lollipop_level = 10;

    for (var i = 0; i < variants.length; i++) {
        var this_variant = variants[i];
        if (previous_variant_pos != null) {
            var gap = this_variant.pos - previous_variant_pos;
            if (gap <= lollipop_min_gap) {
                lollipop_level += 1;
                if (lollipop_level > max_lollipop_level) {
                    lollipop_level = min_lollipop_level;
                }
            } else {
                lollipop_level = min_lollipop_level;
            }
        }
        previous_variant_pos = this_variant.pos;
        this_variant.level = lollipop_level;
    }

    var variant_group = svg.append("g")
        .attr("transform", function(d) {
            return "translate(" + margin.left + "," + margin.top + ")";
        });

    var variant = variant_group.selectAll(".variant")
        .data(variants)
        .enter().append("g");

    var lineFunction = d3.line()
        .x(function(d) {
            return d.x;
        })
        .y(function(d) {
            return d.y;
        });

    var max_lollipop_stick_len = 0.5;

    function lollipop_height(level) {
        // this offset is necessary to make sure the lowest dot is a minimum distance away from the protein feature
        var lollipop_offset = (feature_height / 2) + 0.1;
        var visible_lollipop_stick_len = max_lollipop_stick_len - lollipop_offset;
        return yScale(((max_lollipop_level - level) / max_lollipop_level) * visible_lollipop_stick_len);
    }

    variant.append("path")
        .attr("d", function(d) {
            return lineFunction(
                [{
                        x: xScale(d.pos),
                        y: lollipop_height(d.level)
                    },
                    {
                        x: xScale(d.pos),
                        y: yScale(max_lollipop_stick_len)
                    }
                ]);
        })
        .attr("stroke", 'grey')
        .attr("stroke-width", 1)
        .attr("fill", "none");

    variant.append("circle")
        .attr("cx", function(d) {
            return xScale(d.pos);
        })
        .attr("cy", function(d) {
            return lollipop_height(d.level);
        })
        .attr("r", lollipop_radius)
        .style("fill", function(d) {
            return d.colour;
        });

    /* plot the protein group (backbone and motifs/features) */

    var protein_group = svg.append("g")
        .attr("transform", function(d) {
            return "translate(" + margin.left + "," + yScale(0.5) + ")";
        });

    protein_group.append("rect")
        .style("fill", backbone_colour)
        .attr("width", xScale(protein_length))
        .attr("height", yScale(backbone_height))
        .attr("x", 0)
        .attr("y", yScale((feature_height - backbone_height) / 2));

    var feature = protein_group.selectAll(".feature")
        .data(regions)
        .enter().append("g")
        .attr("transform", function(d) {
            return "translate(" + xScale(d.start) + ", 0)";
        });

    feature.append("rect")
        .style("fill", function(d) {
            return d.colour;
        })
        .attr("class", "feature")
        .attr("width", function(d) {
            return xScale((d.end - d.start) + 1)
        })
        .attr("height", yScale(feature_height))
        .attr("filter", "url(#md-shadow)");

    feature.append("text")
        .style("fill", "white")
        .style("font-size", "8px")
        .style("font-family", "Arial")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("y", yScale(feature_height / 2))
        .attr("x", function(d) {
            return xScale((d.end - d.start) / 2);
        })
        .text(function(d) {
            return d.text;
        })

    /* SVG specific definitions */

    var svg_defs = svg.append("defs");

    var shadow_deviation = 2;
    var shadow_offset = 2;
    var shadow_slope = 0.25;

    // create filter and assign provided id
    var filter = svg_defs.append("filter")
        .attr("height", "125%") // adjust this if shadow is clipped
        .attr("id", "md-shadow");

    // ambient shadow into ambientBlur
    //   may be able to offset and reuse this for cast, unless modified
    filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", shadow_deviation)
        .attr("result", "ambientBlur");

    // cast shadow into castBlur
    filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", shadow_deviation)
        .attr("result", "castBlur");

    // offsetting cast shadow into offsetBlur
    filter.append("feOffset")
        .attr("in", "castBlur")
        .attr("dx", shadow_offset - 1)
        .attr("dy", shadow_offset)
        .attr("result", "offsetBlur");

    // combining ambient and cast shadows
    filter.append("feComposite")
        .attr("in", "ambientBlur")
        .attr("in2", "offsetBlur")
        .attr("result", "compositeShadow");

    // applying alpha and transferring shadow
    filter.append("feComponentTransfer")
        .append("feFuncA")
        .attr("type", "linear")
        .attr("slope", shadow_slope);

    // merging and outputting results
    var feMerge = filter.append("feMerge");
    feMerge.append('feMergeNode')
    feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");
}

// XXX should we only consider variants with protein_position > 0?
function filter_variants_to_gene_and_protein(gene, variants) {
    return variants.filter(item => item.gene == gene && item.protein_position.length > 0);
}

function clear_selected_variants() {
    var table = global['variants_table'];
    var highlighted_variants = global['highlighted_variants'];
    var stage = global['stage'];
    table.rows({
        selected: true
    }).deselect();
    for (var protein_pos in highlighted_variants) {
        var this_shape_component = highlighted_variants[protein_pos];
        stage.removeComponent(this_shape_component);
    }
    global['highlighted_variants'] = {};
}

function main(gene_symbol) {

    global['gene_symbol'] = gene_symbol;

    /* event handlers */
    $('#lollipop_class').on("change", function(e) {
        gene_lollipop(gene_symbol);
    });

    /* event handlers */
    $('#lollipop_consequence').on("change", function(e) {
        gene_lollipop(gene_symbol);
    });

    /* event handlers */
    $('#lollipop_impact').on("change", function(e) {
        gene_lollipop(gene_symbol);
    });

    /* event handlers */
    $("#clear_all_selected_variants").click(function() {
        clear_selected_variants();
    });

    /* event handlers */
    $("#reset_visualisation_button").click(function() {
        var component = global['pdb_component'];

        set_default_representation(component);

        $("#show_msh6").prop("checked", true);
        $("#show_msh2").prop("checked", true);
        $("#show_dna").prop("checked", true);
        $("#show_labels").prop("checked", false);

    });

    /* event handlers */
    $("#plot_x_axis").change(function() {
        plot_variant_attributes_two_variables(gene_symbol);
    });

    /* event handlers */
    $("#plot_y_axis").change(function() {
        plot_variant_attributes_two_variables(gene_symbol);
    });

    /* event handlers */
    $("#log_x_axis").change(function() {
        plot_variant_attributes_two_variables(gene_symbol);
    });

    /* event handlers */
    $("#log_y_axis").change(function() {
        plot_variant_attributes_two_variables(gene_symbol);
    });

    /* set up the axis options for plotting the variant attributes */
    //set_plot_select_options_both_axes();

    /* Display basic information about this particular gene */
    gene_metadata(gene_symbol);

    $.ajax({
        type: "GET",
        url: "/variants_data",
        data: {
            'gene': gene_symbol
        },
        cache: false,
        success: function(response) {
            // keep only variants relevant to the gene of interest
            // XXX perhaps this should happen on the server?
            global['variant_information'] = filter_variants_to_gene_and_protein(gene_symbol, response.data);
            gene_lollipop(gene_symbol);
            table = show_variants_table();
            global['variants_table'] = table;
            visualise_protein_structure();
            plot_variant_attributes_two_variables(gene_symbol);
        }
    });
}
