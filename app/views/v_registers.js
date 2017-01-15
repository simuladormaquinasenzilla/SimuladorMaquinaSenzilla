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
 * Vista del model dels registres, ens serveix per representar aquests
 * en la imatge de la màquina senzilla.
 */
define(['jquery' ,'backbone' , 'underscore', '../models/m_registers'], function($, Backbone, _, m_registers) {

    var vRegisters = Backbone.View.extend({

        /**
         * Inicialitza la vista dels registres
         */
        initialize: function() {
            _.bindAll(this, 'render','render_assembly');
            this.model = new m_registers;
            this.render();
        },

        /**
         * Renderitza per defecte.
         */
        render: function() {
            // A register
            var MflagA_text = document.getElementById("XMLID_330_");
            MflagA_text.innerHTML = (this.model.get("MflagA")).toString().replace(',','');

            var dataA_text = document.getElementById("XMLID_348_");
            dataA_text.innerHTML = this.model.get("dataA");
            
            // B register
            var MflagB_text = document.getElementById("XMLID_332_");
            MflagB_text.innerHTML = (this.model.get("MflagB")).toString().replace(',','');

            var dataB_text = document.getElementById("XMLID_350_");
            dataB_text.innerHTML = this.model.get("dataB");
        },

        /**
         * Renderitza en mode assemblador.
         */
        render_assembly: function() {
            // A register
            var MflagA_text = document.getElementById("XMLID_330_");
            MflagA_text.innerHTML = (this.model.get("MflagA")).toString().replace(',','');

            var dataA_text = document.getElementById("XMLID_348_");
            dataA_text.innerHTML = this.convertir_input(this.model.get("dataA"));

            // B register
            var MflagB_text = document.getElementById("XMLID_332_");
            MflagB_text.innerHTML = (this.model.get("MflagB")).toString().replace(',','');

            var dataB_text = document.getElementById("XMLID_350_");
            dataB_text.innerHTML = this.convertir_input(this.model.get("dataB"));
         },

        convertir_input:function (input) {

            if (isNaN(parseInt(input))){

                var operador="";
                var oper = input.split(" ");

                if (oper[0]=="add"){operador = "00"}
                else if (oper[0]=="beq"){operador = "11";}
                else if (oper[0]=="mov"){operador = "10";}
                else if (oper[0]=="cmp"){operador = "01";}
                else {}

                var fontAux = ("0000000" + (parseInt(oper[1]).toString(2))).substr(-7);
                var destiAux = ("0000000" + (parseInt(oper[2]).toString(2))).substr(-7);
                return ((("0000000000000000" + operador + fontAux + destiAux).substr(-16)));
            }
            else {
                return (("0000000000000000"+ (parseInt(input).toString(2))).substr(-16));
            }
        }


    });
    return vRegisters;
});