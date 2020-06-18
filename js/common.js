const NODES = [
    { id: "0", label:"In attesa formalizzazione C3", description:""},
    { id: "1", label:"C3 formalizzato", description:""},
    { id: "2", label:"Convocato in Commissione Territoriale", description:""},
    { id: "3", label:"Audizione svolta, in attesa esito decisione della Commissione Territoriale", description:""},
    { id: "4", label:"Diniegato notificato", description:""},
    { id: "5", label:"Diniegato ricorrente in Tribunale", description:""},
    { id: "6", label:"Rigettato notificato", description:""},
    { id: "7", label:"Rigettato ricorrente in Cassazione", description:""},
    { id: "8", label:"Riconoscimento casi speciali - Attesa ritiro PSE", description:""},
    { id: "9", label:"Riconoscimento casi speciali - Ricorrente in Tribunale", description:""},
    { id:"10", label:"Riconoscimento casi speciali - Ricorrente in Cassazione", description:""},
    { id:"11", label:"Riconoscimento casi speciali - PSE ritirato", description:""},
    { id:"12", label:"Riconoscimento status rifugiato/prot. sussidiaria - Attesa ritiro PSE", description:""},
    { id:"13", label:"Riconoscimento status rifugiato/prot. sussidiaria - PSE ritirato", description:""}
];

const LINKS=[
    {
        "source": "0",
        "target": "1",
    },
    {
        "source": "1",
        "target": "2",
    },
    {
        "source": "2",
        "target": "3",
    },
    {
        "source": "3",
        "target": "12",
    },
    {
        "source": "3",
        "target": "4",
    },
    {
        "source": "4",
        "target": "5",
    },
    {
        "source": "5",
        "target": "12",
    },
    {
        "source": "5",
        "target": "6",
    },
    {
        "source": "5",
        "target": "9",
    },
    {
        "source": "5",
        "target": "8",
    },
    {
        "source": "6",
        "target": "7",
    },
    {
        "source": "7",
        "target": "12",
    },
    {
        "source": "8",
        "target": "11",
    },
    {
        "source": "12",
        "target": "13",
    },
    {
        "source": "9",
        "target": "12",
    },
    {
        "source": "9",
        "target": "10",
    },
    {
        "source": "9",
        "target": "8",
    },
    {
        "source": "10",
        "target": "12",
    },
    {
        "source": "10",
        "target": "8",
    },
];

function get_dataset_stats(dataset_csv){
    return {
        "people_in_status": NODES.map(function (status) {
            let counter = 0;
            dataset_csv.forEach(function (entry) {
                if (entry.status === status.id) {
                    counter += 1;
                }
            });
            return counter;
        }),
        "days_in_status": NODES.map(function (status) {
            let counter = 0;
            let people_in_status = 0;
            dataset_csv.forEach(function (entry) {
                if (entry.status === status.id) {
                    people_in_status += 1;
                    counter += parseInt(entry.days_in_status);
                }
            });
            return parseFloat((counter/people_in_status).toFixed(2));
        }),
        "male_percentage": NODES.map(function (status) {
            let males_count = 0;
            let people_in_status = 0;
            dataset_csv.forEach(function (entry) {
                if (entry.status === status.id) {
                    people_in_status += 1;
                    if(entry.gender === "Male")
                        males_count++;
                }
            });
            return parseFloat((males_count/people_in_status*100).toFixed(2));
        }),
        "female_percentage": NODES.map(function (status) {
            let females_count = 0;
            let people_in_status = 0;
            dataset_csv.forEach(function (entry) {
                if (entry.status === status.id) {
                    people_in_status += 1;
                    if(entry.gender === "Female")
                        females_count++;
                }
            });
            return parseFloat((females_count/people_in_status*100).toFixed(2));
        })
    };
}

function kernel_density_estimator(kernel_fn, series) {
    return function(values_array) {
        return series.map( (x) => {
            return [x, d3.mean(values_array, (v) => kernel_fn(x - v) )];
        });
    };
}

function kernel_epanechnikov(bin_size) {
    return function(value) {
        return Math.abs(value /= bin_size) <= 1 ? 0.75 * (1 - value * value) / bin_size : 0;
    };
}