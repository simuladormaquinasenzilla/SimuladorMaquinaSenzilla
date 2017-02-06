/*This file is part of Simulador de la Maquina Senzilla.

 Simulador de la Màquina Senzilla is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Simulador de la Màquina Senzilla is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Simulador de la Màquina Senzilla.  If not, see <http://www.gnu.org/licenses/>.*/


/**
 * Aquest es el fitxer principal de configuració de require.js
 * que carregara els moduls i les dependencies de les llibreries
 */
require.config({

    shim : {
        
        underscore : {
            exports : '_'
        },

        bootstrap : {
            deps : [ 'jquery'],
            exports: 'Bootstrap'
        },

        backbone : {
            deps : [ 'jquery', 'underscore' ],
            exports : 'Backbone'
        },

        jscolor: {
            deps : [ 'v_ui']
        }
    },

    paths: {
        jquery: '../libs/jquery',
        jqueryEasy: '../libs/jqueryEasing.min',
        bootstrap:'../libs/bootstrap.min',

        backbone: '../libs/backbone',
        underscore: '../libs/underscore',

        classie: 'utils/classie',
        cbpAnimatedHeader: 'utils/cbpAnimatedHeader',
        smoothPageScroll: 'utils/smoothPageScroll',
        
        jscolor: '../libs/jscolor',

        v_ui: 'v_ui'

    }
});


/*El primer argument es un array que ens indica les dependencies necessaries per carregar el modul
* despres guarda el valor amb la funcio de callback*/
require(['jquery', 'jqueryEasy', 'bootstrap', 'classie', 'cbpAnimatedHeader', 'smoothPageScroll',
    'backbone', 'underscore', 'app','jscolor'], function($, _, _, _, _, _, Backbone, _ , App,_) {
    App.initialize();
});