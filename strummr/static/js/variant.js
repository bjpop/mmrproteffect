var global = {
    'stage': null, // overall object for protein visualisation
    'variant': null, // component for the loaded PDB structure
    'gene': null, // component for the loaded PDB structure
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

    $("#PIints,#vdw,#hbond,#ionic,#aromatic,#hydrophobic,#carbonyl,#polar").on("click", function (e) {
        if ($(this).prop("checked") == true)
            stage.getRepresentationsByName($(this).data('component')).setVisibility(true);
        else
            stage.getRepresentationsByName($(this).data('component')).setVisibility(false);
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
                color: "entitytype",
                quality: "high"
            });
        } else {
            component.addRepresentation("cartoon", {
                name: component_name,
                sele: chain_id,
                color: "chainid",
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

function getResidue(arpeggio_interactions, interaction_type) {
    var result = [];
    for (var each in arpeggio_interactions) {
        if (arpeggio_interactions[each].length > 0) {
            if (each == interaction_type) {
                var interaction = arpeggio_interactions[interaction_type];
                interaction.forEach(element => {
                    result.push(element)
                });
            }
        }
    }
    return result;
}
function getResidues(arpeggio_interactions) {
    var interaction_list = ['vdw', 'hbond', 'ionic', 'aromatic', 'hydrophobic', 'carbonyl', 'polar'];
    var all_residues = [];

    interaction_list.forEach(element => {
        all_residues.push(getResidue(arpeggio_interactions, element))

    });
    var merged = [].concat.apply([], all_residues);
    return new Set(merged);
}

function getResiduesForDisplay(arpeggio_interactions) {
    let self = this;
    var result = [];

    getResidues(arpeggio_interactions).forEach(element => {
        element.forEach(elementt => {
            result.push(elementt.split('.')[0])
        })
    });
    return new Set(result);
}

function getResiduesForLabel(arpeggio_interactions) {
    var result = [];
    getResidues(arpeggio_interactions).forEach(element => {
        element.forEach(elementt => {
            result.push(elementt.split('.')[0] + ".CA")
        })
    });
    return new Set(result);
}

function residueLabel(component, interactions) {
    var white = new NGL.Color("white");
    var black = new NGL.Color("black");

    if (component.viewer.parameters.backgroundColor.equals(black)) {
        component.addRepresentation("label", {
            sele: Array.from(getResiduesForLabel(interactions)).join(' '),
            name: 'active_label',
            color: "yellow",
            labelType: "format",
            labelFormat: "%(resname)s%(resno)s"
        })
    }

    if (component.viewer.parameters.backgroundColor.equals(white)) {
        component.addRepresentation("label", {
            sele: Array.from(getResiduesForLabel(interactions)).join(' '),
            name: 'active_label',
            color: "black",
            labelType: "format",
            labelFormat: "%(resname)s%(resno)s"
        })
    }
}

function display_interactions(component){
    var interactions = global['interactions'];

    component.addRepresentation("ball+stick", {
        name: 'active_sites',
        multipleBond: "symmetric",
        sele: Array.from(getResiduesForDisplay(interactions)).join(' ')
    });

    residueLabel(component, interactions);

    if (getResidue(interactions, 'vdw').length > 0) {
        component.addRepresentation('distance', {
            name: 'vdw',
            atomPair: getResidue(interactions, 'vdw'),
            color: '#61DBDD',
            labelVisible: false,
        })
    }

    if (getResidue(interactions, 'hbond').length > 0) {
        component.addRepresentation('distance', {
            name: 'hbond',
            atomPair: getResidue(interactions, 'hbond'),
            color: '#FF0000',
            labelVisible: false,
        })
    }
    if (getResidue(interactions, 'ionic').length > 0) {
        component.addRepresentation('distance', {
            name: 'ionic',
            atomPair: getResidue(interactions, 'ionic'),
            color: '#FAFA30',
            labelVisible: false,
        })
    }
    if (getResidue(interactions, 'aromatic').length > 0) {
        component.addRepresentation('distance', {
            name: 'aromatic',
            atomPair: getResidue(interactions, 'aromatic'),
            color: '#90EE90',
            labelVisible: false,
        })
    }
    if (getResidue(interactions, 'hydrophobic').length > 0) {
        component.addRepresentation('distance', {
            name: 'hydrophobic',
            atomPair: getResidue(interactions, 'hydrophobic'),
            color: '#137B13',
            labelVisible: false,

        })
    }
    if (getResidue(interactions, 'carbonyl').length > 0) {
        component.addRepresentation('distance', {
            name: 'carbonyl',
            atomPair: getResidue(interactions, 'carbonyl'),
            color: '#334CFF',
            labelVisible: false,
        })
    }
    if (getResidue(interactions, 'polar').length > 0) {
        component.addRepresentation('distance', {
            name: 'polar',
            atomPair: getResidue(interactions, 'polar'),
            color: '#F58805',
            labelVisible: false,
        })
    }
    return true;
}

function PIresidueLabel(component, pi_interactions_residues) {
    var white = new NGL.Color("white");
    var black = new NGL.Color("black");

    var result=[];

    pi_interactions_residues.forEach(element => {
            result.push(element+".CA")
    });

    if (component.viewer.parameters.backgroundColor.equals(black)) {
        // residue labeling
        component.addRepresentation("label", {
            sele: Array.from(result).join(' '),
            name: 'active_label',
            color: "yellow",
            labelType: "format",
            labelFormat: "%(resname)s%(resno)s"
        })
    }

    if (component.viewer.parameters.backgroundColor.equals(white)) {
        // residue labeling
        component.addRepresentation("label", {
            sele: Array.from(result).join(' '),
            name: 'active_label',
            color: "black",
            labelType: "format",
            labelFormat: "%(resname)s%(resno)s"
        })
    }
}

function display_PI_interactions(component){
    var pi_interactions = global['pi_interactions'];
    var pi_interactions_residues = global['pi_interactions_residues'];

    if (pi_interactions_residues.length > 0){
        component.addRepresentation("ball+stick", {
            name: 'active_sites_PI',
            multipleBond: "symmetric",
            sele: pi_interactions_residues.join(" ")
        });
        PIresidueLabel(component, pi_interactions_residues);
    }


    var shape = new NGL.Shape("shape",{dashedCylinder:true, radialSegments:60});

    if (pi_interactions['carbonpi'].length > 0){
        var carbonpi = getResidue(pi_interactions,'carbonpi');
        for (var i=0; i < carbonpi.length;i++){
            shape.addCylinder(component.getCenter(carbonpi[i][0]),[parseFloat(carbonpi[i][1].split(",")[0]),parseFloat(carbonpi[i][1].split(",")[1]),parseFloat(carbonpi[i][1].split(",")[2])],[235,0,1],0.15,"carbonpi_"+i);
        };
    }

    if (pi_interactions['cationpi'].length > 0){
        var cationpi = getResidue(pi_interactions,'cationpi');
        for (var i=0; i < cationpi.length;i++){
            shape.addCylinder(component.getCenter(cationpi[i][0]),[parseFloat(cationpi[i][1].split(",")[0]),parseFloat(cationpi[i][1].split(",")[1]),parseFloat(cationpi[i][1].split(",")[2])],[235,0,1],0.15,"cationpi_"+i);
        };
    }

    if (pi_interactions['donorpi'].length > 0){
        var donorpi = getResidue(pi_interactions,'donorpi');
        for (var i=0; i < donorpi.length;i++){
            shape.addCylinder(component.getCenter(donorpi[i][0]),[parseFloat(donorpi[i][1].split(",")[0]),parseFloat(donorpi[i][1].split(",")[1]),parseFloat(donorpi[i][1].split(",")[2])],[235,0,1],0.15,"donorpi_"+i);
        };
    }

    if (pi_interactions['halogenpi'].length > 0){
        var halogenpi = getResidue(pi_interactions,'halogenpi');
        for (var i=0; i < halogenpi.length;i++){
            shape.addCylinder(component.getCenter(halogenpi[i][0]),[parseFloat(halogenpi[i][1].split(",")[0]),parseFloat(halogenpi[i][1].split(",")[1]),parseFloat(halogenpi[i][1].split(",")[2])],[235,0,1],0.15,"halogenpi_"+i);
        };
    }


    if (pi_interactions['metsulphurpi'].length > 0){
        var metsulphurpi = getResidue(pi_interactions,'metsulphurpi');
        for (var i=0; i < metsulphurpi.length;i++){
            shape.addCylinder(component.getCenter(metsulphurpi[i][0]),[parseFloat(metsulphurpi[i][1].split(",")[0]),parseFloat(metsulphurpi[i][1].split(",")[1]),parseFloat(metsulphurpi[i][1].split(",")[2])],[235,0,1],0.15,"metsulphurpi_"+i);
        };
    }

    if (pi_interactions['pipi'].length > 0){
        var pipi = getResidue(pi_interactions,'pipi');
        for (var i=0; i < pipi.length;i++){
            shape.addCylinder([parseFloat(pipi[i][0].split(",")[0]),parseFloat(pipi[i][0].split(",")[1]),parseFloat(pipi[i][0].split(",")[2])],[parseFloat(pipi[i][1].split(",")[0]),parseFloat(pipi[i][1].split(",")[1]),parseFloat(pipi[i][1].split(",")[2])],[235,0,1],0.15,"pipi_"+i);
        };
    }

    if (pi_interactions['amideamide'].length > 0){
        var amideamide = getResidue(pi_interactions,'amideamide');
        for (var i=0; i < amideamide.length;i++){
            shape.addCylinder([parseFloat(amideamide[i][0].split(",")[0]),parseFloat(amideamide[i][0].split(",")[1]),parseFloat(amideamide[i][0].split(",")[2])],[parseFloat(amideamide[i][1].split(",")[0]),parseFloat(amideamide[i][1].split(",")[1]),parseFloat(amideamide[i][1].split(",")[2])],[235,0,1],0.15,"amideamide_"+i);
        };
    }

    if (pi_interactions['amidering'].length> 0){
       var amidering = getResidue(pi_interactions,'amidering');
        for (var i=0; i < amidering.length;i++){
            shape.addCylinder([parseFloat(amidering[i][0].split(",")[0]),parseFloat(amidering[i][0].split(",")[1]),parseFloat(amidering[i][0].split(",")[2])],[parseFloat(amidering[i][1].split(",")[0]),parseFloat(amidering[i][1].split(",")[1]),parseFloat(amidering[i][1].split(",")[2])],[235,0,1],0.15,"amidering_"+i);
        };
    }

    var shapeComp = component.stage.addComponentFromObject(shape);
    shapeComp.addRepresentation('buffer');
}

function set_default_representation(component) {
    var variant = global['variant'];
    var gene = global['gene_symbol'];
    var mut = variant + gene_to_pdb_chain[gene];

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
    component.addRepresentation("ball+stick", {
        name: 'variant',
        multipleBond: "symmetric",
        sele: mut
    });

    display_interactions(component);
    display_PI_interactions(component);
    component.autoView(mut);
}

function initialise_pdb_component(component) {
    set_default_representation(component);
    global['pdb_component'] = component;
}

function main(gene_symbol, variant_info, interactions, pi_interactions, pi_interactions_residues) {

    if (interactions.length != 0){
        $("#3DViewer").show();
        global['gene_symbol'] = gene_symbol;
        global['interactions'] = interactions;
        global['pi_interactions'] = pi_interactions;
        global['pi_interactions_residues'] = pi_interactions_residues;
        global['gene_symbol'] = gene_symbol;
        global['variant'] = $("#position").text();

        /* event handlers */
        $("#reset_visualisation_button").click(function() {
            var component = global['pdb_component'];

            set_default_representation(component);

            $("#show_msh6").prop("checked", true);
            $("#show_msh2").prop("checked", true);
            $("#show_dna").prop("checked", true);
            $("#show_labels").prop("checked", false);

        });

        visualise_protein_structure();
    }

    $("#plot_x_axis").change(function() {
        plot_variant_attributes_one_variable(gene_symbol, variant_info);
    });

    set_plot_select_options_x_axis();

    $.ajax({
        type: "GET",
        url: "/variants_data",
        cache: false,
        success: function(response) {
            global['variant_information'] = response.data;
            plot_variant_attributes_one_variable(gene_symbol, variant_info);
        }
    });
}
