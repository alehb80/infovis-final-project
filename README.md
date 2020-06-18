# Information Visualization - Final Project

Final project for [Information Visualization](http://www.dia.uniroma3.it/~infovis/) course held at the "Roma Tre" University of Rome by professor [Maurizio Patrignani](http://www.dia.uniroma3.it/~compunet/www/view/person.php?id=titto).

## Author

- Alessio Ligios - [alessioligios@gmail.com](mailto:alessioligios@gmail.com)

## Goal of The Project
 
The goal of the project is to visualize the process of managing the legal status that every migrant goes through during the hospitality process at the reception centers in the province of Rome.

Through this system, the Public Authority that manages this situation can view the critical points of the legal path and act promptly to try to reduce the average time that guests spend in the most problematic legal status, in order to have a legal path that is fluid and as efficient as possible.

## Repository Organization

```/bin/bash
├── infovis_project   # project main directory
│   │  
│   ├── about_me.html
│   ├── graph.html
│   ├── index.html
│   ├── stats.html
│   │ 
│   ├── css # all custom css are in this folder.
│   │   └── style.css
│   │
│   ├── data  # all data used for the project is in this folder
│   │   │ 
│   │   └── guests_in_status.csv  # all guests's data
│   │ 
│   ├── img # this folders contains all the images used for the views.
│   │   │ 
│   │   └── about_me-alessio.jpeg
│   │ 
│   ├── js # Javascript files used in the views
│   │   ├── common.js
│   │   ├── dag.js
│   │   ├── stats.back.js
│   │   └── stats.js
│   │ 
│   └── vendor # additional libraries used for the project
│       ├── bmd  
│       ├── d3 
│       ├── jquery
│       ├── popperjs
│       └── raleway
│ 
└── readme.md
```

## Dataset

The dataset represents the set of guests who are in reception centers in the province of Rome.

This focuses on information regarding the legal path that each individual guest travels from the moment he asks for asylum permit (module C3) to the moment when he is granted or denied it.

This path is composed of 14 status, each of which represents the legal status in which the guest is at a specific moment, which are:

- `0 - In attesa formalizzazione C3`
- `1 - C3 formalizzato`
- `2 - Convocato in Commissione Territoriale`
- `3 - Audizione svolta, in attesa esito decisione della Commissione Territoriale`
- `4 - Diniegato notificato`
- `5 - Diniegato ricorrente in Tribunale`
- `6 - Rigettato notificato`
- `7 - Rigettato ricorrente in Cassazione`
- `8 - Riconoscimento casi speciali - Attesa ritiro PSE`
- `9 - Riconoscimento casi speciali - Ricorrente in Tribunale`
- `10 - Riconoscimento casi speciali - Ricorrente in Cassazione`
- `11 - Riconoscimento casi speciali - PSE ritirato`
- `12 - Riconoscimento status rifugiato/prot. sussidiaria - Attesa ritiro PSE`
- `13 - Riconoscimento status rifugiato/prot. sussidiaria - PSE ritirato`

For each guest we have the following information:

- `first_name`: the first name of the guest
- `last_name` : the last name of the guest
- `gender`: the gender of the guest
- `age`: the age of the guest
- `status`: the legal status in which the guest is located
- `days_in_status`: the number of days that the guest is in the specific legal status

## Dependencies

Under the folder `infovis_project/vendor` are stored all the libraries used for the project:

- [Bootstrap Material Design - v4](https://fezvrasta.github.io/bootstrap-material-design/): this framework was used for styling the pages (`infovis_project/vendor/bmd`)
- [D3js - v4](https://d3js.org/) : the core library of the project (`infovis_project/vendor/d3`)
- [Jquery - v3.3.1](https://jquery.com/) : the core library of the project (`infovis_project/vendor/jquery`)
- [popperjs - v1.12.6](https://popper.js.org/) : support library for Bootstrap Material Design (`infovis_project/vendor/popperjs`)
- [Raleway Fonts](https://fonts.google.com/specimen/Raleway) : the font used (`infovis_project/vendor/raleway`)

# Pages

This web application has 3 main views: `visualization`, `stats` and `about me`.
 
## Visualization

The main page of the web application is `visualization`.

This page presents the visualization of the data in question, placed in the form of a directed acyclic graph (DAG).

The page is structured so that the DAG takes up all the space.

At the top right there is the legend of the graph's nodes, which gives indications on the meaning of the size of the nodes and on their chromatic gradation; by clicking on it you can reduce it.

By positioning the pointer on a node it is possible to see a pop-up menu that gives us additional information on the pointed node, namely:

- `Number of people`: the number of guests who are in the specific legal status
- `Average days`: the average time that guests spend in that specific legal status
 
## Stats

The `stats` page shows the distribution of data; in particular there are two graphs:

- `Distribution of the number of days in a status` represents the frequency distributions of the days spent by a migrant in a given legal status.
- `Distribution of the migrants age` represents the frequency distributions of the migrants's age in a given legal status.

In these graphs it is possible both to select the type of distribution to be shown (histogram or density) and to change the size of the bin in the x-axis.

At the top left of the page there is a form through which it is possible to select a specific legal status, consequently the graphs will refer to it. By default the page shows information on all states.

At the top right of the page statistical information is shown about the number of migrants, the average of the days spent in a legal status and the percentage of men and women.


## About Me

The `about me` page shows information about the author of the project. 