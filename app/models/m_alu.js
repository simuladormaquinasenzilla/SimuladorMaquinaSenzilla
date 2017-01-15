/*This file is part of Simulador de la Maquina Senzilla.

 Simulador de la Maquina Senzilla is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

 Simulador de la Maquina Senzilla is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
along with Simulador de la Màquina Senzilla.  If not, see <http://www.gnu.org/licenses/>.*/


/**
 * Aquest model representa a l'ALU de la màquina senzilla. Guardarem els valors
 * dels operands destí i font per després fer les operacions corresponents.
 *
 * A més guardem els controls dels flags que activen a l'ALU i el valor del fz.
 */
define(['backbone', 'underscore'], function(Backbone){

    var Alu = Backbone.Model.extend({

        defaults: {
            inputA: "0",            /**< Entrada de dades del registre A. */
            inputB: "0",            /**< Entrada de dades del registre B. */
            sortida: "0",           /**< Resultat de les operacions efectuades per l'ALU. */
            fz:"0",                 /**< Valor del flag de zero en tot moment. */
            flag: ["0","0"]         /**< Valor dels controladors que indiquen a l'ALU quina operació realitzar. */
        },

        /**
         * Aquesta funció fa la suma del contingut dels dos registres A i B.
         * Converteix les instruccions i les dades a binari i fa la suma.
         * Modifica el flag de Zero si el resultat és 0.
         *
         * @returns {number} Retorna -1 si s'ha passat dels bits màxims permesos per la RAM. Altrament 0.
         */
        add_inputs: function(){
            
            var inputA = this.convertir_input(this.get("inputA"));
            var inputB = this.convertir_input(this.get("inputB"));

            var res = parseInt(inputA.toString(),2) + parseInt(inputB.toString(),2);

            // El resultat pasa de la capacitat de la ram
            if (res.toString(2).length>16){
                return -1;
            }
            else {
                this.set("sortida",("00000000000000"+res.toString(2)).substr(-16));
                if (res == 0){this.set("fz","1");}
                else {this.set("fz","0");}
                return 0;
            }
        },

        /**
         * Funció que mou directament el valor del registre B a la sortida de l'ALU.
         *
         * Modifica el flag de Zero si el valor del registre B és 0.
         */
        mov: function () {
            var inputB = this.convertir_input(this.get("inputB"));
            this.set("sortida",("00000000000000"+inputB.toString()).substr(-16));

            if (parseInt(inputB) == 0){this.set("fz","1");}
            else{this.set("fz","0");}
        },

        /**
         *  Compara els valors dels registres A i B.
         *
         *  Modifica el flag de Zero si els valors de A i B són iguals.
         */
        cmp:function () {

            // Si son instruccions
            if(isNaN(parseInt(this.get("inputA"))) ||  isNaN(parseInt(this.get("inputB")))) {
                if ((this.get("inputA").toString()) === (this.get("inputB").toString())){
                    this.set("fz","1");
                }
                else{this.set("fz","0");}
            }
            // Si son dades
            else{
                if ( parseInt(this.get("inputA")) === parseInt(this.get("inputB")) ){
                    this.set("fz","1");
                }
                else{this.set("fz","0");}
            }
        },

        /**
         * Converteix una instrucció o un enter a binari.
         *
         * @param input (String) Una instrucció en format (add 110, 113) o un enter en base decimal.
         * @returns {*} (Enter) Retorna un enter que és l'entrada transformada.
         */
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

               return parseInt((("000000000000000" + operador + fontAux + destiAux).substr(-16)));
           }
           else {
               return (parseInt(input).toString(2));
           }
        }

    });
    return Alu;
});
