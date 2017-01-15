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
 * Vista del model d'ALU, ens serveix per representar l'ALU
 * en la imatge de la màquina senzilla.
 */
define(['jquery' ,'backbone' , 'underscore', '../models/m_alu'], function($, Backbone, _, nalu) {

    var vAlu = Backbone.View.extend({

        /**
         * Inicialitza la vista de l'ALU
         */
        initialize: function(){
            _.bindAll(this, 'render');
            this.model = new nalu();
            this.render();
        },

        /**
         * Renderitza per defecte.
         */
        render: function() {
            var flag = document.getElementById("XMLID_338_");
            flag.innerHTML = this.model.get("flag").toString().replace(',','');

            var fz = document.getElementById("XMLID_334_");
            fz.innerHTML = this.model.get("fz");
        },
        
        /**
         * Renderitza els controladors de l'ALU.
         */
        render_control: function (senyal1,senyal0) {

            var control1 =  document.getElementById("XMLID_267_");
            var control1Flechas = document.getElementById("XMLID_266_");

            if (this.model.get("flag")[0]=="0"){
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

            var control2 =  document.getElementById("XMLID_265_");
            var control2Flechas = document.getElementById("XMLID_225_");

            if (this.model.get("flag")[1]=="0"){
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
    return vAlu;
});