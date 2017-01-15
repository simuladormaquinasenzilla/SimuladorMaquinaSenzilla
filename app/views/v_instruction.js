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
 * Vista del model del registre d'instruccions, 
 * ens serveix per representar el registre 
 * en la imatge de la màquina senzilla.
 */
define(['jquery' ,'backbone' , 'underscore', '../models/m_instruction'], function($, Backbone, _, m_instruction) {
    
    var vInstruction = Backbone.View.extend({

        /**
         * Inicialitza la vista del registre d'instruccions.
         */
        initialize: function() {
            _.bindAll(this, 'render', 'render_assembly');
            this.model = new m_instruction;
            this.render();
        },

        /**
         * Renderitza per defecte.
         */
        render: function() {

            // Source
            var source_text = document.getElementById("XMLID_344_");
            source_text.innerHTML = this.model.get("font");

            // Destiny
            var destiny_text = document.getElementById("XMLID_87_");
            destiny_text.innerHTML = this.model.get("desti");

            // Operation
            var operation_text = document.getElementById("XMLID_326_");
            operation_text.innerHTML = (this.model.get("operacio")).toString().replace(',','');

            // Flag
            var flag = document.getElementById("XMLID_328_");
            flag.innerHTML = this.model.get("flag");

        },
        
        /**
         * Renderitza en mode assemblador.
         */
        render_assembly: function() {

            // Source
            // Source
            var source_text = document.getElementById("XMLID_344_");
            source_text.innerHTML = this.convertir_input(this.model.get("font"));

            // Destiny
            var destiny_text = document.getElementById("XMLID_87_");
            destiny_text.innerHTML = this.convertir_input(this.model.get("desti"));

            // Operation
            var operation_text = document.getElementById("XMLID_326_");
            operation_text.innerHTML = (this.model.get("operacio")).toString().replace(',','');

            // Flag
            var flag = document.getElementById("XMLID_328_");
            flag.innerHTML = this.model.get("flag");

        },

        convertir_input:function (input) {
                return (("0000000"+ (input.toString(2))).substr(-7));
        },
        

        /**
         * Renderitza els controladors del registre d'instruccions.
         */
        render_control: function (senyal1,senyal0) {

            var control1 =  document.getElementById("XMLID_259_");
            var control1Flechas = document.getElementById("XMLID_258_");

            if (this.model.get("operacio")[0]=="0"){
                control1.style.stroke=senyal0; // Tomato
                control1.style.strokeWidth= 2;

                control1Flechas.style.strokeWidth= 2;
                control1Flechas.style.stroke=senyal0;
                control1Flechas.style.fill=senyal0;
            }
            else {
                control1.style.stroke=senyal1; // Light Green
                control1.style.strokeWidth= 2;

                control1Flechas.style.strokeWidth= 2;
                control1Flechas.style.stroke=senyal1;
                control1Flechas.style.fill=senyal1;
            }

            var control2 =  document.getElementById("XMLID_176_");
            var control2Flechas = document.getElementById("XMLID_175_");

            if (this.model.get("operacio")[1]=="0"){
                control2.style.stroke=senyal0; // Tomato
                control2.style.strokeWidth= 2;

                control2Flechas.style.strokeWidth= 2;
                control2Flechas.style.stroke=senyal0;
                control2Flechas.style.fill=senyal0;
            }
            else {
                control2.style.stroke=senyal1; // Light Green
                control2.style.strokeWidth= 2;

                control2Flechas.style.strokeWidth= 2;
                control2Flechas.style.stroke=senyal1;
                control2Flechas.style.fill=senyal1;
            }
        }

    });
    return vInstruction;
});