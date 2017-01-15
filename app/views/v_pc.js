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
 * Vista del model del Program Counter,
 * ens serveix per representar el PC
 * en la imatge de la màquina senzilla.
 */
define(['jquery' ,'backbone' , 'underscore', '../models/m_pc'], function($, Backbone, _, npc) {
    
    var vPc = Backbone.View.extend({
        
        /**
         * Inicialitza la vista del registre d'instruccions.
         */
        initialize: function() {
            _.bindAll(this, 'render', 'render_assembly');
            this.model = new npc();
            this.render();
        },

        /**
         * Renderitza per defecte.
         */  
        render: function() {
            var pc_text = document.getElementById("XMLID_346_");
            pc_text.innerHTML = this.model.get("address");
        },
        
        /**
         * Renderitza en mode assemblador.
         */
        render_assembly: function() {
            var pc_text = document.getElementById("XMLID_346_");
            pc_text.innerHTML = this.convertir_input(this.model.get("address"));
        },

        convertir_input:function (input) {
            return (("0000000"+ (input.toString(2))).substr(-7));
        },

    });
    return vPc;
});