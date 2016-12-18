# view-model-mapper
An visual view model mapping utility to make javascript interfaces more declarative.

## Motivation and synopsis
This Project was inspired by the complexity of syncing data in user interfaces when writing web application. The view is defined through a schema which has taken it's inspiration from relational databases. Everything has an id and is connected together when the page page is parsed. This helps provide a modular and expandable schema for defining new types of behaviours.

## Goals

* [TODO] Persistable animations

* [TODO] Add usage examples

* [TODO] Create persistable functions and models

* [TODO] Allow arrays in models and arrays of models

* Drag and drop UI for building a user interface and mapping model data (Through dev console) 

* Middleware is responsible for more complex data manipulation actions as well as data validation and type casting.

* All views are pluggable and will expose ports and connectors. 
The connections are declarative and can be configured in a sepparate json file.

* View mutators sets state properties based on model values

* Moving elements and saving preserves the edited view state.

* Views and data are only connected by data bindings which can be configured by a third party interface.

* Extract all view->data / view->view connection logic into a serializable data structure.

## Example
Currently uses non compiled es6 syntax and will therefor not work in older browsers.

https://www.legge.se/viewmodelmapper/
