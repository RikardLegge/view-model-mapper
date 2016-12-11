# view-model-mapper
An visual view model mapping utility to make javascript interfaces more declarative.

## Motivation
This Project was inspired by the complexity of syncing data in user interfaces when writing web application.

## Goals

* [TODO] Drag and drop UI for building a user interface and mapping model data

* [TODO] All views are pluggable and will expose ports and connectors. 
The connections are declarative and can be configured in a sepparate json file.

* [TODO] Middleware is responsible for more complex data manipulation actions as well as data validation and type casting.

* Views and data are only connected by data bindings which can be configured by a third party interface.

* Extract all view->data / view->view connection logic into a serializable data structure.

## Example
Currently uses non compiled es6 syntax and will therefor not work in older browsers.

https://www.legge.se/viewmodelmapper/
