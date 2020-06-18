// Constants
const NODE_RADIUS = {"min": 10, "max": 30};
const WIDTH = 1340;
const HEIGHT = 1020;

function get_node_font_weight(d, i) {return 500;}

function get_node_font_color(d, i) {return "white";}

function handle_legend_click(){
    let legend_icon = d3.select("#legend_icon");
    let arrow_kind = legend_icon.attr("xlink:href");
    if (arrow_kind === "#arrow-down")
        arrow_kind = "#arrow-up";
    else
        arrow_kind = "#arrow-down";
    legend_icon.transition().duration(300).attr("opacity", 0.2).attr("xlink:href", arrow_kind).transition().duration(300).attr("opacity", 1.0);
}

function __generate_legend_color_scale(scale, val_to_range, card_body){
    // This function generate the legend that shows for each state its id and its label
    card_body.append("h6").attr("class", "font-weight-light").text("Days In status");

    let legend_square_dimension = {"height": 20, "width": 20 };
    let legend_starting_coordinates = {"x": legend_square_dimension.width, "y":legend_square_dimension.height};

    let scale_domain_min = scale.domain()[0];
    let scale_domain_max = scale.domain()[scale.domain().length-1];

    let scale_range_max = scale.range()[scale.range().length-1];
    let scale_range_min = scale.range()[0];

    let scale_range_values = d3.range(scale_range_min, scale_range_max, 5);

    let graph = scale_range_values
        .map(function(val){
            return {
                value: Math.floor(scale.invert(val)),
                color: val_to_range(scale.invert(val))
            }
        });

    let card_body_legend_svg = card_body
        .append("svg")
        .attr("viewBox", `${-legend_square_dimension.height} ${-legend_square_dimension.width} ${400} ${150}`);

    let card_body_legend_svg_data = card_body_legend_svg.selectAll("group").data(graph).enter().append("g");

    card_body_legend_svg_data.append('g:rect')
        .attr('x', (d, i) => legend_starting_coordinates.x + legend_square_dimension.width*i)
        .attr('y', (d, i) => legend_starting_coordinates.y)
        .attr('width', legend_square_dimension.width)
        .attr('height', legend_square_dimension.height)
        .style('fill', (d, i) => graph[i].color);

    card_body_legend_svg
        .append('g')
        .attr('class', "axis")
        .attr("transform", (d,i)=>`translate(20, ${legend_square_dimension.height + legend_starting_coordinates.y})`);

    let axis = d3.axisBottom(d3.scaleLinear().domain([scale_domain_min, scale_domain_max]).range([0, legend_square_dimension.height*scale_range_values.length-1]).nice());
    axis.ticks(scale_range_values.length/2);
    axis.tickPadding(legend_square_dimension.width);

    d3.select('.axis').call(axis);

    return card_body;
}

function __generate_legend_radius_scale(scale, val_to_range, card_body){
    card_body.append("h6").attr("class", "font-weight-light").text("People In status");

    let scale_domain_min = scale.domain()[0];
    let scale_domain_max = scale.domain()[scale.domain().length-1];

    let scale_range_max = scale.range()[scale.range().length-1];
    let scale_range_min = scale.range()[0];

    let bin_size = 4;

    let scale_range_values = d3
        .range(scale_range_min, scale_range_max+1, bin_size)
        .map(function(val){
            return {
                value: scale.invert(val),
                color: d3.interpolateReds(val_to_range(scale.invert(val)))
            }
        });

    let card_body_legend_svg_dimensions = {"width":350, "height": 130};
    let legend_starting_coordinates = {"x": (bin_size/2 + (NODE_RADIUS.max+NODE_RADIUS.min)/2), "y": card_body_legend_svg_dimensions.height/2-NODE_RADIUS.max-10};

    let card_body_legend_svg = card_body
        .append("svg")
        .attr("viewBox", `${-NODE_RADIUS.max} ${-NODE_RADIUS.max} ${card_body_legend_svg_dimensions.width} ${card_body_legend_svg_dimensions.height}`);

    let card_body_legend_svg_data = card_body_legend_svg
        .selectAll("group")
        .data(scale_range_values)
        .enter()
        .append("g");

    let node_spacing = 4;
    let node_starting_cx = legend_starting_coordinates.x;
    let new_node_starting_cx = legend_starting_coordinates.x;
    card_body_legend_svg_data
        .append('g:circle')
        .attr('r', (d, i) => val_to_range(d.value))
        .attr('cx', (d, i) => {
            node_starting_cx = new_node_starting_cx;
            new_node_starting_cx = new_node_starting_cx + 2*val_to_range(d.value) + node_spacing;
            return node_starting_cx + val_to_range(d.value);
        })
        .attr('cy', (d, i) => legend_starting_coordinates.y)
        .style('fill', "rgb(230, 53, 42)")
        .attr('stroke-width', 2.0)
        .attr('stroke', 'white');

    node_starting_cx = legend_starting_coordinates.x;
    new_node_starting_cx = legend_starting_coordinates.x;
    card_body_legend_svg_data
        .append('g:text')
        .attr('y', (d, i) => legend_starting_coordinates.y + NODE_RADIUS.max + 10)
        .attr('x', (d, i) => {
            let text_computed_length = d.value.toString().length * 5;
            node_starting_cx = new_node_starting_cx;
            new_node_starting_cx = new_node_starting_cx + +val_to_range(d.value)*2 + node_spacing;
            return node_starting_cx + val_to_range(d.value) - text_computed_length/2;
        })
        .text((d, i)=>d.value)
        .style("font-size", "8px")
        .style("color", "#212529")
        .style("font-weight", "0px");
        // .attr("class", "font-weight-light");

    return card_body;
}

function generate_legend(scale_color, val_to_color, scale_radius, val_to_radius){

    let card = d3.select("#legend_container").append("div").attr("class", "card");

    let card_header = card
        .append("div")
        .attr("style", "text-align-last:center")
        .attr("class", "card-header collapsed")
        .attr("data-toggle", "collapse")
        .attr("data-target", "#card-body-container")
        .attr("aria-expanded", "true")
        .attr("aria-controls", "card-body-container");

    card_header
        .append("svg")
        .attr("class", "icon")
        .append("use")
        .attr("id", "legend_icon")
        .attr("xlink:href", "#arrow-up")
        .style("margin-right:50px");

    card_header
        .append("text")
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr("class", "texth5")
        .text("Legend");

    let card_body_container = card
        .append("div")
        .attr("class", "card-body-container collapse show")
        .attr("id", "card-body-container");

    __generate_legend_color_scale(
        scale_color,
        val_to_color,
        card_body_container.append("div").attr("class", "card-body")
    );

    __generate_legend_radius_scale(
        scale_radius,
        val_to_radius,
        card_body_container.append("div").attr("class", "card-body")
    );

    card_header.on("click", handle_legend_click);
}

function handle_mouseover(selected_node, selected_node_index, selected_node_parent) {

    d3.selectAll(".edge").attr("opacity", (d, i) => {
        // let spare = (parseInt(d.source.id )===parseInt(selected_node.data.id));
        // spare = spare || (parseInt(d.target.id )===parseInt(selected_node.data.id));
        return 0.18;
    });

    d3.selectAll(".node").attr("opacity", (d, i) => {
        let spare = (parseInt(d.data.id)===parseInt(selected_node.data.id));
        // console.log(d, i, selected_node.data.id, spare);
        if(!spare)
            return 0.6;
        return 1.0;
    });

    let node_info_id = `node_${selected_node_index}_info`;

    d3.selectAll("#"+node_info_id).remove(); // to be sure...

    let legend_node_container_width = 250;
    let text_rows = selected_node.data.label.length/24; //24 is the number of char that fits in one line approx. (generalize, it depends on the legend_node_container_width
    let legend_node_container_height = 150+(text_rows*10);

    let group_coordinates_x = selected_node.x * (WIDTH - NODE_RADIUS.max * 2) + NODE_RADIUS.max;
    let group_coordinates_y = selected_node.y * (HEIGHT - NODE_RADIUS.max * 2) - NODE_RADIUS.max;

    let group_coordinates_y_final = group_coordinates_y + legend_node_container_height;
    let group_coordinates_x_final = group_coordinates_x + legend_node_container_width;

    if( group_coordinates_y_final > HEIGHT ){
        let surplus = (group_coordinates_y_final) - HEIGHT;
        // console.log("Height exceeds: ", group_coordinates_y, group_coordinates_y_final, HEIGHT, surplus);
        group_coordinates_y -= (surplus + legend_node_container_height/2);
        // console.log(group_coordinates_y, group_coordinates_y+legend_node_container_height)
    }

    let node_info_container = d3
        .select("#dag_container_svg")
        .append("g")
        .attr("id", node_info_id)
        .attr('transform', `translate(${group_coordinates_x}, ${group_coordinates_y})`)
        .style("opacity", 0);

    node_info_container
        .append("foreignObject")
        .attr("height", legend_node_container_height)
        .attr("width", legend_node_container_width)
        .append("xhtml:body")
        .html(
            `<div class='card' style="border-radius: 12px;">`+
            `   <div class='card-header text-center font-weight-bold' style='color:${selected_node.data.color}'>`+
            `     ${selected_node.data.label}` +
            `   </div>` +
            `  <div class='card-body' style="border-radius: 12px;">` +
            `       <b>Number of People</b>: ${selected_node.data.people_in_status}`+
            `       <br\>`+
            `       <b>Average Days</b>: ${selected_node.data.days_in_status}`+
            `  </div>` +
            `</div>`
        );

    node_info_container.transition().duration(400).style("opacity", 0.88);

}

function handle_mouseout(selected_node, selected_node_index, selected_node_parent){

    d3.select(`#node_${selected_node_index}_info`).transition().duration(400).style("opacity", 0).remove();
    d3.selectAll(".edge").attr("opacity", 1.0);
    d3.selectAll(".node").attr("opacity", 1.0);
}

d3.csv("./data/guests_in_status.csv").then(function(guest_in_status){

    let dataset_stats = get_dataset_stats(guest_in_status);

    let radius_scale = d3
        .scaleLinear()
        .domain([Math.min(...dataset_stats.people_in_status)-1, Math.max(...dataset_stats.people_in_status)+1])
        .range([NODE_RADIUS.min, NODE_RADIUS.max]);

    let color_scale = d3
        .scaleLinear()
        .domain([Math.min(...dataset_stats.days_in_status)-1, Math.max(...dataset_stats.days_in_status)+1])
        .range([20, 100]);

    let val_to_color = function(dataset_val){
        return d3.interpolateReds(color_scale(dataset_val)/100);
    };

    let val_to_radius = function(dataset_val){
        // avoid using the scale itself....
        return radius_scale(dataset_val);
    };

    const GRAPH = NODES.map(function(status){
        let parentIds = [];
        LINKS.forEach(function(link){
            if (status.id === link.target)
                parentIds.push(link.source);
        });
        return {
            "id": status.id,
            "parentIds": parentIds,
            "people_in_status": dataset_stats.people_in_status[parseInt(status.id)],
            "days_in_status": dataset_stats.days_in_status[parseInt(status.id)],
            "radius": val_to_radius(dataset_stats.people_in_status[parseInt(status.id)]),
            "color": val_to_color(dataset_stats.days_in_status[parseInt(status.id)]),
            "label": status.label
        };
    });

    let svgSelection = d3.select("#dag_container")
        .append("svg")
        .attr("id", "dag_container_svg")
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .attr("viewBox", `${-NODE_RADIUS.max} ${-NODE_RADIUS.max} ${WIDTH} ${HEIGHT}`);

    let line = d3.line().curve(d3.curveCatmullRom).x(d => d.x * (WIDTH-NODE_RADIUS.max*2)).y(d => d.y * (HEIGHT-NODE_RADIUS.max*2));
    let layout = d3.sugiyama().layering(d3.layeringTopological()).decross(d3.decrossOpt()).coord(d3.coordVert());

    let dag = d3.dagStratify()(GRAPH);
    let dag_graph = layout(dag);
    let links = dag.links();
    let descendants = dag.descendants();

    let group = svgSelection.append('g');

    let edges = group
        .append('g')
        .selectAll('path')
        .data(links)
        .enter()
        .append('path')
        .attr("class", "edge")
        .attr("d", ({source, target, data}) =>{
            let line_points = data.points;
            return line(line_points);
        })
        .attr('fill', 'none')
        .attr('stroke', ({source, target, data}) => target.data.color)
        .attr("stroke-width", 1.3);

    let nodes = group.append('g')
        .selectAll('g')
        .data(descendants)
        .enter()
        .append('g')
        .attr("class", "node")
        .attr('transform', ({x,y}) => `translate(${(x * (WIDTH-NODE_RADIUS.max*2))}, ${(y * (HEIGHT-NODE_RADIUS.max*2))})`)
        .on("mouseover", handle_mouseover)
        .on("mouseout", handle_mouseout);

    nodes.append('circle')
        .attr('r', ({data})=> data.radius)
        .attr('fill', n=>n.data.color)
        .attr('stroke-width', 2.0)
        .attr('stroke', 'white');

    nodes.append('text')
        .text(d => d.id)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr("font-weight", get_node_font_weight)
        .style("fill", get_node_font_color);

    generate_legend(
        color_scale,
        val_to_color,
        radius_scale,
        val_to_radius
    );

});
