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
 * Model que representa la memòria ram de la màquina senzilla.
 *
 */
define(['backbone', 'underscore'], function(Backbone){

    var Ram = Backbone.Model.extend({
        
        defaults: {

            mida: 128,                  /**< La mida màxima de la memòria. */

            /** INSTRUCCIONS */
            etiquetaI:[],               /**< Taula que representa a les etiquetes de les instruccions. */
            operadorI:[],               /**< Taula que representa a les operacions de les instruccions. */
            fontI: [],                  /**< Taula que representa les adreces font de les instruccions. */
            destiI: [],                 /**< Taula que representa a adreces desti de les instruccions. */
            aInstruccions: 0,           /**< Enter que representa l'inici de les instruccions. */

            /** DADES */
            etiquetaD: [],              /**< Taula que representa a les etiquetes de les dades. */
            valorD: [],                 /**< Taula que representa els valors de les dades. */
            aDades: 100,                /**< Enter que representa l'inici de les dades. */
            
            errors: [],                 /**< Captura els errors al carrear fitxers o en la edició de la memòria */
            
            flag: 0,                    /**< Controla el flag de L/E de la RAM. */
            address: 0,                 /**< Adreça actual a la que apunta la RAM. */

            memoria_text:               
                            "# Les instruccions bàsiques del programa son: add, mov, cmp i beq.\n"+
                            "# La seva sintaxis serà de la següent manera:\n"+
                            "\n"+
                            "add 110, 111;\n"+
                            "mov 111, 113;\n"+
                            "cmp 111, 112;\n"+
                            "beq 6;\n"+
                            "\n"+
                            "#Sent opcionals els ';'\n"+
                            "\n"+
                            "# Les dades podran ser.\n"+
                            "110: 1\n"+
                            "111: 0\n"+
                            "112: 3\n"+
                            "\n"+
                            "#Si les volem a una addreça especifica, en cas contrari s'afegeixen\n"+
                            "#automàticament a partir de l'adreça 100:\n"+
                            "\n"+
                            "4\n"+
                            "\n"+

                            "#Finalment els comentaris sempre començaran per '#'.\n"
        },

        /**
         * Inicialitza les taules d'instruccions i dades.
         */
        inicializarMemoria: function () {
            
            var mida = this.get("mida");

            // Instruccions
            var etiquetaI = this.get("etiquetaI");
            var operadorI = this.get("operadorI");
            var fontI = this.get("fontI");
            var destiI= this.get("destiI");

            // Dades
            var etiquetaD = this.get("etiquetaD");
            var valorD = this.get("valorD");

            for (var i=0; i<mida; i++){
                etiquetaI[i]="";operadorI[i]="";fontI[i]="";destiI[i]="";
                etiquetaD[i]="";valorD[i]="";
            }
            
            this.set("etiquetaI",etiquetaI);
            this.set("operadorI",operadorI);
            this.set("fontI",fontI);
            this.set("destiI",destiI);
            this.set("etiquetaD",etiquetaD);
            this.set("valorD",valorD);
        },

        /**
         * Funció que rep per paràmetre un string, el "parseja", si hi ha errors
         * emplena la taula d'errors de la memòria i no grava res en aquestes,
         * altrament les guarda normalment.
         *
         * @param text (String) El texte a processar.
         */
        carregarfitxer: function(text){
            
            console.log("m_ram: cargando fichero...");

            this.set("memoria_text",text);

            // Espresio regular "parser" del ficher de text
            regex =/\s*(?:(?:(?:([a-z][a-z_]*)|(\d+))\s*:)?\s*(?:(add|mov|cmp|beq)\s+(?:((?:[a-z][a-z_]*|\d*))\s*,\s*)?((?:[a-z][a-z_]*|\d+))|((?:(?:\d+|x|".+")\s*)+))?|(\.(?:inst|code|data)[^#]*?))\s*(#[^\n\r]+)?\s*([\n\r;]*)/i;
            //Dividim el contingut en lineas
            var lines = text.split('\n');

            // Instruccions
            var etiqI = [];var operI = [];var fontI = [];var destI = [];

            // Dades
            var etiqD = [];var valorD = [];

            var mida = this.get("mida");

            // Errors
            var err = [];

            var aDades = this.get("aDades");

            var a=0;

            /* --------------------------------------------------------------------------- */

            // Format del procesador de lineas despres de passar per el parser

            // [All0, etiq1, addr2, inst3, source4, dest5, valor6, meta7, comment8, ;9 ]

            /* --------------------------------------------------------------------------- */

            // Carregador de les etiquetes del programa, O(N)

            var etiqdef = [];
            for (var line = 0; line < lines.length; line++){
                aux = lines[line].match(regex);
                //Carrego les etiquetes del programa
                if (aux[1] !== undefined){
                    etiqdef.push(aux[1]);
                }
            }

            /* -------------------------------------------------------------------------- */

            /// PROCESADOR DE LINEAS

            var aux;
            for (line = 0; line < lines.length; line++){

                aux = lines[line].match(regex);

                // Comprovem si hi ha coincidencia positiva amb la expresio regular "regex"
                if (aux!==null) {
                    // Comprovem si hem detectat alguna instruccio definida per la expresio regular

                    //******************************************************************************************************************************************/
                    /*                                                               INSTRUCCIONS                                                             */
                    /*****************************************************************************************************************************************/
                    if (aux[3] !== undefined) { // Existeix una instruccio
                        /* BEQ (3) */
                        if (aux[3] == "beq" || aux[3] == "BEQ") {
                            // mirar desti (5)
                            if (aux[5]!== undefined){                                                                   // Si BEQ te desti
                                if (_.isNaN(parseInt(aux[5]))) {                                                            // Si es una etiqueta el desti
                                    if (_.contains(etiqdef, aux[5])) {                                                          // Si es una etiqueta definida al programa
                                        if (aux[1]!== undefined){                                                                   // Si la instruccio te etiqueta
                                            etiqI.push(aux[1]);operI.push(aux[3]);fontI.push("0");destI.push(aux[5]);                    // GUARDA
                                        }
                                        else {                                                                                      // No te etiqueta
                                            if (aux[2]!==undefined){                                                                    // Si te adreca
                                                if (aux[2]<aDades){                                                                          // Si esta dins del rang de instruccions
                                                    etiqI[aux[2]]="";operI[aux[2]]=aux[3];fontI[aux[2]]="0";destI[aux[2]]=aux[5];                    // GUARDA
                                                }
                                                else{                                                                                       // No esta dins del rang de instruccions
                                                    err.push("["+(line+1)+"] ERROR: l'adreça sobrepasa el limit reservat per les instruccions.\n"); //ERROR
                                                }
                                            }
                                            else{                                                                                       // No te adreca
                                                etiqI.push("");operI.push(aux[3]);fontI.push("0");destI.push(aux[5]);                        // GUARDA
                                            }
                                        }
                                    }
                                    else {
                                        //console.log("ERROR: ["+line+ " "+lines[line]+"], etiqueta desti: "+aux[4]+" no definida.");
                                        err.push("["+(line+1)+"] ERROR: etiqueta desti: "+aux[4]+" no definida.\n");
                                    }
                                }
                                else{                                                                                       // No es una etiqueta el desti
                                    if (aux[1]!== undefined){                                                                   // Si la instruccio te etiqueta
                                        etiqI.push(aux[1]);operI.push(aux[3]);fontI.push("0");destI.push(aux[5]);                    // GUARDA
                                    }
                                    else {                                                                                      // No te etiqueta
                                        if (aux[2]!==undefined){                                                                    // Si te adreca
                                            if (aux[2]<aDades){                                                                          // Si esta dins del rang de instruccions
                                                etiqI[aux[2]]="";operI[aux[2]]=aux[3];fontI[aux[2]]="";destI[aux[2]]=aux[5];                    // GUARDA
                                            }
                                            else{                                                                                       // No esta dins del rang de instruccions
                                                err.push("["+(line+1)+"] ERROR: l'adreça sobrepassa el límit reservat per les instruccions.\n"); //ERROR
                                            }
                                        }
                                        else{                                                                                       // No te adreca
                                            etiqI.push("");operI.push(aux[3]);fontI.push("0");destI.push(aux[5]);                        // GUARDA
                                        }
                                    }
                                }

                            }
                            else{                                                                                       // No te desti
                                //console.log("ERROR: ["+ line + " " + lines[line] + "], desti no definit.");
                                err.push("["+(line+1)+"] ERROR: destí no definit.\n");
                            }
                        }

                        /* ADD, MOV, CMP (3) */
                        else if (aux[3] == "add" || aux[3] == "mov" || aux[3] == "cmp" ){
                            if (aux[4] !== undefined){                                                                  // Si te operador font
                                if(aux[5]!==undefined){                                                                     // Si te operador desti
                                    if (_.isNaN(parseInt(aux[4]))){                                                             // Si operador font es una etiqueta
                                        if (_.contains(etiqdef, aux[4])) {                                                          // Si la etiqueta esta definida al programa
                                            if (_.isNaN(parseInt(aux[5]))){                                                             //Si operador desti es una etiqueta
                                                if (_.contains(etiqdef, aux[5])) {                                                          // Si la etiqueda esta definida al programa
                                                    if (aux[1]!== undefined){                                                                   // Si la instruccio te etiqueta
                                                        etiqI.push(aux[1]);operI.push(aux[3]);fontI.push(aux[4]);destI.push(aux[5]);                    // GUARDA
                                                    }
                                                    else {                                                                                      // No te etiqueta
                                                        if (aux[2]!==undefined){                                                                    // Si te adreca
                                                            if (aux[2]<aDades){                                                                          // Si esta dins del rang de instruccions
                                                                etiqI[aux[2]]="";operI[aux[2]]=aux[3];fontI[aux[2]]=aux[4];destI[aux[2]]=aux[5];            // GUARDA
                                                            }
                                                            else{err.push("["+(line+1)+"] ERROR: l'adreça sobrepassa el límit reservat per les instruccions.\n");}
                                                        }
                                                        else{                                                                                       // No te adreca
                                                            etiqI.push("");operI.push(aux[3]);fontI.push(aux[4]);destI.push(aux[5]);                        // GUARDA
                                                        }
                                                    }
                                                }
                                                else{err.push("["+(line+1)+"] ERROR: etiqueta destí no definida.\n");}
                                            }

                                            else{                                                                                       //Si operador desti NO es una etiqueta (numero)
                                                if (aux[1]!== undefined){                                                                   // Si la instruccio te etiqueta
                                                    etiqI.push(aux[1]);operI.push(aux[3]);fontI.push(aux[4]);destI.push(aux[5]);                    // GUARDA
                                                }
                                                else {                                                                                      // No te etiqueta
                                                    if (aux[2]!==undefined){                                                                    // Si te adreca
                                                        if (aux[2]<aDades){                                                                          // Si esta dins del rang de instruccions
                                                            etiqI[aux[2]]="";operI[aux[2]]=aux[3];fontI[aux[2]]=aux[4];destI[aux[2]]=aux[5];            // GUARDA
                                                        }
                                                        else{err.push("["+(line+1)+"] ERROR: l'adreça sobrepasa el limit reservat per les instruccions.\n");}
                                                    }
                                                    else{                                                                                       // No te adreca
                                                        etiqI.push("");operI.push(aux[3]);fontI.push(aux[4]);destI.push(aux[5]);                    // GUARDA
                                                    }
                                                }

                                            }
                                        }
                                        else {err.push("["+(line+1)+"] ERROR: etiqueta font no definida.\n");}
                                    }
                                    else {                                                                                      // Si el operador font NO es una etiqueta
                                        if (_.isNaN(parseInt(aux[5]))){                                                             // Si el operador desti es una etiqueta
                                            if (_.contains(etiqdef, aux[5])) {                                                          // Si la etiqueda esta definida al programa
                                                if (aux[1]!== undefined){                                                                   // Si la instruccio te etiqueta
                                                    etiqI.push(aux[1]);operI.push(aux[3]);fontI.push(aux[4]);destI.push(aux[5]);                    // GUARDA
                                                }
                                                else {                                                                                      // No te etiqueta
                                                    if (aux[2]!==undefined){                                                                    // Si te adreca
                                                        if (aux[2]<aDades){                                                                          // Si esta dins del rang de instruccions
                                                            etiqI[aux[2]]="";operI[aux[2]]=aux[3];fontI[aux[2]]=aux[4];destI[aux[2]]=aux[5];            // GUARDA
                                                        }
                                                        else{err.push("["+(line+1)+"] ERROR: l'adreça sobrepassa el límit reservat per les instruccions.\n");}
                                                    }
                                                    else{                                                                                       // No te adreca
                                                        etiqI.push("");operI.push(aux[3]);fontI.push(aux[4]);destI.push(aux[5]);                        // GUARDA
                                                    }
                                                }

                                            }
                                            else {err.push("["+(line+1)+"] ERROR: etiqueta destí no definida.\n");}
                                        }

                                        else{                                                                                       // Si el operador desti NO es una etiqueta
                                            //console.log("OK6: ["+line+" "+lines[line]+"], origen=numero, destino=numero.");
                                            if (aux[1]!== undefined){                                                                   // Si la instruccio te etiqueta
                                                etiqI.push(aux[1]);operI.push(aux[3]);fontI.push(aux[4]);destI.push(aux[5]);                    // GUARDA
                                            }
                                            else {                                                                                      // No te etiqueta
                                                if (aux[2]!==undefined){                                                                    // Si te adreca
                                                    if (aux[2]<aDades){                                                                          // Si esta dins del rang de instruccions
                                                        etiqI[aux[2]]="";operI[aux[2]]=aux[3];fontI[aux[2]]=aux[4];destI[aux[2]]=aux[5];            // GUARDA
                                                    }
                                                    else{err.push("["+(line+1)+"] ERROR: l'adreça sobrepassa el límit reservat per les instruccions.\n");}
                                                }
                                                else{                                                                                       // No te adreca
                                                    etiqI.push("");operI.push(aux[3]);fontI.push(aux[4]);destI.push(aux[5]);                        // GUARDA
                                                }
                                            }
                                        }
                                    }
                                }
                                else{err.push("["+(line+1)+"] ERROR: no hi ha cap operador destí definit.\n");}
                            }
                            else {err.push("["+(line+1)+"] ERROR: no hi ha cap operador font definit.\n");}
                        }
                        else {err.push("["+(line+1)+"] ERROR: aquesta instrucció no pertany al repertori d'instruccions de la màquina senzilla (beq,add,mov,cmp)\n");}
                    }


                    /******************************************************************************************************************************************/
                    /*                                                               DADES                                                                    */
                    /*****************************************************************************************************************************************/
                    else if(aux[6]!=undefined){ // Té un valor
                        if(aux[1]!=undefined){                                                              // Si te etiqueta
                            etiqD[a]=aux[1];valorD[a]=aux[6];a++;
                        }
                        else if (aux[2]!=undefined) {                                                       // Si te adreca
                            if(valorD[aux[2]]!=undefined){
                                err.push("["+(line+1)+"] ERROR: aquesta dada sustitueix a una altre ja introduïda anteriorment en el programa.\n");
                            }
                            else{
                                if(aux[2]>mida){
                                    err.push("["+(line+1)+"] ERROR: aquesta dada es pasa del rang de la memoria\n");
                                }
                                else{
                                    var diff = parseInt(aux[2])-aDades;
                                    valorD[diff]=aux[6];
                                    etiqD[diff]="";
                                }
                            }
                        }
                        else{etiqD[a]="";valorD[a]=aux[6];a++;}                                                                      // Només valor
                    }
                    else{
                        //Només espais o salts de linea o eof
                        /*regex_spaces= /^\s+$/;
                        regex_eof = /\n/;*/
                        regex_letters = /[a-zA-Z]+/;

                        //Evitem els comentaris
                        if(aux[8]==undefined){
                            if (lines[line].match(regex_letters)){

                                // Si es una etiqueta sense res al darrera, o considerarem com un instruccio
                                if(aux[1]!=undefined){
                                    etiqI.push(aux[1]);operI.push("add");fontI.push("0");destI.push("0");
                                }
                                else{
                                    err.push("["+(line+1)+"] ERROR: sintaxi no reconeguda pel programa.\n");
                                }
                            }
                            else {}
                        }
                        //console.log("Linea estranya: "+aux);
                    }
                }
                else{err.push("["+(line+1)+"] ERROR: format incorrecte, revisa la línia.\n");}
            }

            /*******************/
            /*     FI         */
            /*****************/

            if (err.length>0){
                this.set("errors",err);
            }

            else {

                var aInstruccions = this.get("aInstruccions");

                var etiquetaIaux = this.get("etiquetaI");
                var operadorIaux = this.get("operadorI");
                var fontIaux = this.get("fontI");
                var destiIaux = this.get("destiI");

                var j=0;
                for (var i = aInstruccions; i < aDades; i++){
                    etiquetaIaux[i] = etiqI[j];
                    operadorIaux[i] = operI[j];
                    fontIaux[i] = fontI[j];
                    destiIaux[i] = destI[j];
                    j++;
                }

                var etiquetaDaux = this.get("etiquetaD");
                var valorDaux = this.get("valorD");

                j = 0;
                for (i = aDades; i < mida; i++){
                    etiquetaDaux[i]=etiqD[j];
                    valorDaux[i]=valorD[j];
                    j++;
                }

                for (i=0;i<mida;i++){
                    if (operadorIaux[i]==undefined){
                        etiquetaIaux[i]="";operadorIaux[i]="add";fontIaux[i]="0";destiIaux[i]="0";
                    }
                    if (valorDaux[i]==undefined){
                        etiquetaDaux[i]="";valorDaux[i]="0";
                    }
                }

                // si no hi ha cap error guardem a la memoria nova
                this.set("etiquetaI",etiquetaIaux);
                this.set("operadorI",operadorIaux);
                this.set("fontI",fontIaux);
                this.set("destiI",destiIaux);

                this.set("etiquetaD",etiquetaDaux);
                this.set("valorD",valorDaux);

            }
        },

        /**
         * Guarda el valor entrat en la taula de operadors d'instrucció
         * en el indiex indicat.
         *
         * @param index (Int) Valor enter de la posició de la taula.
         * @param string (Sring) Valor que volem guardar.
         */
        set_operador: function (index, string) {
            var aux = this.get("operadorI");
            aux[index]=string;
            this.set("operadorI", aux);
        },

        /**
         * Guarda el valor entrat en la taula de fonts d'instrucció
         * en el indiex indicat.
         *
         * @param index (Int) Valor enter de la posició de la taula.
         * @param string (Sring) Valor que volem guardar.
         */
        set_font: function (index, string) {
            var aux = this.get("fontI");
            aux[index]=string;
            this.set("fontI", aux);
        },

        /**
         * Guarda el valor entrat en la taula de destins d'instrucció
         * en el indiex indicat.
         *
         * @param index (Int) Valor enter de la posició de la taula.
         * @param string (Sring) Valor que volem guardar.
         */
        set_desti: function (index, string) {
            var aux = this.get("destiI");
            aux[index]=string;
            this.set("destiI", aux);
        },

        /**
         * Funcio que ens retorna els valors de les taules, ja siguin
         * instruccions o dades.
         *
         * @param index (Int) Valor enter de la posició de la taula.
         * @returns {*} (String) La instrucció o la dada.
         */
        get_dades: function (index) {
            // Dades
            if (index >= this.get("aDades")) {
                var dades = this.get("valorD");
                return dades[index];
            }
            // Instruccions
            else{
                var oper =this.get("operadorI")[index];
                var font = this.get("fontI")[index];
                var desti = this.get ("destiI")[index];
                return (oper+" "+font+" "+desti);
            }
        },

        get_dades_assembly: function (index) {

            // Dades
            if (index >= this.get("aDades")) {
                var dades = this.get("valorD");
                return this.convertir_input(dades[index]);
            }
            // Instruccions
            else{
                var oper =this.get("operadorI")[index];
                var font = this.get("fontI")[index];
                var desti = this.get ("destiI")[index];
                return this.convertir_input(oper+" "+font+" "+desti);
            }
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

                return ("000000000000000" + operador + fontAux + destiAux).substr(-16);
            }
            else {
                return ("0000000000000000"+(parseInt(input)).toString(2)).substr(-16);
            }
        },

        get_font: function (index) {
            var font = this.get("fontI")[index];
            return this.etiquetaToAddress(font);
        },

        get_desti: function (index) {
            var desti = this.get("destiI")[index];
            return this.etiquetaToAddress(desti);
        },

        /**
         *
         * @param string
         * @returns {*}
         */
        etiquetaToAddress: function (string) {
            
            var mida = this.get("mida");
            var etiqI = this.get("etiquetaI");
            var etiqD = this.get("etiquetaD");
            
            var valor = parseInt(string);
            if (_.isNaN(valor)){ //es una etiqueta
                for (var i=0;i<mida;i++){
                    if (string == etiqI[i]){return i;}
                    if (string == etiqD[i]){return i;}
                }
            }
            else {return valor.toString();}
            
        },

        /**
         * Funció que guarda a la memòria una instrucció o dada.
         *
         * @param index (Int) Valor enter de la posició de la taula.
         * @param valor (String) La instrucció o la dada a guardar.
         */
        set_valor: function (index, valor) {

            // Convertir-ho a dades
            if(index>=this.get("aDades")){
                var dades = this.get("valorD");
                dades[index] = (parseInt(valor,2)).toString();
                this.set("valorD",dades);
            }

            // Instruccio
            else{

                var operand = "";
                var oper = valor.substring(0,2);
                var font = valor.substring(2,9);
                var desti = valor.substring(9);
                
                if(oper=="00"){operand="add";}
                else if(oper=="01"){operand="cmp";}
                else if(oper=="10"){operand="mov";}
                else if(oper=="11"){operand="beq";}
                else{}

                var taula_oper = this.get("operadorI");
                taula_oper[index] = operand;
                this.set("operadorI",taula_oper);

                var taula_font = this.get("fontI");
                taula_font[index] = (parseInt(font,2)).toString();
                this.set("fontI",taula_font);

                var taula_desti = this.get("destiI");
                taula_desti[index] = (parseInt(desti,2)).toString();
                this.set("destiI",taula_desti);
            }
        }

    });
    return Ram;
});


