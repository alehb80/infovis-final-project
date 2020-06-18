class AbstractGraph {

    constructor() {
        if (this.constructor === AbstractGraph) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    append_graph_to(append_to_element){
        throw new Error("Method 'say()' must be implemented.");
    }

}

class BaseGraph extends AbstractGraph {

    constructor(property_series, width, height, margin) {
        super();

        this.margin = margin;

        this.width = width - this.margin.left - this.margin.right;
        this.height = height - this.margin.top - this.margin.bottom;

        this.property_series = property_series;
        this.property_min = Math.floor(d3.min(property_series));
        this.property_max = Math.ceil(d3.max(property_series));
        this.property_avg = Math.round(d3.mean(property_series)*100)/100;
        this.property_std = Math.round(d3.deviation(property_series)*100)/100;
    }

}

class Histogram extends BaseGraph {

    constructor(property_series, bin_size, width, height, margin, min_bin_size, max_bin_size, bin_size_step) {
        super(property_series, width, height, margin);
        this.bin_size = bin_size;
        // Non andrebbero qui, ma calcolate con metodi appositi
        this.min_bin_size = min_bin_size;
        this.max_bin_size = max_bin_size;
        this.bin_size_step = bin_size_step;
    }

    append_graph_to(append_to_element){

        let x_series = d3.range(this.property_min, this.property_max+1, this.bin_size);

        let y_series = x_series
            .map( (x_val, i) => {
                let prop_value_count = 0;
                this.property_series.forEach((curr_prop_series_val)=>{
                    let i_min = x_val;
                    let i_max = x_val + this.bin_size;
                    let is_in_interval = curr_prop_series_val >= i_min && curr_prop_series_val < i_max;
                    if(is_in_interval)
                        prop_value_count++;
                });
                return prop_value_count;
            });

        let points = x_series.map((d, i)=>{ return { "x":d, "y":y_series[i] }; } );

        let x_scale = d3.scaleBand().range([0, this.width]).domain(x_series);
        let y_scale = d3.scaleLinear().range([this.height, 0]).domain([d3.min(y_series), d3.max(y_series)]);

        append_to_element.select("svg").remove();

        let svg = append_to_element
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

        svg.append("g")
            .attr("class", "x_axis")
            .attr("transform", `translate(${-x_scale.bandwidth()/2}, ${this.height})`)
            //.attr("transform", `translate(${0}, ${this.height})`)
            .call(d3
                .axisBottom(x_scale)
                .tickValues(x_scale
                    .domain()
                    .filter((d, i) => {
                        let number_of_points_threshold = 20;

                        let condition_few_points = points.length < number_of_points_threshold;

                        let condition_too_points = points.length > number_of_points_threshold
                            && i === 1 || i === points.length-1 || i === Math.round(points.length/2);

                        if ( condition_few_points || condition_too_points )
                            return i;
                    })
                )
            );

        svg.append("g")
            .attr("class", "y_axis")
            .attr("transform", `translate(0, 0)`)
            .call(d3.axisLeft(y_scale));

        svg.selectAll(".bar")
            .data(points)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d, i) => x_scale(d.x) )
            .attr("width", x_scale.bandwidth())
            .attr("y", (d, i) => y_scale(d.y) )
            .attr("height", (d, i) => this.height - y_scale(d.y));

        return append_to_element;
    }
}

class DensityPlot extends Histogram {

    append_graph_to(append_to_element){

        let x_series = d3.range(this.property_min, this.property_max+1, this.bin_size);

        let x_scale = d3
            .scaleLinear()
            .range(  [0, this.width] )
            .domain( [ d3.min(this.property_series), d3.max(this.property_series)] )
            .nice();

        let kde = kernel_density_estimator(kernel_epanechnikov(this.bin_size), x_scale.ticks(x_series.length));

        let density =  kde( this.property_series ).map(d => { return {"x": d[0], "y": d[1] } } );

        let y_scale = d3
            .scaleLinear()
            .range( [this.height, 0] )
            .domain( [d3.min(density.map(d => d.y)), d3.max(density.map(d => d.y))] )
            .nice();

        append_to_element.select("svg").remove();

        let svg = append_to_element
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

        svg.append("g")
            .attr("class", "x_axis")
            .attr("transform", `translate(0, ${this.height})`)
            .call(d3.axisBottom(x_scale));

        svg.append("g")
            .attr("class", "y_axis")
            .attr("transform", `translate(0, 0)`)
            .call(d3.axisLeft(y_scale));

        svg.append("path")
            .attr("class", "line")
            .datum(density)
            // .attr("fill", "#69b3a2")
            .attr("opacity", ".8")
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("stroke-linejoin", "round")
            .attr("d", d3
                .area()
                .curve(d3.curveBasis)
                .x(d => {return x_scale(d.x); })
                .y1(d => {return y_scale(d.y); })
                .y0(y_scale(d3.min(y_scale.ticks())))
            )
            .attr("transform", `translate(${0},${0})`);
    }

}

class Card {

    constructor(data, property_name, title, description) {
        this.data = data;
        this.title = title;
        this.description = description;
        this.property_name = property_name;

        // card elements
        this.card_details_property = d3.select(`#card_${this.property_name}_details`);
        this.card_details_property_header = d3.select(`#card_${this.property_name}_details_header`);
        this.card_details_property_stats = d3.select(`#card_${this.property_name}_details_stats`);
        this.card_details_property_distribution = d3.select(`#card_${this.property_name}_details_distribution`);
        this.property_series = data.map((d)=>parseFloat(d[this.property_name]));
        this.card_details_graph_controls = d3.select(`#card_${this.property_name}_details_graph_controls`);
    }

    build_card_header(){
        this.card_details_property_header.html(this.title + this.description);
    }

    build_card_graph(graph_object){
        this.graph_object = graph_object;
        if (this.graph_object != null)
            this.graph_object.append_graph_to(this.card_details_property_distribution);
    }

    build_card_stats(){
        if(this.graph_object != null){
            this.card_details_property_stats.html(
                `<p>` +
                    `<b>Mean:</b> ${this.graph_object.property_avg}` +
                    `<br>`+
                    `<b>Standard Deviation</b> ${this.graph_object.property_std}`+
                `</p>`
            )
        }
    }

    build_card_details_graph_controls_graph_type(){
        return `` +
        `<div class="form-group row">`+
            `<div class="custom-control custom-radio">`+
                `<input type="radio" name="card_${this.property_name}_details_graph_controls_plots_kind" id="card_${this.property_name}_details_graph_controls_plots_histogram" checked=true class="custom-control-input">`+
                `<label class="custom-control-label" for="card_${this.property_name}_details_graph_controls_plots_histogram">Histogram</label>`+
            `</div>`+
            `<div class="custom-control custom-radio">`+
                `<input type="radio" name="card_${this.property_name}_details_graph_controls_plots_kind" id="card_${this.property_name}_details_graph_controls_plots_density" class="custom-control-input">`+
                `<label class="custom-control-label" for="card_${this.property_name}_details_graph_controls_plots_density">Density</label>`+
            `</div>`+
        `</div>`
    }

    build_card_details_graph_controls_bin_size(){
        let current_bin_size = this.graph_object.bin_size;
        let min_bin_size = this.graph_object.min_bin_size;
        let max_bin_size = this.graph_object.max_bin_size + this.graph_object.min_bin_size - this.graph_object.bin_size_step;
        let bin_step = this.graph_object.bin_size_step;
        return ``+
            `<div class="form-group row">` +
            `<label id="card_${this.property_name}_details_graph_controls_bin_size_label" for="card_${this.property_name}_details_graph_controls_bin_size" class="col-form-label-sm"> Bin Size (${min_bin_size} - ${max_bin_size}) : <span id="card_${this.property_name}_details_graph_controls_bin_size_value"> ${current_bin_size} </span> </label>`+
            `<div class="col-12">`+
            `<input class="form-control-range" type="range" min=${min_bin_size} max=${max_bin_size} step=${bin_step} value=${current_bin_size} id="card_${this.property_name}_details_graph_controls_bin_size">`+
            `</div>`+
            `</div>`;
    }


}

class CardAge extends Card{

    constructor(data) {
        super(
            data,
            "age",
            `<h5 class='card-title'>Age distribution</h5>`,
            `<p class='card-text'>`+
                            `The graph represents the frequency distributions of the migrants age in the given status.`+
                            `</br>`+
                            `The x-axis represents the age in bins. `+
                            `</br>`+
                            `The y-axis represents the number of migrants with a value of age corresponding at x-value.` +
                            `</br>` +
                            `Use the commands to switch between the Histogram or the Density distribution plot, or to modify the bin size.`+
                        `</p>`,
        );
        this.current_graph_object = this.get_default_histogram;
        this.build_card_header();
        this.build_card_graph(this.current_graph_object(1));
        this.build_card_details_graph_controls();
        this.build_card_stats();
    }

    build_card_details_graph_controls(){
        let self = this;

        this.card_details_graph_controls.html(
            "<div class='input-group mb-2'>" +
                this.build_card_details_graph_controls_graph_type() +
                this.build_card_details_graph_controls_bin_size() +
            "</div>"
        );

        d3.select(`#card_${this.property_name}_details_graph_controls_plots_histogram`)
            .on("input", function(){
                self.current_graph_object = self.get_default_histogram;
                self.build_card_graph(self.current_graph_object(parseInt(self.graph_object.bin_size)));
            });

        d3.select(`#card_${this.property_name}_details_graph_controls_plots_density`)
            .on("input", function(){
                self.current_graph_object = self.get_default_density;
                self.build_card_graph(self.current_graph_object(parseInt(self.graph_object.bin_size)));
            });

        d3.select(`#card_${this.property_name}_details_graph_controls_bin_size`)
            .on("input", function(){
                self.build_card_graph(self.current_graph_object(parseInt(this.value)));
                d3.select(`#card_${self.property_name}_details_graph_controls_bin_size_value`).text(`${this.value}`);
            });
    }

    get_default_histogram(bin_size){
        return new Histogram(
            this.data.map(d=>parseFloat(d["age"])),
            bin_size,
            700,
            400,
            {top:50, right:50, bottom:50, left:50},
            1,
            30,
            1
        )
    }

    get_default_density(bin_size){
        return new DensityPlot(
            this.data.map(d=>parseFloat(d["age"])),
            bin_size,
            700,
            400,
            {top:50, right:50, bottom:50, left:50},
            1,
            30,
            1
        )
    }

}

class CardDaysInStatus extends Card {

    constructor(data) {
        super(
            data,
            "days_in_status",
            `<h5 class='card-title'>Days in status distribution </h5>`,
            `<p class='card-text'>`+
                            `The graph represents the frequency distributions of the days spent in the given status for a migrant.`+
                            `</br>`+
                            `The x-axis represents the number of days grouped in bins. `+
                            `</br>`+
                            `The y-axis represents the number of migrants that have spent the corresponding days in the given status.` +
                            `</br>` +
                            `Use the commands to switch between the Histogram or the Density distribution plot, or to modify the bin size.`+
                        `</p>`
        );
        this.current_graph_object = this.get_default_histogram;
        this.build_card_header();
        this.build_card_graph(this.current_graph_object(30));
        this.build_card_details_graph_controls();
        this.build_card_stats();
    }

    build_card_details_graph_controls() {
        let self = this;

        this.card_details_graph_controls.html(
            "<div class='input-group mb-2'>" +
                this.build_card_details_graph_controls_graph_type()+
                this.build_card_details_graph_controls_bin_size()+
            "</div>"
        );

        d3.select(`#card_${this.property_name}_details_graph_controls_plots_histogram`)
            .on("input", function(){
                self.current_graph_object = self.get_default_histogram;
                self.build_card_graph(self.current_graph_object(parseInt(self.graph_object.bin_size)));
            });

        d3.select(`#card_${this.property_name}_details_graph_controls_plots_density`)
            .on("input", function(){
                self.current_graph_object = self.get_default_density;
                self.build_card_graph(self.current_graph_object(parseInt(self.graph_object.bin_size)));
            });

        d3.select(`#card_${this.property_name}_details_graph_controls_bin_size`)
            .on("input", function(){
                self.build_card_graph(self.current_graph_object(parseInt(this.value)));
                d3.select(`#card_${self.property_name}_details_graph_controls_bin_size_value`).text(`${this.value}`);
            });

    }

    get_default_histogram(bin_size){
        return new Histogram(
            this.data.map(d=>parseFloat(d["days_in_status"])),
            bin_size,
            700,
            400,
            {top:50, right:50, bottom:50, left:50},
            2,
            200,
            20
        )
    }

    get_default_density(bin_size){
        return new DensityPlot(
            this.data.map(d=>parseFloat(d["days_in_status"])),
            bin_size,
            700,
            400,
            {top:50, right:50, bottom:50, left:50},
            2,
            200,
            20
        )
    }

}

function render_page(data, people_in_status, days_in_status, males_in_status, females_in_status){
    d3.select("#people_in_status").text(people_in_status);
    d3.select("#days_in_status").text(days_in_status);
    d3.select("#gender_details").html(``+
        `<span class="badge badge-pill badge-male"> ${males_in_status}&nbsp;% </span>`+
        `&nbsp;&nbsp;`+
        `<span class="badge badge-pill badge-female"> ${females_in_status}&nbsp;% </span>`
    );

    new CardDaysInStatus(data);
    new CardAge(data);
}

d3.csv("./data/guests_in_status.csv").then(function(guest_in_status) {

    let dataset_stats = get_dataset_stats(guest_in_status);

    let number_of_people = dataset_stats.people_in_status;
    let average_days = dataset_stats.days_in_status;
    let females_perc = dataset_stats.female_percentage;
    let males_perc = dataset_stats.male_percentage;

    let change_select = function () {
        let selected_status = (this.value === null || this.value === undefined)?"-1":this.value;

        let selected_status_index = parseInt(selected_status);

        let selected_status_data = guest_in_status;
        let selected_status_people = d3.sum(number_of_people);
        let selected_status_days = Math.round(d3.mean(average_days)*100)/100;
        let selected_status_females = Math.round(d3.mean(females_perc)*100)/100;
        let selected_status_males = Math.round(d3.mean(males_perc)*100)/100;

        if (selected_status !== "-1"){
            selected_status_data = [];
            guest_in_status.forEach(e => {
                if(e.status === selected_status)
                    selected_status_data.push(e);
            });
            selected_status_people = dataset_stats.people_in_status[selected_status_index];
            selected_status_days = dataset_stats.days_in_status[selected_status_index];
            selected_status_females = dataset_stats.female_percentage[selected_status_index];
            selected_status_males = dataset_stats.male_percentage[selected_status_index];
        }

        render_page(selected_status_data, selected_status_people, selected_status_days, selected_status_males, selected_status_females)
    };

    let select_options = [{id:"-1", description:"All Statuses", label:"All Statuses"}];

    NODES.forEach( d => {
        select_options.push({
            description: d.description,
            label: d.label,
            id: d.id
        });
    });

    let select = d3.select("#status_select");

    select
        .selectAll('option')
        .data(select_options)
        .enter()
        .append('option')
        .attr("value", d => d.id )
        .attr("text", d => d.label )
        .text(d => d.label );

    select.on("input", change_select);

    change_select();
});