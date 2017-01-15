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
 * Vista del model del multiplexador,
 * ens serveix per representar el multiplexador
 * en la imatge de la màquina senzilla.
 */
define(['jquery' ,'backbone' , 'underscore', '../models/m_mux'], function($, Backbone, _, m_mux) {
    
    var vMux = Backbone.View.extend({
        
        /**
         * Inicialitza la vista del multiplexador.
         */
        initialize: function() {
            _.bindAll(this, 'render');
            this.model = new m_mux;
            this.render();
        },

        /**
         * Renderitza per defecte.
         */
        render: function() {
            var source_text = document.getElementById("XMLID_340_");
            source_text.innerHTML = (this.model.get("address")).toString().replace(',','');
            
        }
    });
    return vMux;
});