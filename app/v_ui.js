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
 * Vista del model de la Ui, ens serveix per representar el model
 * de la Ui, a part de pintar i mostrar els canvis que es fan
 * en la interficie.
 */
define(['jquery' ,'backbone' , 'underscore', 'm_ui'],function ($, Backbone, _, v_ui) {
        
    
    var vUi = Backbone.View.extend({
        
        el: '#services',
        events: {
            "click #clock_plus" : "clock_plus",
            "click #clock_less" : "clock_less",
            "click #reset" : "reset_clock",
            "click #kill" : "kill",
            "click #save-colors" : "load_colors",
            "change input[name='fileInput']": 'render_memoria_fitxer',
            "click #btnLaunch" : "editar_memoria",
            "click #btnSave" : "guardar_edicio_memoria",
            "click #assemblador" : "load_checkbox",
            "focusout #senyal1-color":"load_colors",
            "focusout #senyal0-color":"load_colors",
            "focusout #bus-color":"load_colors"

        },

        /**
         *  Inicialitza la interficie.
         */
        initialize: function() {
            _.bindAll(this, 'render', 'fetch', 'decodificacio', 'operandB', 'operandA','execucio','execucioCMP','clock_plus', 'clock_less');
            this.model = new v_ui();
            this.render();
        },

        /**
         * Renderitza la maquina senzilla.
         */
        render: function() {
        },

        /* ======================================================================= */

        /**
         * Executa i pinta el segguent estat de la maquina senzilla.
         */
        clock_plus: function () {
            this.load_colors();
            if (this.model.get("state")==0){this.afegir_log_consola("Primer edita o afegeix un fitxer de configuració a la RAM.",2);}
            else{
                if (this.model.get("state") == 1){          // Fetch
                    if(this.model.get("pc").model.get("address")>=this.model.get("ram").model.get("aDades")){
                        this.afegir_log_consola("FI DEL PROGRAMA, la següent instrucció s'executa fora del rang d'instruccions [0..99].",2);
                    }
                    else{
                        this.model.set("clock",this.model.get("clock")+1);
                        this.fetch();
                        this.model.fetch();
                        this.marcar_taula_instuccio("mytable",this.model.get("pc").model.get("address")-1,"#C4E6F5");
                        this.afegir_log_consola("PC: "+(this.model.get("pc").model.get("address")-1)+" - ("+this.model.get_instruccio()+") - Fetch",1);
                        //this.pintar_diagrama(this.model.get("diagrama"));
                    }
                }
                else if ((this.model.get("state") == 2)){   // Descodificacio
                    this.model.set("clock",this.model.get("clock")+1);
                    this.decodificacio();
                    this.model.decodificacio();
                    this.afegir_log_consola("PC: "+(this.model.get("pc").model.get("address")-1)+" - ("+this.model.get_instruccio()+") - Decodificacio",1);
                    //this.pintar_diagrama(this.model.get("diagrama"));

                }
                else if (this.model.get("state") == 3){     // Cerca operand B
                    this.model.set("clock",this.model.get("clock")+1);
                    this.operandB();
                    this.model.operandB();
                    this.afegir_log_consola("PC: "+(this.model.get("pc").model.get("address")-1)+" - ("+this.model.get_instruccio()+") - Cerca operand B",1);
                    //this.pintar_diagrama(this.model.get("diagrama"));


                }
                else if (this.model.get("state") == 4){     // Cerca operand A
                    this.model.set("clock",this.model.get("clock")+1);
                    this.operandA();
                    this.model.operandA();
                    this.afegir_log_consola("PC: "+(this.model.get("pc").model.get("address")-1)+" - ("+this.model.get_instruccio()+") - Cerca operand A",1);
                    //this.pintar_diagrama(this.model.get("diagrama"));


                }
                else if (this.model.get("state") == 5){     //Execucio ADD
                    var limit = this.model.execucio();
                    if (limit==-1) {
                        this.afegir_log_consola("PC: "+(this.model.get("pc").model.get("address")-1)+" - ("+this.model.get_instruccio()+") FI DEL PROGRAMA, la següent instrucció sobrepassa la capacitat de la memòria (16 bits).",2);
                    }
                    else {
                        this.execucio();
                        this.model.get("alu").render_control(this.model.get("senyal1"),this.model.get("senyal0"));
                        this.model.set("clock",this.model.get("clock")+1);
                        this.marcar_resultat(this.model.get("instruction").model.get("desti"));
                        var svgItem;
                        svgItem = document.getElementById("clock");
                        svgItem.innerHTML = this.model.get("clock");
                        this.afegir_log_consola("PC: "+(this.model.get("pc").model.get("address")-1)+" - ("+this.model.get_instruccio()+") - Execució add",1);
                        //this.pintar_diagrama(this.model.get("diagrama"));
                    }
                }
                else if (this.model.get("state") == 6){     //Execucio CMP
                    this.model.set("clock",this.model.get("clock")+1);
                    this.execucioCMP();
                    this.model.execucio();
                    this.afegir_log_consola("PC: "+(this.model.get("pc").model.get("address")-1)+" - ("+this.model.get_instruccio()+") - Execució cmp",1);
                    //this.pintar_diagrama(this.model.get("diagrama"));


                }
                else if (this.model.get("state") == 7){     // Consulta FZ
                    this.model.set("clock",this.model.get("clock")+1);
                    this.afegir_log_consola("PC: "+(this.model.get("pc").model.get("address")-1)+" - ("+this.model.get_instruccio()+") - Consulta FZ",1);
                    this.consultaFZ();
                    this.model.consultaFZ();
                    //this.pintar_diagrama(this.model.get("diagrama"));


                }
                else if (this.model.get("state") == 8){     //Execucio MOV
                    this.model.set("clock",this.model.get("clock")+1);
                    var limit = this.model.execucio();
                    if (limit == -1){return -1;}
                    else {this.execucio();this.marcar_resultat(this.model.get("instruction").model.get("desti"));this.model.get("alu").render_control(this.model.get("senyal1"),this.model.get("senyal0"));}
                    this.afegir_log_consola("PC: "+(this.model.get("pc").model.get("address")-1)+" - ("+this.model.get_instruccio()+") - Execució mov",1);
                    //this.pintar_diagrama(this.model.get("diagrama"));

                }
            }
        },

        /**
         * Executa i pinta el estat anterior de la maquina senzilla.
         */
        clock_less: function () {

            if (this.model.get("state")==0){
                this.afegir_log_consola("Primer edita o afegeix un fitxer de configuració a la RAM.",2);
            }

            else {

                if (this.model.get("clock")==0){
                    this.afegir_log_consola("No pots anar més enrera del clock 0.",2);
                }
                else if (this.model.get("clock")==1){
                    this.default();
                    this.marcar_taula_default();
                    //this.pintar_diagrama_default();
                    this.model.reset_clock();
                    var svgItem;
                    svgItem = document.getElementById("clock");
                    svgItem.innerHTML = this.model.get("clock");
                    this.afegir_log_consola("Estat Inicial",1);
                }
                else{

                    this.model.set("clock",this.model.get("clock")-1);

                    if (this.model.get("state") == 2) {          // Fetch <- Decode
                        var valor = this.model.carregarInstruccioAnterior();

                        if (valor == 1) {
                            this.model.fetch();
                            this.marcar_taula_instuccio("mytable",this.model.get("pc").model.get("address")-1,"#C4E6F5");
                            this.model.decodificacio();
                            this.model.operandB();
                            this.model.operandA();
                            var limit = this.model.execucio();
                            if (limit == -1){return -1;}
                            else {this.execucio();this.marcar_resultat(this.model.get("instruction").model.get("desti"));}
                            this.afegir_log_consola("PC: "+(this.model.get("pc").model.get("address")-1)+" - ("+this.model.get_instruccio() + ") Execució add", 1);
                            var diagr = this.model.get("diagrama");
                            for (var i=0;i<6;i++){
                                diagr.pop();
                            }
                            this.model.set("diagrama",diagr);
                            //this.pintar_diagrama(this.model.get("diagrama"));

                        }
                        else if (valor == 2) {
                            this.model.fetch();
                            this.marcar_taula_instuccio("mytable",this.model.get("pc").model.get("address")-1,"#C4E6F5");
                            this.model.decodificacio();
                            this.model.operandB();

                            var limit = this.model.execucio();
                            if (limit == -1){return -1;}
                            else {this.execucio();this.marcar_resultat(this.model.get("instruction").model.get("desti"));}

                            this.afegir_log_consola("PC: "+(this.model.get("pc").model.get("address")-1)+" - ("+this.model.get_instruccio() + ") - Execució mov", 1);
                            var diagr = this.model.get("diagrama");
                            for (var i=0;i<5;i++){
                                diagr.pop();
                            }
                            this.model.set("diagrama",diagr);
                            //this.pintar_diagrama(this.model.get("diagrama"));

                        }
                        else if (valor == 3) {
                            this.model.fetch();
                            this.marcar_taula_instuccio("mytable",this.model.get("pc").model.get("address")-1,"#C4E6F5");
                            this.model.decodificacio();
                            this.consultaFZ();
                            this.model.consultaFZ();
                            this.afegir_log_consola("PC: "+(this.model.get("pc").model.get("address"))+" - ("+this.model.get_instruccio() + ") - Consulta FZ", 1);
                            var diagr = this.model.get("diagrama");
                            for (var i=0;i<4;i++){
                                diagr.pop();
                            }
                            this.model.set("diagrama",diagr);
                            //this.pintar_diagrama(this.model.get("diagrama"));

                        }
                        else if (valor == 4) {
                            this.model.fetch();
                            this.marcar_taula_instuccio("mytable",this.model.get("pc").model.get("address")-1,"#C4E6F5");
                            this.model.decodificacio();
                            this.model.operandB();
                            this.model.operandA();
                            this.execucioCMP();
                            this.model.execucio();
                            this.afegir_log_consola("PC: "+(this.model.get("pc").model.get("address")-1)+" - ("+this.model.get_instruccio() + ") - Execució cmp", 1);
                            var diagr = this.model.get("diagrama");
                            for (var i=0;i<6;i++){
                                diagr.pop();
                            }
                            this.model.set("diagrama",diagr);
                            //this.pintar_diagrama(this.model.get("diagrama"));

                        }
                    }
                    else if ((this.model.get("state") == 3)) {   // CercaB <- Decode
                        this.model.carregarInstruccioAnterior();
                        this.fetch();
                        this.model.fetch();
                        this.marcar_taula_instuccio("mytable",this.model.get("pc").model.get("address")-1,"#C4E6F5");
                        this.afegir_log_consola("PC: "+(this.model.get("pc").model.get("address")-1)+" - ("+this.model.get_instruccio() + ") - Fetch", 1);
                        var diagr = this.model.get("diagrama");
                        for (var i=0;i<2;i++){
                            diagr.pop();
                        }
                        this.model.set("diagrama",diagr);
                        //this.pintar_diagrama(this.model.get("diagrama"));

                    }
                    else if (this.model.get("state") == 4) {     // CercaB <- CercaA
                        this.model.carregarInstruccioAnterior();
                        this.model.fetch();
                        this.marcar_taula_instuccio("mytable",this.model.get("pc").model.get("address")-1,"#C4E6F5");
                        this.decodificacio();
                        this.model.decodificacio();
                        this.afegir_log_consola("PC: "+(this.model.get("pc").model.get("address")-1)+" - ("+this.model.get_instruccio() + ") - Decodificacio", 1);
                        var diagr = this.model.get("diagrama");
                        for (var i=0;i<3;i++){
                            diagr.pop();
                        }
                        this.model.set("diagrama",diagr);
                        //this.pintar_diagrama(this.model.get("diagrama"));

                    }
                    else if (this.model.get("state") == 5) {     //  CercaA <- ADD
                        this.model.carregarInstruccioAnterior();
                        this.model.fetch();
                        this.marcar_taula_instuccio("mytable",this.model.get("pc").model.get("address")-1,"#C4E6F5");
                        this.model.decodificacio();
                        this.operandB();
                        this.model.operandB();
                        this.afegir_log_consola("PC: "+(this.model.get("pc").model.get("address")-1)+" - ("+this.model.get_instruccio() + ") - Cerca operand B", 1);
                        var diagr = this.model.get("diagrama");
                        for (var i=0;i<4;i++){
                            diagr.pop();
                        }
                        this.model.set("diagrama",diagr);
                        //this.pintar_diagrama(this.model.get("diagrama"));



                    }
                    else if (this.model.get("state") == 6) {     // CercaA <- CMP
                        this.model.carregarInstruccioAnterior();
                        this.model.fetch();
                        this.marcar_taula_instuccio("mytable",this.model.get("pc").model.get("address")-1,"#C4E6F5");
                        this.model.decodificacio();
                        this.operandB();
                        this.model.operandB();
                        this.afegir_log_consola("PC: "+(this.model.get("pc").model.get("address")-1)+" - ("+this.model.get_instruccio() + ") - Cerca operand B", 1);
                        var diagr = this.model.get("diagrama");
                        for (var i=0;i<4;i++){
                            diagr.pop();
                        }
                        this.model.set("diagrama",diagr);
                        //this.pintar_diagrama(this.model.get("diagrama"));



                    }
                    else if (this.model.get("state") == 7) {
                        this.model.carregarInstruccioAnterior();
                        this.fetch();
                        this.model.fetch();
                        this.marcar_taula_instuccio("mytable",this.model.get("pc").model.get("address")-1,"#C4E6F5");
                        this.marcar_taula_instuccio("mytable",this.model.get("pc").model.get("address")-1,"#C4E6F5");
                        this.afegir_log_consola("PC: "+(this.model.get("pc").model.get("address")-1)+" - ("+this.model.get_instruccio() + ") - Fetch", 1);
                        var diagr = this.model.get("diagrama");
                        for (var i=0;i<2;i++){
                            diagr.pop();
                        }
                        this.model.set("diagrama",diagr);
                        //this.pintar_diagrama(this.model.get("diagrama"));



                    }
                    else if (this.model.get("state") == 8) {     // MOV
                        this.model.carregarInstruccioAnterior();
                        this.model.fetch();
                        this.marcar_taula_instuccio("mytable",this.model.get("pc").model.get("address")-1,"#C4E6F5");
                        this.decodificacio();
                        this.model.decodificacio();
                        this.afegir_log_consola("PC: "+(this.model.get("pc").model.get("address")-1)+" - ("+this.model.get_instruccio() + ") - Decodificacio", 1);
                        var diagr = this.model.get("diagrama");
                        for (var i=0;i<3;i++){
                            diagr.pop();
                        }
                        this.model.set("diagrama",diagr);
                        //this.pintar_diagrama(this.model.get("diagrama"));


                    }
                    else if (this.model.get("state") == 1) {
                        var valor = this.model.carregarInstruccioAnterior();

                        if (valor == 1 || valor == 4) {
                            this.model.fetch();
                            this.marcar_taula_instuccio("mytable",this.model.get("pc").model.get("address")-1,"#C4E6F5");
                            this.model.decodificacio();
                            this.model.operandB();
                            this.operandA();
                            this.model.operandA();
                            this.afegir_log_consola("PC: "+(this.model.get("pc").model.get("address")-1)+" - ("+this.model.get_instruccio() + ") - Cerca operand A", 1);
                            var diagr = this.model.get("diagrama");
                            for (var i=0;i<5;i++){
                                diagr.pop();
                            }
                            this.model.set("diagrama",diagr);
                            //this.pintar_diagrama(this.model.get("diagrama"));

                        }
                        else if (valor == 2) {
                            this.model.fetch();
                            this.marcar_taula_instuccio("mytable",this.model.get("pc").model.get("address")-1,"#C4E6F5");
                            this.model.decodificacio();
                            this.operandB();
                            this.model.operandB();
                            this.afegir_log_consola("PC: "+(this.model.get("pc").model.get("address")-1)+" - ("+this.model.get_instruccio() + ") - Cerca operand B", 1);
                            var diagr = this.model.get("diagrama");
                            for (var i=0;i<4;i++){
                                diagr.pop();
                            }
                            this.model.set("diagrama",diagr);
                            //this.pintar_diagrama(this.model.get("diagrama"));


                        }
                        else if (valor == 3) {
                            this.model.fetch();
                            this.marcar_taula_instuccio("mytable",this.model.get("pc").model.get("address")-1,"#C4E6F5");
                            this.decodificacio();
                            this.model.decodificacio();
                            this.afegir_log_consola("PC: "+(this.model.get("pc").model.get("address")-1)+" - ("+this.model.get_instruccio() + ") - Decodificacio", 1);
                            var diagr = this.model.get("diagrama");
                            for (var i=0;i<3;i++){
                                diagr.pop();
                            }
                            this.model.set("diagrama",diagr);
                            //this.pintar_diagrama(this.model.get("diagrama"));


                        }
                    }
                }
            }

        },

        /* ======================================================================= */

        /**
         * Pinta per defecte la maquina senzilla.
         */
        default: function (){

            var defaultLines = [
                "XMLID_14_","XMLID_15_","XMLID_16_","XMLID_17_","XMLID_306_",                        // PC -> MUX,
                "XMLID_426_",                                                                        // MUX -> RAM
                "XMLID_422_","XMLID_13_",                                                            // MUX -> +1
                "XMLID_192_",                                                                        // +1 -> PC
                "XMLID_6_","XMLID_139_","XMLID_138_","XMLID_343_","XMLID_122_","XMLID_149_",         // RAM -> Tot
                "XMLID_181_","XMLID_274_",                                                           // MUX
                "XMLID_52_", "XMLID_167_",                                                           // @ + 1 -> PC
                "XMLID_48_", "XMLID_261_",                                                           // M -> IR
                "XMLID_50_", "XMLID_360_",                                                           // Lectura / Escritura
                "XMLID_262_",                                                                        // M -> A
                "XMLID_58_", "XMLID_57_","XMLID_254_",                                               // M -> B
                "XMLID_26_","XMLID_25_","XMLID_23_",                                                 // Recuadre Instruccio
                "XMLID_59_", "XMLID_171_",                                                           // Z -> FZ
                "XMLID_186_",                                                                        // FZ
                "XMLID_4_",                                                                          // Recuadre B
                "XMLID_5_",                                                                          // Recuadre A
                "XMLID_9_",                                                                          // Recuadre ALU
                "XMLID_159_","XMLID_20_","XMLID_21_",                                                // MUX 2
                "XMLID_22_","XMLID_19_","XMLID_154_",                                                // MUX 3
                "XMLID_42_","XMLID_43_","XMLID_143_",                                                // ALU -> RAM
                "XMLID_114_",                                                                        // Registro A -> ALU
                "XMLID_112_",                                                                        // Registro B -> ALU
                "XMLID_264_",                                                                        // FZ
                "XMLID_420_",                                                                        // Recuadre FZ
                "XMLID_267_",                                                                        // ALU -> 0 X
                "XMLID_265_",                                                                        // ALU -> X 0
                "XMLID_259_",                                                                        // CO -> 0 X
                "XMLID_176_",                                                                        // ALU -> X 0
                "XMLID_3_",                                                                          // RAM
                "XMLID_9_",                                                                          // ALU
                
                "XMLID_305_","XMLID_425_","XMLID_421_","XMLID_191_","XMLID_121_","XMLID_148_",       // Flechas
                "XMLID_342_","XMLID_180_","XMLID_273_","XMLID_166_","XMLID_250_","XMLID_359_",
                "XMLID_260_","XMLID_253_","XMLID_170_","XMLID_185_","XMLID_158_","XMLID_153_","XMLID_137_",
                "XMLID_111_","XMLID_113_","XMLID_243_","XMLID_266_","XMLID_225_","XMLID_258_","XMLID_175_"

            ];

            var svgItem;

            for (var i=0; i<defaultLines.length; i++){
                svgItem = document.getElementById(defaultLines[i]);
                svgItem.style.stroke="";
                svgItem.style.strokeWidth= 1;
                svgItem.style.strokeDasharray=0;
                svgItem.style.animation= "";
                svgItem.style.fill = ""
            }
        },

        /**
         * Executa la etapa de fetch i ho pinta a la maquina senzilla.
         */
        fetch: function() {

            this.default();

            var fetchLines = ["XMLID_14_","XMLID_15_","XMLID_16_","XMLID_17_","XMLID_306_",                                         // PC -> MUX
                "XMLID_426_",                                                                                                       // MUX -> RAM
                "XMLID_422_","XMLID_13_",                                                                                           // MUX -> +1
                "XMLID_192_",                                                                                                       // +1 -> PC
                "XMLID_6_","XMLID_139_","XMLID_138_","XMLID_343_","XMLID_122_","XMLID_149_"];                                       // RAM -> Fetch

            var fetchLinesFlechas = ["XMLID_305_","XMLID_425_","XMLID_421_","XMLID_191_","XMLID_121_","XMLID_148_","XMLID_342_"];

            var controlPos = [
                "XMLID_52_", "XMLID_167_",                                                                                          // @ + 1 -> PC
                "XMLID_48_", "XMLID_261_"                                                                                           // M -> IR
            ];

            var controlFlechasPos = [
                "XMLID_166_",
                "XMLID_250_"
            ];

            var controlNeg = [
                "XMLID_181_","XMLID_274_",                                                                                          // MUX 0 0
                "XMLID_50_", "XMLID_360_",                                                                                          // Lectura / escirutra
                "XMLID_262_",                                                                                                       // M -> A
                "XMLID_58_", "XMLID_57_","XMLID_254_",                                                                              // M -> B
                "XMLID_59_", "XMLID_171_"                                                                                           // Z -> FZ
            ];

            var controlFlechasNeg = [
                "XMLID_180_",                                                                                                       // MUX X 0
                "XMLID_273_",                                                                                                       // MUX 0 X
                "XMLID_359_",                                                                                                       // M -> B
                "XMLID_260_",
                "XMLID_253_",
                "XMLID_170_"
            ];

            var recuadre = ["XMLID_26_","XMLID_25_","XMLID_23_"];                                                                   // Recuadre Instruccio

            var svgItem;


            /* CONTROLADORS */

            // Z -> FZ
            svgItem = document.getElementById("XMLID_336_");
            svgItem.innerHTML = "0";

            // Clock
            svgItem = document.getElementById("clock");
            svgItem.innerHTML = this.model.get("clock");

            // Ram

            if (this.model.get("assemblador")==0) {
                svgItem = document.getElementById("XMLID_304_");
                svgItem.innerHTML = this.model.get("pc").model.get("address");

                svgItem = document.getElementById("XMLID_311_");
                svgItem.innerHTML = this.model.get("ram").model.get_dades(this.model.get("pc").model.get("address"));
            }
            else {
                svgItem = document.getElementById("XMLID_304_");
                svgItem.innerHTML = ("0000000"+(this.model.get("pc").model.get("address").toString(2))).substr(-7);

                svgItem = document.getElementById("XMLID_311_");
                svgItem.innerHTML = this.model.get("ram").model.get_dades_assembly(this.model.get("pc").model.get("address"));
            }



            // Fetch
            for (var i=0; i<fetchLines.length; i++){
                svgItem = document.getElementById(fetchLines[i]);
                svgItem.style.stroke=this.model.get("bus"); // light Blue
                svgItem.style.strokeWidth= 2;
                svgItem.style.strokeDasharray=9;
                svgItem.style.animation= "dash 60s linear infinite";
            }

            for (i=0;i<fetchLinesFlechas.length;i++){
                svgItem = document.getElementById(fetchLinesFlechas[i]);
                svgItem.style.strokeWidth= 2;
                svgItem.style.stroke=this.model.get("bus");
                svgItem.style.fill=this.model.get("bus");
            }

            // Control
            for (i=0;i<controlPos.length;i++){
                svgItem = document.getElementById(controlPos[i]);
                svgItem.style.stroke=this.model.get("senyal1");
                svgItem.style.strokeWidth= 2;
            }

            for (i=0;i<controlFlechasPos.length;i++){
                svgItem = document.getElementById(controlFlechasPos[i]);
                svgItem.style.strokeWidth= 2;
                svgItem.style.stroke=this.model.get("senyal1");
                svgItem.style.fill=this.model.get("senyal1");
            }

            for (i=0;i<controlNeg.length;i++){
                svgItem = document.getElementById(controlNeg[i]);
                svgItem.style.stroke=this.model.get("senyal0");
                svgItem.style.strokeWidth= 2;
            }

            for (i=0;i<controlFlechasNeg.length;i++){
                svgItem = document.getElementById(controlFlechasNeg[i]);
                svgItem.style.strokeWidth= 2;
                svgItem.style.stroke=this.model.get("senyal0");
                svgItem.style.fill=this.model.get("senyal0");
            }

            for (i=0;i<recuadre.length;i++){
                svgItem = document.getElementById(recuadre[i]);
                svgItem.style.strokeWidth= 3;
                svgItem.style.stroke=this.model.get("bus");
            }
        },

        /**
         * Executa la etapa de decodificacio i ho pinta a la maquina senzilla.
         */
        decodificacio: function () {

            this.default();

            var controlNeg = [
                "XMLID_52_", "XMLID_167_",                      // @ + 1 -> PC
                "XMLID_50_", "XMLID_360_",                      // Lectura / escirutra
                "XMLID_58_", "XMLID_57_","XMLID_254_",          // M -> B
                "XMLID_48_", "XMLID_261_",                      // M -> IR
                "XMLID_262_",                                   // M -> A
                "XMLID_59_", "XMLID_171_"                       // Z -> FZ
            ];

            var controlFlechasNeg = [
                "XMLID_359_",                                   // Lectura / escirutra
                "XMLID_250_",                                   // M -> IR
                "XMLID_260_",                                   // M -> A
                "XMLID_170_",                                   // Z -> FZ
                "XMLID_166_",                                   // @ + 1 -> PC
                "XMLID_253_"                                    // M -> B
            ];
            
            var controlPos = [
                "XMLID_186_"                                   // FZ
            ];

            var controlFlechasPos = [
                "XMLID_185_"                                   // FZ
            ];

            var svgItem;

            // Z -> FZ
            svgItem = document.getElementById("XMLID_336_");
            svgItem.innerHTML = "0";

            svgItem = document.getElementById("clock");
            svgItem.innerHTML = this.model.get("clock");


            var pc =this.model.get("pc").model.get("address")-1;

            if (this.model.get("assemblador")==0) {
                svgItem = document.getElementById("XMLID_304_");
                svgItem.innerHTML = pc;

                svgItem = document.getElementById("XMLID_311_");
                svgItem.innerHTML = this.model.get("ram").model.get_dades(pc);
            }
            else {
                svgItem = document.getElementById("XMLID_304_");
                svgItem.innerHTML = ("0000000"+(pc.toString(2))).substr(-7);

                svgItem = document.getElementById("XMLID_311_");
                svgItem.innerHTML = this.model.get("ram").model.get_dades_assembly(pc);
            }
            
            for (var i=0;i<controlPos.length;i++){
                svgItem = document.getElementById(controlPos[i]);
                svgItem.style.stroke=this.model.get("senyal1");
                svgItem.style.strokeWidth= 2;
            }

            for (i=0;i<controlFlechasPos.length;i++){
                svgItem = document.getElementById(controlFlechasPos[i]);
                svgItem.style.strokeWidth= 2;
                svgItem.style.stroke=this.model.get("senyal1");
                svgItem.style.fill=this.model.get("senyal1");
            }

            for (i=0;i<controlNeg.length;i++){
                svgItem = document.getElementById(controlNeg[i]);
                svgItem.style.stroke=this.model.get("senyal0");
                svgItem.style.strokeWidth= 2;
            }

            for (i=0;i<controlFlechasNeg.length;i++){
                svgItem = document.getElementById(controlFlechasNeg[i]);
                svgItem.style.strokeWidth= 2;
                svgItem.style.stroke=this.model.get("senyal0");
                svgItem.style.fill=this.model.get("senyal0");
            }
        },

        /**
         * Executa la etapa de la consulta del flag de zero i ho pinta a la maquina senzilla.
         */
        consultaFZ: function () {
            
            this.default();

            var controlNeg = [
                "XMLID_52_", "XMLID_167_",                      // @ + 1 -> PC
                "XMLID_50_", "XMLID_360_",                      // Lectura / escirutra
                "XMLID_58_", "XMLID_57_","XMLID_254_",          // M -> B
                "XMLID_48_", "XMLID_261_",                      // M -> IR
                "XMLID_262_",                                   // M -> A
                "XMLID_59_", "XMLID_171_"                       // Z -> FZ
            ];

            var controlFlechasNeg = [
                "XMLID_359_",                                   // Lectura / escirutra
                "XMLID_250_",                                   // M -> IR
                "XMLID_260_",                                   // M -> A
                "XMLID_170_",                                   // Z -> FZ
                "XMLID_166_",                                   // @ + 1 -> PC
                "XMLID_253_"                                    // M -> B
            ];

            var svgItem;

            var pc=this.model.get("pc").model.get("address")-1;

            // Z -> FZ
            svgItem = document.getElementById("XMLID_336_");
            svgItem.innerHTML = "0";

            svgItem = document.getElementById("clock");
            svgItem.innerHTML = this.model.get("clock");

            if (this.model.get("assemblador")==0) {
                svgItem = document.getElementById("XMLID_304_");
                svgItem.innerHTML = pc;

                svgItem = document.getElementById("XMLID_311_");
                svgItem.innerHTML = this.model.get("ram").model.get_dades(pc);
            }
            else {
                svgItem = document.getElementById("XMLID_304_");
                svgItem.innerHTML = ("0000000"+(pc.toString(2))).substr(-7);

                svgItem = document.getElementById("XMLID_311_");
                svgItem.innerHTML = this.model.get("ram").model.get_dades_assembly(pc);
            }

            for (i=0;i<controlNeg.length;i++){
                svgItem = document.getElementById(controlNeg[i]);
                svgItem.style.stroke=this.model.get("senyal0"); // Tomato
                svgItem.style.strokeWidth= 2;
            }

            for (i=0;i<controlFlechasNeg.length;i++){
                svgItem = document.getElementById(controlFlechasNeg[i]);
                svgItem.style.strokeWidth= 2;
                svgItem.style.stroke=this.model.get("senyal0");
                svgItem.style.fill=this.model.get("senyal0");
            }
        },

        /**
         * Executa la etapa de cerca del operand font i ho pinta a la maquina senzilla.
         */
        operandB: function () {

            this.default();

            var operandBLines = [
                "XMLID_159_","XMLID_20_","XMLID_21_",                                                // MUX 2
                "XMLID_426_",                                                                        // MUX -> RAM
                "XMLID_422_","XMLID_13_",                                                            // MUX -> +1
                "XMLID_192_",                                                                        // +1 -> PC
                "XMLID_6_","XMLID_139_","XMLID_138_","XMLID_343_","XMLID_122_","XMLID_149_"          // RAM -> Tot
            ];

            var operandBFlechas = [
                "XMLID_158_",                                                                        // MUX 2
                "XMLID_148_","XMLID_121_","XMLID_342_",                                              // RAM -> Tot
                "XMLID_421_",                                                                        // MUX -> +1
                "XMLID_191_",                                                                        // +1 -> PC
                "XMLID_425_"                                                                         // MUX -> RAM
            ];

            var controlPos = [
                "XMLID_274_",                                                                        // MUX 1 X
                "XMLID_58_", "XMLID_57_","XMLID_254_"                                                // M -> B
            ];

            var controlFlechasPos = [
                "XMLID_273_",                                                                        // MUX 1 X
                "XMLID_253_"                                                                         // M -> B
            ];

            var controlNeg = [
                "XMLID_52_", "XMLID_167_",                                                           // @ + 1 -> PC
                "XMLID_50_", "XMLID_360_",                                                           // Lectura / escirutra
                "XMLID_262_",                                                                        // M -> A
                "XMLID_48_", "XMLID_261_",                                                           // M -> IR
                "XMLID_59_", "XMLID_171_",                                                           // Z -> FZ
                "XMLID_181_"                                                                         // MUX X 0
            ];

            var controlFlechasNeg = [
                "XMLID_359_",                                   // Lectura / escirutra
                "XMLID_260_",                                   // M -> A
                "XMLID_250_",                                   // M -> IR
                "XMLID_170_",                                   // Z -> FZ
                "XMLID_166_",                                   // @ + 1 -> PC
                "XMLID_180_"                                    // MUX X 0
            ];

            var svgItem;

            // Z -> FZ
            svgItem = document.getElementById("XMLID_336_");
            svgItem.innerHTML = "0";

            // Recuadre B
            svgItem = document.getElementById("XMLID_4_");
            svgItem.style.strokeWidth= 3;
            svgItem.style.stroke=this.model.get("bus");

            svgItem = document.getElementById("clock");
            svgItem.innerHTML = this.model.get("clock");

            //Ram
            if (this.model.get("assemblador")==0) {
                svgItem = document.getElementById("XMLID_304_");
                svgItem.innerHTML = this.model.get("instruction").model.get("font");

                svgItem = document.getElementById("XMLID_311_");
                svgItem.innerHTML = this.model.get("ram").model.get_dades(this.model.get("instruction").model.get("font"));
            }
            else {
                svgItem = document.getElementById("XMLID_304_");
                svgItem.innerHTML = ("0000000"+(this.model.get("instruction").model.get("font").toString(2))).substr(-7);

                svgItem = document.getElementById("XMLID_311_");
                svgItem.innerHTML = this.model.get("ram").model.get_dades_assembly(this.model.get("instruction").model.get("font"));
            }

            for (var i=0; i<operandBLines.length; i++){
                svgItem = document.getElementById(operandBLines[i]);
                svgItem.style.stroke=this.model.get("bus");
                svgItem.style.strokeWidth= 2;
                svgItem.style.strokeDasharray=9;
                svgItem.style.animation= "dash 60s linear infinite";
            }

            for (i=0;i<operandBFlechas.length;i++){
                svgItem = document.getElementById(operandBFlechas[i]);
                svgItem.style.strokeWidth= 2;
                svgItem.style.stroke=this.model.get("bus");
                svgItem.style.fill=this.model.get("bus");
            }

            // Control
            for (i=0;i<controlPos.length;i++){
                svgItem = document.getElementById(controlPos[i]);
                svgItem.style.stroke=this.model.get("senyal1");
                svgItem.style.strokeWidth= 2;
            }

            for (i=0;i<controlFlechasPos.length;i++){
                svgItem = document.getElementById(controlFlechasPos[i]);
                svgItem.style.strokeWidth= 2;
                svgItem.style.stroke=this.model.get("senyal1");
                svgItem.style.fill=this.model.get("senyal1");
            }

            for (i=0;i<controlNeg.length;i++){
                svgItem = document.getElementById(controlNeg[i]);
                svgItem.style.stroke=this.model.get("senyal0");
                svgItem.style.strokeWidth= 2;
            }

            for (i=0;i<controlFlechasNeg.length;i++){
                svgItem = document.getElementById(controlFlechasNeg[i]);
                svgItem.style.strokeWidth= 2;
                svgItem.style.stroke=this.model.get("senyal0");
                svgItem.style.fill=this.model.get("senyal0");
            }
        },

        /**
         * Executa la etapa de cerca del operand desti i ho pinta a la maquina senzilla.
         */
        operandA: function () {

            this.default();

            var operandALines = [
                "XMLID_22_","XMLID_19_","XMLID_154_",                                                // MUX 3
                "XMLID_426_",                                                                        // MUX -> RAM
                "XMLID_422_","XMLID_13_",                                                            // MUX -> +1
                "XMLID_192_",                                                                        // +1 -> PC
                "XMLID_6_","XMLID_139_","XMLID_138_","XMLID_343_","XMLID_122_","XMLID_149_"          // RAM -> Tot
            ];

            var operandAFlechas = [
                "XMLID_153_",                                                                        // MUX 3
                "XMLID_148_","XMLID_121_","XMLID_342_",                                              // RAM -> Tot
                "XMLID_421_",                                                                        // MUX -> +1
                "XMLID_191_",                                                                        // +1 -> PC
                "XMLID_425_"                                                                         // MUX -> RAM
            ];

            var controlPos = [
                "XMLID_274_",                                                                        // MUX 1 X
                "XMLID_181_",                                                                        // MUX X 1
                "XMLID_262_"                                                                         // M -> A
            ];

            var controlFlechasPos = [
                "XMLID_273_",                                                                        // MUX 1 X
                "XMLID_180_",                                                                        // MUX X 1
                "XMLID_260_"                                                                         // M -> A
            ];

            var controlNeg = [
                "XMLID_52_", "XMLID_167_",                                                           // @ + 1 -> PC
                "XMLID_50_", "XMLID_360_",                                                           // Lectura / escirutra
                "XMLID_48_", "XMLID_261_",                                                           // M -> IR
                "XMLID_59_", "XMLID_171_",                                                           // Z -> FZ
                "XMLID_58_", "XMLID_57_","XMLID_254_"                                                // M -> B
            ];

            var controlFlechasNeg = [
                "XMLID_359_",                                   // Lectura / escirutra
                "XMLID_253_",                                   // M -> B
                "XMLID_250_",                                   // M -> IR
                "XMLID_170_",                                   // Z -> FZ
                "XMLID_166_"                                    // @ + 1 -> PC
            ];

            var svgItem;

            // Z -> FZ
            svgItem = document.getElementById("XMLID_336_");
            svgItem.innerHTML = "0";

            // Recuadre A
            svgItem = document.getElementById("XMLID_5_");
            svgItem.style.strokeWidth= 3;
            svgItem.style.stroke=this.model.get("bus");

            svgItem = document.getElementById("clock");
            svgItem.innerHTML = this.model.get("clock");

            //RAM
            if (this.model.get("assemblador")==0) {
                svgItem = document.getElementById("XMLID_304_");
                svgItem.innerHTML = this.model.get("instruction").model.get("desti");

                svgItem = document.getElementById("XMLID_311_");
                svgItem.innerHTML = this.model.get("ram").model.get_dades(this.model.get("instruction").model.get("desti"));
            }
            else {
                svgItem = document.getElementById("XMLID_304_");
                svgItem.innerHTML = ("0000000"+(this.model.get("instruction").model.get("desti").toString(2))).substr(-7);

                svgItem = document.getElementById("XMLID_311_");
                svgItem.innerHTML = this.model.get("ram").model.get_dades_assembly(this.model.get("instruction").model.get("desti"));
            }

            for (var i=0; i<operandALines.length; i++){
                svgItem = document.getElementById(operandALines[i]);
                svgItem.style.stroke=this.model.get("bus");
                svgItem.style.strokeWidth= 2;
                svgItem.style.strokeDasharray=9;
                svgItem.style.animation= "dash 60s linear infinite";
            }

            for (i=0;i<operandAFlechas.length;i++){
                svgItem = document.getElementById(operandAFlechas[i]);
                svgItem.style.strokeWidth= 2;
                svgItem.style.stroke=this.model.get("bus");
                svgItem.style.fill=this.model.get("bus");
            }

            // Control
            for (i=0;i<controlPos.length;i++){
                svgItem = document.getElementById(controlPos[i]);
                svgItem.style.stroke=this.model.get("senyal1");
                svgItem.style.strokeWidth= 2;
            }

            for (i=0;i<controlFlechasPos.length;i++){
                svgItem = document.getElementById(controlFlechasPos[i]);
                svgItem.style.strokeWidth= 2;
                svgItem.style.stroke=this.model.get("senyal1");
                svgItem.style.fill=this.model.get("senyal1");
            }

            for (i=0;i<controlNeg.length;i++){
                svgItem = document.getElementById(controlNeg[i]);
                svgItem.style.stroke=this.model.get("senyal0");
                svgItem.style.strokeWidth= 2;
            }

            for (i=0;i<controlFlechasNeg.length;i++){
                svgItem = document.getElementById(controlFlechasNeg[i]);
                svgItem.style.strokeWidth= 2;
                svgItem.style.stroke=this.model.get("senyal0");
                svgItem.style.fill=this.model.get("senyal0");
            }
        },

        /**
         * Exeuta la funcio de execucio de les intruccions mov i add i ho pinta a la maquina senzilla.
         * @returns {number} retorna -1 si la execucio sobrepasa els limits de bits de la memoria
         * altrament res.
         */
        execucio: function () {
            
                this.default();

                var execucioLines = [
                    "XMLID_22_","XMLID_19_","XMLID_154_",                                                // MUX 3
                    "XMLID_426_",                                                                        // MUX -> RAM
                    "XMLID_422_","XMLID_13_",                                                            // MUX -> +1
                    "XMLID_192_",                                                                        // +1 -> PC
                    "XMLID_42_","XMLID_43_","XMLID_143_",                                                // ALU -> RAM
                    "XMLID_114_",                                                                        // Registro A -> ALU
                    "XMLID_112_",                                                                        // Registro B -> ALU
                    "XMLID_264_"                                                                         // FZ
                ];

                var execucioFlechas = [
                    "XMLID_153_",                                                                        // MUX 3
                    "XMLID_421_",                                                                        // MUX -> +1
                    "XMLID_191_",                                                                        // +1 -> PC
                    "XMLID_425_",                                                                        // MUX -> RAM
                    "XMLID_137_",                                                                        // ALU -> RAM
                    "XMLID_111_",                                                                        // Registro A -> ALU
                    "XMLID_113_",                                                                        // Registro B -> ALU
                    "XMLID_243_"                                                                         // FZ
                ];

                var controlPos = [
                    "XMLID_274_",                                                                        // MUX 1 X
                    "XMLID_181_",                                                                        // MUX X 1
                    "XMLID_50_", "XMLID_360_",                                                           // Lectura / escirutra
                    "XMLID_59_","XMLID_171_"
                ];

                var controlFlechasPos = [
                    "XMLID_273_",                                                                        // MUX 1 X
                    "XMLID_180_",                                                                        // MUX X 1
                    "XMLID_359_",                                                                       // Lectura / escirutra
                    "XMLID_170_"

                ];

                var controlNeg = [
                    "XMLID_262_",                                                                        // M -> A
                    "XMLID_52_", "XMLID_167_",                                                           // @ + 1 -> PC
                    "XMLID_48_", "XMLID_261_",                                                           // M -> IR
                    "XMLID_58_", "XMLID_57_","XMLID_254_"                                                // M -> B

                ];

                var controlFlechasNeg = [
                    "XMLID_260_",                                                                         // M -> A
                    "XMLID_253_",                                   // M -> B
                    "XMLID_250_",                                   // M -> IR
                    "XMLID_166_"                                    // @ + 1 -> PC
                ];

                var svgItem;

                // Z -> FZ
                svgItem = document.getElementById("XMLID_336_");
                svgItem.innerHTML = "1";

                // Recuadre ALU
                svgItem = document.getElementById("XMLID_9_");
                svgItem.style.strokeWidth= 3;
                svgItem.style.stroke="#FBB117";

                // Recuadre RAM
                svgItem = document.getElementById("XMLID_3_");
                svgItem.style.strokeWidth= 3;

                svgItem = document.getElementById("clock");
                svgItem.innerHTML = this.model.get("clock");

                if (this.model.get("assemblador")==0) {
                    svgItem = document.getElementById("XMLID_304_");
                    svgItem.innerHTML = this.model.get("instruction").model.get("desti");

                    svgItem = document.getElementById("XMLID_311_");
                    svgItem.innerHTML = this.model.get("ram").model.get_dades(this.model.get("instruction").model.get("desti"));
                }
                else {
                    svgItem = document.getElementById("XMLID_304_");
                    svgItem.innerHTML = ("0000000"+(this.model.get("instruction").model.get("desti").toString(2))).substr(-7);

                    svgItem = document.getElementById("XMLID_311_");
                    svgItem.innerHTML = this.model.get("ram").model.get_dades_assembly(this.model.get("instruction").model.get("desti"));
                }

                /*svgItem = document.getElementById("XMLID_92_");
                svgItem.innerHTML = this.model.get("ram").model.get_dades(this.model.get("instruction").model.get("desti"));*/

                for (var i=0; i<execucioLines.length; i++){
                    svgItem = document.getElementById(execucioLines[i]);
                    svgItem.style.stroke=this.model.get("bus");
                    svgItem.style.strokeWidth= 2;
                    svgItem.style.strokeDasharray=9;
                    svgItem.style.animation= "dash 60s linear infinite";
                }

                for (i=0;i<execucioFlechas.length;i++){
                    svgItem = document.getElementById(execucioFlechas[i]);
                    svgItem.style.strokeWidth= 2;
                    svgItem.style.stroke=this.model.get("bus");
                    svgItem.style.fill=this.model.get("bus");
                }

                for (i=0;i<controlPos.length;i++){
                    svgItem = document.getElementById(controlPos[i]);
                    svgItem.style.stroke=this.model.get("senyal1");
                    svgItem.style.strokeWidth= 2;
                }

                for (i=0;i<controlFlechasPos.length;i++){
                    svgItem = document.getElementById(controlFlechasPos[i]);
                    svgItem.style.strokeWidth= 2;
                    svgItem.style.stroke=this.model.get("senyal1");
                    svgItem.style.fill=this.model.get("senyal1");
                }

                for (i=0;i<controlNeg.length;i++){
                    svgItem = document.getElementById(controlNeg[i]);
                    svgItem.style.stroke=this.model.get("senyal0");
                    svgItem.style.strokeWidth= 2;
                }

                for (i=0;i<controlFlechasNeg.length;i++){
                    svgItem = document.getElementById(controlFlechasNeg[i]);
                    svgItem.style.strokeWidth= 2;
                    svgItem.style.stroke=this.model.get("senyal0");
                    svgItem.style.fill=this.model.get("senyal0");
                }

        },

        /**
         * Executa la etapa de execucuio de la instruccio cmp i ho pinta a la maquina senzilla.
         */
        execucioCMP: function () {

            this.default();

            var execucioLines = [
                "XMLID_114_",                                                                        // Registro A -> ALU
                "XMLID_112_",                                                                        // Registro B -> ALU
                "XMLID_264_"                                                                         // FZ
            ];

            var execucioFlechas = [
                "XMLID_111_",                                                                        // Registro A -> ALU
                "XMLID_113_",                                                                        // Registro B -> ALU
                "XMLID_243_"                                                                         // FZ
            ];

            var controlPos = [
                "XMLID_59_","XMLID_171_"
            ];

            var controlFlechasPos = [
                "XMLID_170_"
            ];

            var controlNeg = [
                "XMLID_262_",                                                                        // M -> A
                "XMLID_52_", "XMLID_167_",                                                           // @ + 1 -> PC
                "XMLID_48_", "XMLID_261_",                                                           // M -> IR
                "XMLID_58_", "XMLID_57_","XMLID_254_",                                                // M -> B
                "XMLID_50_", "XMLID_360_"                                                         // Lectura / escirutra


            ];

            var controlFlechasNeg = [
                "XMLID_260_",                                                                         // M -> A
                "XMLID_253_",                                   // M -> B
                "XMLID_250_",                                   // M -> IR
                "XMLID_166_",                                    // @ + 1 -> PC
                "XMLID_359_"                                                                         // Lectura / escirutra
            ];

            var svgItem;

            // Z -> FZ
            svgItem = document.getElementById("XMLID_336_");
            svgItem.innerHTML = "1";

            // Recuadre ALU
            svgItem = document.getElementById("XMLID_9_");
            svgItem.style.strokeWidth= 3;
            svgItem.style.stroke="#FBB117";

            svgItem = document.getElementById("clock");
            svgItem.innerHTML = this.model.get("clock");

            if (this.model.get("assemblador")==0) {
                svgItem = document.getElementById("XMLID_304_");
                svgItem.innerHTML = this.model.get("instruction").model.get("desti");

                svgItem = document.getElementById("XMLID_311_");
                svgItem.innerHTML = this.model.get("ram").model.get_dades(this.model.get("instruction").model.get("desti"));
            }
            else {
                svgItem = document.getElementById("XMLID_304_");
                svgItem.innerHTML = ("0000000"+(this.model.get("instruction").model.get("desti").toString(2))).substr(-7);

                svgItem = document.getElementById("XMLID_311_");
                svgItem.innerHTML = this.model.get("ram").model.get_dades_assembly(this.model.get("instruction").model.get("desti"));
            }

            for (var i=0; i<execucioLines.length; i++){
                svgItem = document.getElementById(execucioLines[i]);
                svgItem.style.stroke=this.model.get("bus");
                svgItem.style.strokeWidth= 2;
                svgItem.style.strokeDasharray=9;
                svgItem.style.animation= "dash 60s linear infinite";
            }

            for (i=0;i<execucioFlechas.length;i++){
                svgItem = document.getElementById(execucioFlechas[i]);
                svgItem.style.strokeWidth= 2;
                svgItem.style.stroke=this.model.get("bus");
                svgItem.style.fill=this.model.get("bus");
            }

            for (i=0;i<controlPos.length;i++){
                svgItem = document.getElementById(controlPos[i]);
                svgItem.style.stroke=this.model.get("senyal1");
                svgItem.style.strokeWidth= 2;
            }

            for (i=0;i<controlFlechasPos.length;i++){
                svgItem = document.getElementById(controlFlechasPos[i]);
                svgItem.style.strokeWidth= 2;
                svgItem.style.stroke=this.model.get("senyal1");
                svgItem.style.fill=this.model.get("senyal1");
            }

            for (i=0;i<controlNeg.length;i++){
                svgItem = document.getElementById(controlNeg[i]);
                svgItem.style.stroke=this.model.get("senyal0");
                svgItem.style.strokeWidth= 2;
            }

            for (i=0;i<controlFlechasNeg.length;i++){
                svgItem = document.getElementById(controlFlechasNeg[i]);
                svgItem.style.strokeWidth= 2;
                svgItem.style.stroke=this.model.get("senyal0");
                svgItem.style.fill=this.model.get("senyal0");
            }
        },

        /* ======================================================================= */

        /**
         * Llença la edicio de la memoria RAM.
         */
        editar_memoria: function () {
            this.model.get("ram").editar_memoria();
        },

        /**
         * Llença el event per guardar la edicio de la memoria RAM.
         */
        guardar_edicio_memoria: function () {
            
            var bool = this.model.get("ram").guardar_edicio();

            if (bool==1){
                this.afegir_log_consola("Edició de la memòria RAM guardada correctament.",4);
                this.default();
                this.marcar_taula_default();
                this.model.reset_clock();
                var svgItem;
                svgItem = document.getElementById("clock");
                svgItem.innerHTML = this.model.get("clock");
                this.model.set("state",1);
            }
            else{
                $container = $('.container-consola');
                $container.append('<p style="color:#ff6347" class="row"><u>'+"Erros al carregar la configuració de la RAM:"+'</u></p>');
                for (var line = 0; line < bool.length; line++) {
                    this.afegir_log_consola(bool[line], 2);
                }
            }

            if (this.model.get("assemblador")==0) {
                svgItem = document.getElementById("XMLID_304_");
                svgItem.innerHTML = "0";

                svgItem = document.getElementById("XMLID_311_");
                svgItem.innerHTML = "0";
            }
            else {
                svgItem = document.getElementById("XMLID_304_");
                svgItem.innerHTML = "0000000";

                svgItem = document.getElementById("XMLID_311_");
                svgItem.innerHTML = "0000000000000000";
            }

        },

        /**
         * Selecciona un fitxer de text i el passa al "parsejador" de la memoria RAM.
         */
        render_memoria_fitxer: function (){

            var self = this;
            var ram = this.model.get("ram");

            var llegirText = function (callback) { // Utilitzacio de Callbacks per llegir i processar sequencialment

                var fitxer = document.getElementById('fileInput');
                var file = fitxer.files[0];
                var textType = /text.*/;
                if (file.type.match(textType)) {
                    var reader = new FileReader();
                    reader.readAsText(file);
                    reader.onload = function (event) {
                        callback(event.target.result);
                    }
                }
                else {
                    self.afegir_log_consola("Format del arxiu no suportat! Ha de ser un .txt",2);
                }
            };

            var processarText = function (text) {

                ram.model.carregarfitxer(text);

                var table = document.getElementById("mytable");
                var table2 = document.getElementById("mytable2");
                var mida = ram.model.get("mida");
                var err = ram.model.get("errors");

                var indexInst = ram.model.get("aInstruccions");

                // Instruccions
                var etiqI = ram.model.get("etiquetaI");
                var operI = ram.model.get("operadorI");
                var fontI = ram.model.get("fontI");
                var destiI = ram.model.get("destiI");

                // Dades
                var etiqD = ram.model.get("etiquetaD");
                var valorD = ram.model.get("valorD");
                var aDades = ram.model.get("aDades");

                if (err.length>0){
                    console.log("error v_ram");
                    document.getElementById("fileInput").value = ""; // reinicia
                    $container = $('.container-consola');

                    $container.append('<p style="color:#ff6347" class="row"><u>'+"Erros al carregar la configuració de la RAM:"+'</u></p>');
                    for (var line = 0; line < err.length; line++){
                        $container.append('<p style="color:#ff6347" class="row">'+err[line]+'</p>');
                        $container.animate({ scrollTop: $container[0].scrollHeight }, "fast");
                    }
                    ram.model.set("errors",[]);
                }

                else{
                    $container = $('.container-consola');
                    $container.append('<p style="color: #3ac02a" class="row">'+"Fitxer de configuració carregat correctament."+'</p>');
                    $container.animate({ scrollTop: $container[0].scrollHeight }, "fast");

                    self.default();
                    self.marcar_taula_default();
                    self.model.reset_clock();
                    var svgItem;
                    svgItem = document.getElementById("clock");
                    svgItem.innerHTML = self.model.get("clock");

                    self.model.set("state",1);

                    for (var i=mida-1; i>=0; i--){

                        if (i>=aDades){
                            var cell1 = table2.rows[i-aDades].cells[0];
                            cell1.innerHTML = etiqD[i];
                            cell1.className = 'custom-td-20';

                            var cell2 = table2.rows[i-aDades].cells[1];
                            cell2.innerHTML = i;
                            cell2.className = 'custom-td-20';

                            var cell3 = table2.rows[i-aDades].cells[2];
                            cell3.innerHTML = valorD[i];
                            cell3.className = 'custom-td-70';
                        }

                        else {
                            var cell1 = table.rows[i].cells[0];
                            cell1.innerHTML = etiqI[i] + "";
                            cell1.className = 'custom-td-20';

                            var cell2 = table.rows[i].cells[1];
                            cell2.innerHTML = i;
                            cell2.className = 'custom-td-20';

                            var cell3 = table.rows[i].cells[2];
                            cell3.innerHTML = operI[i]+" "+fontI[i]+" "+destiI[i];
                            cell3.className = 'custom-td-70';
                        }
                    }
                }

                if (self.model.get("assemblador")==0) {
                    svgItem = document.getElementById("XMLID_304_");
                    svgItem.innerHTML = "0";

                    svgItem = document.getElementById("XMLID_311_");
                    svgItem.innerHTML = "0";
                }
                else {
                    svgItem = document.getElementById("XMLID_304_");
                    svgItem.innerHTML = "0000000";

                    svgItem = document.getElementById("XMLID_311_");
                    svgItem.innerHTML = "0000000000000000";
                }
            };

            llegirText(processarText);

        },
        
        /* ======================================================================= */

        /**
         * Reinicia el clock a 0.
         */
        reset_clock: function () {

            if(this.model.get("state")==0){this.afegir_log_consola("Reset",3);}
            else {
                this.default();
                this.marcar_taula_default();
                //this.pintar_diagrama_default();
                this.model.reset_clock();
                var svgItem;
                svgItem = document.getElementById("clock");
                svgItem.innerHTML = this.model.get("clock");

                if (this.model.get("assemblador")==0) {
                    svgItem = document.getElementById("XMLID_304_");
                    svgItem.innerHTML = "0";

                    svgItem = document.getElementById("XMLID_311_");
                    svgItem.innerHTML = "0";
                }
                else {
                    svgItem = document.getElementById("XMLID_304_");
                    svgItem.innerHTML = "0000000";

                    svgItem = document.getElementById("XMLID_311_");
                    svgItem.innerHTML = "0000000000000000";
                }

                /*svgItem = document.getElementById("XMLID_92_");
                svgItem.innerHTML = "0";*/

                this.afegir_log_consola("Reset",3);
            }
        },

        /**
         * Reinicia tota la aplicacio.
         */
        kill: function () {
            if(this.model.get("state")==0){
                this.afegir_log_consola("No hi ha res per matar, quina llàstima. :(",2);
            }
            else {
                this.default();
                this.marcar_taula_default();
                //this.pintar_diagrama_default();
                this.model.kill();
                var svgItem;
                svgItem = document.getElementById("clock");
                svgItem.innerHTML = this.model.get("clock");

                if (this.model.get("assemblador")==0) {
                    svgItem = document.getElementById("XMLID_304_");
                    svgItem.innerHTML = "0";

                    svgItem = document.getElementById("XMLID_311_");
                    svgItem.innerHTML = "0";
                }
                else {
                    svgItem = document.getElementById("XMLID_304_");
                    svgItem.innerHTML = "0000000";

                    svgItem = document.getElementById("XMLID_311_");
                    svgItem.innerHTML = "0000000000000000";
                }

                /*svgItem = document.getElementById("XMLID_92_");
                svgItem.innerHTML = "0";*/

                this.afegir_log_consola("Kill Them All!",2);
            }

        },

        /* ======================================================================= */

        /**
         * Afegeix un comentari en la consola de la aplicacio.
         */
        afegir_log_consola: function (string, color) {

            /*var avui = new Date();
            var segons = (avui.getSeconds()<10?'0':'') + avui.getSeconds();
            var minuts = (avui.getMinutes()<10?'0':'') + avui.getMinutes();
            var hores = (avui.getHours()<10?'0':'') + avui.getHours();*/

            $container = $('.container-consola');
            if (color==1){$container.append('<p class="row">'+string+'</p>');}
             else if (color==2){$container.append('<p style="color:#ff6347" class="row">'+string+'</p>');}
             else if (color ==3){$container.append('<p style="color: #ffce33" class="row">'+string+'</p>');}
            else if (color ==4){$container.append('<p style="color: #3ac02a" class="row">'+string+'</p>');}
            /*if (color==1){$container.append('<p class="row">' +hores+":" +minuts+":" +segons+" " +string + '</p>');}
            else if (color==2){$container.append('<p style="color:#ff6347" class="row">' +hores+":" +minuts+":" +segons+" " +string + '</p>');}
            else if (color ==3){$container.append('<p style="color: #ffce33" class="row">' +hores+":" +minuts+":" +segons+" " +string + '</p>');}*/
            $container.animate({ scrollTop: $container[0].scrollHeight }, "fast");
        },

        /**
         * Marca la fila de la memoria amb el color de entrada.
         */
        marcar_taula_instuccio: function (taula, index, color) {

            this.marcar_taula_default();

            var table = document.getElementById(taula);
            var cell1 = table.rows[index].cells[0];
            var cell2 = table.rows[index].cells[1];
            var cell3 = table.rows[index].cells[2];
            cell1.bgColor=color;cell2.bgColor=color;cell3.bgColor=color;

        },

        /**
         * Marcar per defecte les files de la memoria RAM sense color.
         */
        marcar_taula_default: function () {

            var table = document.getElementById("mytable");

            for (var i=0;i<this.model.get("ram").model.get("aDades");i++){
                var cell1 = table.rows[i].cells[0];
                var cell2 = table.rows[i].cells[1];
                var cell3 = table.rows[i].cells[2];
                cell1.bgColor="";cell2.bgColor="";cell3.bgColor="";
            }

            var table2 = document.getElementById("mytable2");

            for (i=0;(i<(this.model.get("ram").model.get("mida"))-this.model.get("ram").model.get("aDades"));i++){
                cell1 = table2.rows[i].cells[0];
                cell2 = table2.rows[i].cells[1];
                cell3 = table2.rows[i].cells[2];
                cell1.bgColor="";cell2.bgColor="";cell3.bgColor="";
            }
        },

        /**
         * Marca una fila de la memoria RAM durant 0,5 segons amb un color groc suau.
         */
        marcar_resultat:function (index) {

            var cell1;var cell2;var cell3;

            if (index<this.model.get("ram").model.get("aDades")){
                var table = document.getElementById("mytable");
                cell1 = table.rows[index].cells[0];
                cell2 = table.rows[index].cells[1];
                cell3 = table.rows[index].cells[2];
            }
            else{
                var table2 = document.getElementById("mytable2");
                cell1 = table2.rows[index-this.model.get("ram").model.get("aDades")].cells[0];
                cell2 = table2.rows[index-this.model.get("ram").model.get("aDades")].cells[1];
                cell3 = table2.rows[index-this.model.get("ram").model.get("aDades")].cells[2];
            }

            $(cell1).css({"background-color":"#F8F2AC", "transition":"background-color 0.5s ease"});
            $(cell2).css({"background-color":"#F8F2AC", "transition":"background-color 0.5s ease"});
            $(cell3).css({"background-color":"#F8F2AC", "transition":"background-color 0.5s ease"});

            setTimeout(function () {
                $(cell1).css("background-color", "");$(cell2).css("background-color", "");$(cell3).css("background-color", "");
            }, 500);


        },

        /* ====================================================================== */

        /**
         * Carrega els colors de les senyals de control i de flux.
         */
        load_colors:function () {
            this.model.set('senyal1',$('#senyal1-color').css('background-color'));
            this.model.set('senyal0',$('#senyal0-color').css('background-color'));
            this.model.set('bus',$('#bus-color').css('background-color'));
            
            if ((this.model.get("state")==1) && (this.model.get("clock")>0)){
               if (this.model.get("a_state")==5){this.execucio();this.load_checkbox();this.model.get("alu").render_control(this.model.get("senyal1"),this.model.get("senyal0"));}
                else if (this.model.get("a_state")==8){this.execucio();this.load_checkbox();this.model.get("alu").render_control(this.model.get("senyal1"),this.model.get("senyal0"));}
               else if (this.model.get("a_state")==6){this.execucioCMP();this.load_checkbox();this.model.get("alu").render_control(this.model.get("senyal1"),this.model.get("senyal0"));}
               else if (this.model.get("a_state")==7){this.consultaFZ();this.load_checkbox();}
            }
            else if (this.model.get("state")==2){this.fetch();this.load_checkbox();}
            else if (this.model.get("state")==3){this.decodificacio();this.load_checkbox();this.model.get("instruction").render_control(this.model.get("senyal1"),this.model.get("senyal0"));}
            else if (this.model.get("state")==4){this.operandB();this.load_checkbox();}
            else if (this.model.get("state")==5){this.operandA();this.load_checkbox();}
            else if (this.model.get("state")==6){this.operandA();this.load_checkbox();}
            else if (this.model.get("state")==7){this.consultaFZ();this.load_checkbox();this.model.get("instruction").render_control(this.model.get("senyal1"),this.model.get("senyal0"));}
            else if (this.model.get("state")==8){this.operandB();this.load_checkbox();}
            else {}

        },

        /**
         * Carrega la configuracio per renderitzar normal o en mode assamblador.
         */
        load_checkbox:function () {

            var checkbox = document.getElementById("assemblador");

            var svgItem;

            var pc = this.model.get("pc").model.get("address")-1;
            var operacio = this.model.get("instruction").model.get("operacio");

            if (checkbox.checked) {
                this.model.render_assembly();
                this.model.set("assemblador",1);

                if (this.model.get("state")==2 || this.model.get("state")==3 || this.model.get("state")==7){
                    svgItem = document.getElementById("XMLID_304_");
                    svgItem.innerHTML = ("0000000"+(pc.toString(2))).substr(-7);

                    svgItem = document.getElementById("XMLID_311_");
                    svgItem.innerHTML = this.model.get("ram").model.get_dades_assembly(pc);
                }
                else if (this.model.get("state")==4 || this.model.get("state")==8){
                    svgItem = document.getElementById("XMLID_304_");
                    svgItem.innerHTML = ("0000000"+(this.model.get("instruction").model.get("font").toString(2))).substr(-7);

                    svgItem = document.getElementById("XMLID_311_");
                    svgItem.innerHTML = this.model.get("ram").model.get_dades_assembly(this.model.get("instruction").model.get("font"));
                }
                else if (this.model.get("state")==6 ||this.model.get("state")==5){
                    svgItem = document.getElementById("XMLID_304_");
                    svgItem.innerHTML = ("0000000"+(this.model.get("instruction").model.get("desti").toString(2))).substr(-7);

                    svgItem = document.getElementById("XMLID_311_");
                    svgItem.innerHTML = this.model.get("ram").model.get_dades_assembly(this.model.get("instruction").model.get("desti"));
                }
                else if (this.model.get("state")==0){
                    svgItem = document.getElementById("XMLID_304_");
                    svgItem.innerHTML = "0000000";

                    svgItem = document.getElementById("XMLID_311_");
                    svgItem.innerHTML = "0000000000000000"
                }
                else if (this.model.get("state")==1){

                    if(this.model.get("clock")==0){
                        svgItem = document.getElementById("XMLID_304_");
                        svgItem.innerHTML = "0000000";

                        svgItem = document.getElementById("XMLID_311_");
                        svgItem.innerHTML = "0000000000000000"
                    }
                    else if (operacio[0]=="0"){
                        svgItem = document.getElementById("XMLID_304_");
                        svgItem.innerHTML = ("0000000"+(this.model.get("instruction").model.get("desti").toString(2))).substr(-7);

                        svgItem = document.getElementById("XMLID_311_");
                        svgItem.innerHTML = this.model.get("ram").model.get_dades_assembly(this.model.get("instruction").model.get("desti"));
                    }
                    else if (operacio[0]=="1" && operacio[1]=="0"){
                        svgItem = document.getElementById("XMLID_304_");
                        svgItem.innerHTML = ("0000000"+(this.model.get("instruction").model.get("font").toString(2))).substr(-7);

                        svgItem = document.getElementById("XMLID_311_");
                        svgItem.innerHTML = this.model.get("ram").model.get_dades_assembly(this.model.get("instruction").model.get("font"));
                    }
                    else{
                        svgItem = document.getElementById("XMLID_304_");
                        svgItem.innerHTML = ("0000000"+(pc.toString(2))).substr(-7);

                        svgItem = document.getElementById("XMLID_311_");
                        svgItem.innerHTML = this.model.get("ram").model.get_dades_assembly(pc);
                    }
                }
            }

            else {
                this.model.render_normal();
                this.model.set("assemblador",0);

                if (this.model.get("state")==2 || this.model.get("state")==3 || this.model.get("state")==7){
                    svgItem = document.getElementById("XMLID_304_");
                    svgItem.innerHTML = pc;

                    svgItem = document.getElementById("XMLID_311_");
                    svgItem.innerHTML = this.model.get("ram").model.get_dades(pc);
                }
                else if (this.model.get("state")==4 || this.model.get("state")==8){
                    svgItem = document.getElementById("XMLID_304_");
                    svgItem.innerHTML = this.model.get("instruction").model.get("font");

                    svgItem = document.getElementById("XMLID_311_");
                    svgItem.innerHTML = this.model.get("ram").model.get_dades(this.model.get("instruction").model.get("font"));
                }
                else if (this.model.get("state")==6 ||this.model.get("state")==5){
                    svgItem = document.getElementById("XMLID_304_");
                    svgItem.innerHTML = this.model.get("instruction").model.get("desti");

                    svgItem = document.getElementById("XMLID_311_");
                    svgItem.innerHTML = this.model.get("ram").model.get_dades(this.model.get("instruction").model.get("desti"));
                }
                else if (this.model.get("state")==0){
                    svgItem = document.getElementById("XMLID_304_");
                    svgItem.innerHTML = "0";

                    svgItem = document.getElementById("XMLID_311_");
                    svgItem.innerHTML = "0"
                }
                else if (this.model.get("state")==1){

                    if(this.model.get("clock")==0){
                        svgItem = document.getElementById("XMLID_304_");
                        svgItem.innerHTML = "0";

                        svgItem = document.getElementById("XMLID_311_");
                        svgItem.innerHTML = "0"
                    }
                    else if (operacio[0]=="0"){
                        svgItem = document.getElementById("XMLID_304_");
                        svgItem.innerHTML = this.model.get("instruction").model.get("desti");

                        svgItem = document.getElementById("XMLID_311_");
                        svgItem.innerHTML = this.model.get("ram").model.get_dades(this.model.get("instruction").model.get("desti"));
                    }
                    else if (operacio[0]=="1" && operacio[1]=="0"){
                        svgItem = document.getElementById("XMLID_304_");
                        svgItem.innerHTML = this.model.get("instruction").model.get("font");

                        svgItem = document.getElementById("XMLID_311_");
                        svgItem.innerHTML = this.model.get("ram").model.get_dades(this.model.get("instruction").model.get("font"));
                    }
                    else{
                        svgItem = document.getElementById("XMLID_304_");
                        svgItem.innerHTML = pc;

                        svgItem = document.getElementById("XMLID_311_");
                        svgItem.innerHTML = this.model.get("ram").model.get_dades(pc);
                    }
                }
            }
        },

        /* ====================================================================== */

        /**
         * Pinta el diagrama de temps segons la configuracio de entrada.
         */
        pintar_diagrama: function (array) {

            // array [clock LE instruccio @ PC Bus fetch]
            this.pintar_diagrama_default();

            var pintar=[];
            var noPintar=[];
            var svgItem;
            var last = array.length;

            var split5 = array[last-1].split(",");
            var split4 = array[last-2].split(",");
            var split3 = array[last-3].split(",");
            var split2 = array[last-4].split(",");
            var split1 = array[last-5].split(",");
            var split0 = array[last-6].split(",");


            /* ****************************** PINTA 5 ************************************** */
            svgItem = document.getElementById("clock5");
            svgItem.innerHTML = split5[0];

            //LE 5
            if (split5[1]=="1"){pintar.push("MLID_339_","MLID_406_");noPintar.push("MLID_337_");}
            else {noPintar.push("MLID_339_","MLID_406_");pintar.push("MLID_337_");}
            //IR 5
            svgItem = document.getElementById("IR5");
            svgItem.innerHTML = ("0000000000000000"+this.model.convertir_input(split5[2])).substr(-16);
            if (split5[2]==split4[2]){pintar.push("MLID_347_","MLID_348_","MLID_281_","MLID_280_");noPintar.push("MLID_344_","MLID_343_","MLID_276_","MLID_277_");}
            else{noPintar.push("MLID_347_","MLID_348_","MLID_281_","MLID_280_");pintar.push("MLID_344_","MLID_343_","MLID_276_","MLID_277_");}
            //@ 5
            svgItem = document.getElementById("@5");
            svgItem.innerHTML = ("0000000"+this.model.convertir_input(split5[3])).substr(-7);
            if(split5[3]==split4[3]){pintar.push("MLID_290_","MLID_357_","MLID_291_","MLID_358_");noPintar.push("MLID_286_","MLID_287_","MLID_354_","MLID_353_");}
            else{noPintar.push("MLID_290_","MLID_357_","MLID_291_","MLID_358_");pintar.push("MLID_286_","MLID_287_","MLID_354_","MLID_353_");}
            //PC 5
            svgItem = document.getElementById("PC5");
            svgItem.innerHTML = ("0000000"+this.model.convertir_input(split5[4])).substr(-7);
            if(split5[4]==split4[4]){pintar.push("MLID_367_","MLID_368_","MLID_300_","MLID_301_");noPintar.push("MLID_364_","MLID_363_","MLID_296_","MLID_297_");}
            else{noPintar.push("MLID_367_","MLID_368_","MLID_300_","MLID_301_");pintar.push("MLID_364_","MLID_363_","MLID_296_","MLID_297_");}
            //Bus 5
            svgItem = document.getElementById("bus5");
            svgItem.innerHTML = ("0000000000000000"+this.model.convertir_input(split5[5])).substr(-16);

            if (split5[6]=="decode" ||split5[6]=="exec"){pintar.push("MLID_374_","MLID_373_","MLID_379_","MLID_380_","MLID_381_","MLID_382_","MLID_383_","MLID_384_",
                "MLID_385_","MLID_386_","MLID_387_","MLID_388_","MLID_389_","MLID_390_","MLID_391_","MLID_392_",
                "MLID_393_","MLID_394_","MLID_395_","MLID_396_","MLID_397_","MLID_398_","MLID_371_","MLID_372_","MLID_306_","MLID_307_");
                noPintar.push("MLID_370_","MLID_370b_","MLID_369_","MLID_369b_","MLID_377_","MLID_378_","MLID_310_","MLID_311_","MLID_375_","MLID_376_");
                svgItem.innerHTML = "";
            }

            else if(split5[5]!=split4[5]){
                pintar.push("MLID_374_","MLID_373_","MLID_306_","MLID_307_","MLID_379_","MLID_380_","MLID_382_","MLID_381_");
                noPintar.push("MLID_377_","MLID_378_","MLID_310_","MLID_311_","MLID_370b_","MLID_369b_");
            }
            else{}

            /* ****************************** PINTA 4 ************************************** */
            svgItem = document.getElementById("clock4");
            svgItem.innerHTML = split4[0];

            //LE 4
            if (split4[1]=="1"){pintar.push("MLID_274_","MLID_405_","MLID_406_");noPintar.push("MLID_272_");}
            else {noPintar.push("MLID_274_","MLID_405_","MLID_406_");pintar.push("MLID_272_");}
            //IR 4
            svgItem = document.getElementById("IR4");
            svgItem.innerHTML = ("0000000000000000"+this.model.convertir_input(split4[2])).substr(-16);
            if (split4[2]==split3[2]){pintar.push("MLID_282_","MLID_283_","MLID_216_","MLID_215_");noPintar.push("MLID_279_","MLID_278_","MLID_212_","MLID_211_");}
            else{noPintar.push("MLID_282_","MLID_283_","MLID_216_","MLID_215_");pintar.push("MLID_279_","MLID_278_","MLID_212_","MLID_211_");}
            //@ 4
            svgItem = document.getElementById("@4");
            svgItem.innerHTML = ("0000000"+this.model.convertir_input(split4[3])).substr(-7);
            if(split4[3]==split3[3]){pintar.push("MLID_292_","MLID_293_","MLID_226_","MLID_225_");noPintar.push("MLID_289_","MLID_288_","MLID_222_","MLID_221_");}
            else{noPintar.push("MLID_292_","MLID_293_","MLID_226_","MLID_225_");pintar.push("MLID_289_","MLID_288_","MLID_222_","MLID_221_");}
            //PC 4
            svgItem = document.getElementById("PC4");
            svgItem.innerHTML = ("0000000"+this.model.convertir_input(split4[4])).substr(-7);
            if(split4[4]==split3[4]){pintar.push("MLID_302_","MLID_235_","MLID_236_","MLID_303_");noPintar.push("MLID_231_","MLID_299_","MLID_232_","MLID_298_");}
            else{noPintar.push("MLID_302_","MLID_235_","MLID_236_","MLID_303_");pintar.push("MLID_231_","MLID_299_","MLID_232_","MLID_298_");}
            //Bus 4
            svgItem = document.getElementById("bus4");
            svgItem.innerHTML = ("0000000000000000"+this.model.convertir_input(split4[5])).substr(-16);

            if (split4[6]=="decode" ||split3[6]=="exec"){pintar.push("MLID_241_","MLID_242_","MLID_308_","MLID_309_","MLID_314_","MLID_315_","MLID_316_","MLID_317_",
                "MLID_318_","MLID_319_","MLID_320_","MLID_321_","MLID_322_","MLID_323_","MLID_306_","MLID_307_","MLID_324_","MLID_325_",
                "MLID_326_","MLID_327_","MLID_328_","MLID_329_","MLID_330_","MLID_331_","MLID_332_","MLID_333_");
                noPintar.push("MLID_305_","MLID_305b_","MLID_304_","MLID_304b_","MLID_312_","MLID_313_","MLID_310_","MLID_311_","MLID_245_","MLID_246_");
                svgItem.innerHTML = "";
            }

            else if(split4[5]!=split3[5]){
                pintar.push("MLID_309_","MLID_308_","MLID_314_","MLID_315_","MLID_316_","MLID_317_","MLID_305_","MLID_304_");
                noPintar.push("MLID_312_","MLID_313_","MLID_305b_","MLID_304b_");
            }
            else{}

            /* ****************************** PINTA 3 ************************************** */
            svgItem = document.getElementById("clock3");
            svgItem.innerHTML = split3[0];

            //LE 3
            if (split3[1]=="1"){pintar.push("MLID_209_","MLID_404_","MLID_405_");noPintar.push("MLID_207_");}
            else {noPintar.push("MLID_209_","MLID_404_","MLID_405_");pintar.push("MLID_207_");}
            //IR 3
            svgItem = document.getElementById("IR3");
            svgItem.innerHTML = ("0000000000000000"+this.model.convertir_input(split3[2])).substr(-16);
            if (split3[2]==split2[2]){pintar.push("MLID_217_","MLID_150_","MLID_151_","MLID_218_");noPintar.push("MLID_214_","MLID_213_","MLID_146_","MLID_147_");}
            else{noPintar.push("MLID_217_","MLID_150_","MLID_151_","MLID_218_");pintar.push("MLID_214_","MLID_213_","MLID_146_","MLID_147_");}
            //@ 3
            svgItem = document.getElementById("@3");
            svgItem.innerHTML = ("0000000"+this.model.convertir_input(split3[3])).substr(-7);
            if(split3[3]==split2[3]){pintar.push("MLID_227_","MLID_160_","MLID_161_","MLID_228_");noPintar.push("MLID_224_","MLID_156_","MLID_157_","MLID_223_");}
            else{noPintar.push("MLID_227_","MLID_160_","MLID_161_","MLID_228_");pintar.push("MLID_224_","MLID_156_","MLID_157_","MLID_223_");}
            //PC 3
            svgItem = document.getElementById("PC3");
            svgItem.innerHTML = ("0000000"+this.model.convertir_input(split3[4])).substr(-7);
            if(split3[4]==split2[4]){pintar.push("MLID_237_","MLID_170_","MLID_171_","MLID_238_");noPintar.push("MLID_234_","MLID_166_","MLID_167_","MLID_233_");}
            else{noPintar.push("MLID_237_","MLID_170_","MLID_171_","MLID_238_");pintar.push("MLID_234_","MLID_166_","MLID_167_","MLID_233_");}
            //Bus 3
            svgItem = document.getElementById("bus3");
            svgItem.innerHTML = ("0000000000000000"+this.model.convertir_input(split3[5])).substr(-16);
            if(split3[5]==split2[5]){}
            else{}

            /* ****************************** PINTA 2 ************************************** */
            svgItem = document.getElementById("clock2");
            svgItem.innerHTML = split2[0];

            //LE 2
            if (split2[1]=="1"){pintar.push("MLID_144_","MLID_404_","MLID_403_");noPintar.push("MLID_142_");}
            else {noPintar.push("MLID_144_","MLID_404_","MLID_403_");pintar.push("MLID_142_");}
            //IR 2
            svgItem = document.getElementById("IR2");
            svgItem.innerHTML = ("0000000000000000"+this.model.convertir_input(split2[2])).substr(-16);
            if (split2[2]==split1[2]){pintar.push("MLID_152_","MLID_79_","MLID_80_","MLID_153_");noPintar.push("MLID_75_","MLID_149_","MLID_148_","MLID_76_");}
            else{noPintar.push("MLID_152_","MLID_79_","MLID_80_","MLID_153_");pintar.push("MLID_75_","MLID_149_","MLID_148_","MLID_76_");}
            //@ 2
            svgItem = document.getElementById("@2");
            svgItem.innerHTML = ("0000000"+this.model.convertir_input(split2[3])).substr(-7);
            if(split2[3]==split1[3]){pintar.push("MLID_162_","MLID_89_","MLID_90_","MLID_163_");noPintar.push("MLID_159_","MLID_85_","MLID_86_","MLID_158_");}
            else{noPintar.push("MLID_162_","MLID_89_","MLID_90_","MLID_163_");pintar.push("MLID_159_","MLID_85_","MLID_86_","MLID_158_");}
            //PC 2
            svgItem = document.getElementById("PC2");
            svgItem.innerHTML = ("0000000"+this.model.convertir_input(split2[4])).substr(-7);
            if(split2[4]==split1[4]){pintar.push("MLID_99_","MLID_172_","MLID_100_","MLID_173_");noPintar.push("MLID_169_","MLID_95_","MLID_96_","MLID_168_");}
            else{noPintar.push("MLID_99_","MLID_172_","MLID_100_","MLID_173_");pintar.push("MLID_169_","MLID_95_","MLID_96_","MLID_168_");}
            //Bus 2
            svgItem = document.getElementById("bus2");
            svgItem.innerHTML = ("0000000000000000"+this.model.convertir_input(split2[5])).substr(-16);
            if(split2[5]==split1[5]){}
            else{}

            /* ****************************** PINTA 1 ************************************** */
            svgItem = document.getElementById("clock1");
            svgItem.innerHTML = split1[0];

            //LE 2
            if (split1[1]=="1"){pintar.push("MLID_73_","MLID_16_","MLID_403_");noPintar.push("MLID_71_");}
            else {noPintar.push("MLID_73_","MLID_16_","MLID_403_");pintar.push("MLID_71_");}
            //IR 2
            svgItem = document.getElementById("IR1");
            svgItem.innerHTML = ("0000000000000000"+this.model.convertir_input(split1[2])).substr(-16);
            if (split1[2]==split0[2]){pintar.push("MLID_81_","MLID_19_","MLID_20_","MLID_82_");noPintar.push("MLID_78_","MLID_77_","MLID_13_","MLID_14_");}
            else{noPintar.push("MLID_81_","MLID_19_","MLID_20_","MLID_82_");pintar.push("MLID_78_","MLID_77_","MLID_13_","MLID_14_");}
            //@ 2
            svgItem = document.getElementById("@1");
            svgItem.innerHTML = ("0000000"+this.model.convertir_input(split1[3])).substr(-7);
            if(split1[3]==split0[3]){pintar.push("MLID_30_","MLID_91_","MLID_92_","MLID_31_");noPintar.push("MLID_88_","MLID_25_","MLID_26_","MLID_87_");}
            else{noPintar.push("MLID_30_","MLID_91_","MLID_92_","MLID_31_");pintar.push("MLID_88_","MLID_25_","MLID_26_","MLID_87_");}
            //PC 2
            svgItem = document.getElementById("PC1");
            svgItem.innerHTML = ("0000000"+this.model.convertir_input(split1[4])).substr(-7);
            if(split1[4]==split0[4]){pintar.push("MLID_40_","MLID_101_","MLID_102_","MLID_110_");noPintar.push("MLID_98_","MLID_36_","MLID_37_","MLID_97_");}
            else{noPintar.push("MLID_40_","MLID_101_","MLID_102_","MLID_110_");pintar.push("MLID_98_","MLID_36_","MLID_37_","MLID_97_");}
            //Bus 2
            svgItem = document.getElementById("bus1");
            svgItem.innerHTML = ("0000000000000000"+this.model.convertir_input(split1[5])).substr(-16);
            if(split1[5]==split0[5]){}
            else{}

            /* ****************************** PINTA 0 ************************************** */
            svgItem = document.getElementById("clock0");
            svgItem.innerHTML = split0[0];

            //LE 2
            if (split0[1]=="1"){pintar.push("MLID_11_","MLID_16_");noPintar.push("MLID_9_");}
            else {noPintar.push("MLID_11_","MLID_16_");pintar.push("MLID_9_");}
            //IR 2
            svgItem = document.getElementById("IR0");
            svgItem.innerHTML = ("0000000000000000"+this.model.convertir_input(split0[2])).substr(-16);
            /*if (split1[2]==split0[2]){pintar.push("MLID_81_","MLID_19_","MLID_20_","MLID_82_");noPintar.push("MLID_78_","MLID_77_","MLID_13_","MLID_14_");}
            else{noPintar.push("MLID_81_","MLID_19_","MLID_20_","MLID_82_");pintar.push("MLID_78_","MLID_77_","MLID_13_","MLID_14_");}*/
            //@ 2
            svgItem = document.getElementById("@0");
            svgItem.innerHTML = ("0000000"+this.model.convertir_input(split0[3])).substr(-7);
            /*if(split1[3]==split0[3]){pintar.push("MLID_30_","MLID_91_","MLID_92_","MLID_31_");noPintar.push("MLID_88_","MLID_25_","MLID_26_","MLID_87_");}
            else{noPintar.push("MLID_30_","MLID_91_","MLID_92_","MLID_31_");pintar.push("MLID_88_","MLID_25_","MLID_26_","MLID_87_");}*/
            //PC 2
            svgItem = document.getElementById("PC0");
            svgItem.innerHTML = ("0000000"+this.model.convertir_input(split0[4])).substr(-7);
            /*if(split1[4]==split0[4]){pintar.push("MLID_40_","MLID_101_","MLID_102_","MLID_110_");noPintar.push("MLID_98_","MLID_36_","MLID_37_","MLID_97_");}
            else{noPintar.push("MLID_40_","MLID_101_","MLID_102_","MLID_110_");pintar.push("MLID_98_","MLID_36_","MLID_37_","MLID_97_");}*/
            //Bus 2
            svgItem = document.getElementById("bus0");
            svgItem.innerHTML = ("0000000000000000"+this.model.convertir_input(split0[5])).substr(-16);
            /*if(split1[5]==split0[5]){}
            else{}*/

            for (var i=0; i<noPintar.length; i++){
                svgItem = document.getElementById(noPintar[i]);
                svgItem.style.strokeWidth= 0;
            }

            for (i=0; i<pintar.length; i++){
                svgItem = document.getElementById(pintar[i]);
                svgItem.style.strokeWidth= 2;
            }


        },

        /**
         * Pinta el diagrama de temps per defecte.
         */
        pintar_diagrama_default: function () {

            var noLines = [
                "MLID_11_","MLID_15_","MLID_16_",               // LE
                "MLID_18_","MLID_17_","MLID_13_","MLID_14_",    // IR
                "MLID_28_","MLID_27_","MLID_25_","MLID_26_",    // @
                "MLID_38_","MLID_39_","MLID_36_","MLID_37_",    // PC

                "MLID_43_","MLID_42_","MLID_48_","MLID_49_",
                "MLID_50_","MLID_51_","MLID_52_","MLID_53_",
                "MLID_54_","MLID_55_","MLID_56_","MLID_57_",
                "MLID_58_","MLID_59_","MLID_60_","MLID_61_",
                "MLID_62_","MLID_63_","MLID_64_","MLID_65_",
                "MLID_66_","MLID_67_","MLID_115_","MLID_41_",
                "MLID_73_","MLID_403_",               // LE
                "MLID_77_","MLID_78_","MLID_76_","MLID_75_",    // IR
                "MLID_88_","MLID_87_","MLID_85_","MLID_86_",    // @
                "MLID_98_","MLID_97_","MLID_95_","MLID_96_",    // PC

                "MLID_108_","MLID_107_","MLID_119_","MLID_120_",
                "MLID_121_","MLID_122_","MLID_123_","MLID_124_",
                "MLID_125_","MLID_126_","MLID_127_","MLID_128_",
                "MLID_129_","MLID_130_","MLID_131_","MLID_132_",
                "MLID_133_","MLID_134_","MLID_135_","MLID_136_",
                "MLID_137_","MLID_138_","MLID_105_","MLID_106_",
                "MLID_144_","MLID_404_",               // LE
                "MLID_149_","MLID_148_","MLID_146_","MLID_147_",    // IR
                "MLID_159_","MLID_158_","MLID_156_","MLID_157_",    // @
                "MLID_168_","MLID_169_","MLID_166_","MLID_167_",    // PC

                "MLID_178_","MLID_179_","MLID_177_","MLID_176_",
                "MLID_183_","MLID_184_","MLID_185_",
                "MLID_186_","MLID_187_","MLID_188_","MLID_189_",
                "MLID_190_","MLID_191_","MLID_192_","MLID_193_",
                "MLID_194_","MLID_195_","MLID_196_","MLID_198_","MLID_197_",
                "MLID_202_","MLID_203_","MLID_200_","MLID_201_",
                "MLID_209_","MLID_405_",               // LE
                "MLID_214_","MLID_213_","MLID_211_","MLID_212_",    // IR
                "MLID_224_","MLID_223_","MLID_221_","MLID_222_",    // @
                "MLID_234_","MLID_233_","MLID_231_","MLID_232_",    // PC

                "MLID_243_","MLID_244_","MLID_249_","MLID_250_",
                "MLID_251_","MLID_252_","MLID_253_","MLID_254_",
                "MLID_255_","MLID_256_","MLID_257_","MLID_258_",
                "MLID_259_","MLID_260_","MLID_261_","MLID_262_",
                "MLID_263_","MLID_264_","MLID_265_","MLID_266_",
                "MLID_267_","MLID_268_","MLID_241_","MLID_242_",
                "MLID_274_","MLID_406_",               // LE
                "MLID_279_","MLID_278_","MLID_276_","MLID_277_",    // IR
                "MLID_289_","MLID_288_","MLID_286_","MLID_287_",    // @
                "MLID_298_","MLID_299_","MLID_296_","MLID_297_",    // PC

                "MLID_309_","MLID_308_","MLID_314_","MLID_315_",
                "MLID_316_","MLID_317_","MLID_318_","MLID_319_",
                "MLID_320_","MLID_321_","MLID_322_","MLID_323_",
                "MLID_324_","MLID_325_","MLID_326_","MLID_327_",
                "MLID_328_","MLID_329_","MLID_330_","MLID_331_",
                "MLID_332_","MLID_333_","MLID_306_","MLID_307_",
                "MLID_339_",              // LE
                "MLID_344_","MLID_343_","MLID_341_","MLID_342_",    // IR
                "MLID_354_","MLID_353_","MLID_351_","MLID_352_",    // @
                "MLID_363_","MLID_364_","MLID_361_","MLID_362_",    // PC

                "MLID_374_","MLID_373_","MLID_379_","MLID_380_",
                "MLID_381_","MLID_382_","MLID_383_","MLID_384_",
                "MLID_385_","MLID_386_","MLID_387_","MLID_388_",
                "MLID_389_","MLID_390_","MLID_391_","MLID_392_",
                "MLID_393_","MLID_394_","MLID_395_","MLID_396_",
                "MLID_397_","MLID_398_","MLID_371_","MLID_372_"
            ];

            var lines = [
                "MLID_9_",
                "MLID_19_","MLID_20_","MLID_21_","MLID_22_",
                "MLID_30_","MLID_31_","MLID_32_","MLID_33_",
                "MLID_40_","MLID_110_","MLID_112_","MLID_111_",
                "MLID_44_","MLID_45_","MLID_46_","MLID_47_",
                "MLID_114b_","MLID_113b_","MLID_114_","MLID_113_",

                "MLID_71_",
                "MLID_81_","MLID_82_","MLID_79_","MLID_80_",
                "MLID_91_","MLID_92_","MLID_89_","MLID_90_",
                "MLID_101_","MLID_102_","MLID_99_","MLID_100_",
                "MLID_117_","MLID_118_","MLID_109_","MLID_116_",
                "MLID_104b_","MLID_103b_","MLID_104_","MLID_103_",

                "MLID_142_",
                "MLID_153_","MLID_152_","MLID_150_","MLID_151_",
                "MLID_162_","MLID_163_","MLID_160_","MLID_161_",
                "MLID_172_","MLID_173_","MLID_170_","MLID_171_",
                "MLID_181_","MLID_182_", "MLID_180_","MLID_182b_",
                "MLID_175b_","MLID_174b_","MLID_175_","MLID_174_",

                "MLID_207_",
                "MLID_215_","MLID_216_","MLID_217_","MLID_218_",
                "MLID_225_","MLID_226_","MLID_227_","MLID_228_",
                "MLID_235_","MLID_236_","MLID_237_","MLID_238_",
                "MLID_245_","MLID_246_","MLID_247_","MLID_248_",
                "MLID_240b_","MLID_239b_","MLID_240_","MLID_239_",

                "MLID_272_",
                "MLID_280_","MLID_281_","MLID_282_","MLID_283_",
                "MLID_291_","MLID_292_","MLID_293_","MLID_290_",
                "MLID_300_","MLID_301_","MLID_302_","MLID_303_",
                "MLID_310_","MLID_311_","MLID_312_","MLID_313_",
                "MLID_305b_","MLID_304b_","MLID_305_","MLID_304_",

                "MLID_337_",
                "MLID_345_","MLID_346_","MLID_347_","MLID_348_",
                "MLID_355_","MLID_356_","MLID_357_","MLID_358_",
                "MLID_365_","MLID_366_","MLID_367_","MLID_368_",
                "MLID_375_","MLID_376_","MLID_377_","MLID_378_",
                "MLID_370b_","MLID_369b_","MLID_370_","MLID_369_"
            ];

            var clock = ["clock0","clock1","clock2","clock3","clock4","clock5"];
            var IR = ["IR0","IR1","IR2","IR3","IR4","IR5"];
            var adre = ["@0","@1","@2","@3","@4","@5"];
            var PC = ["PC0","PC1","PC2","PC3","PC4","PC5"];
            var bus = ["bus0","bus1","bus2","bus3","bus4","bus5"];

            var svgItem;

            for (var i=0; i<noLines.length; i++){
                svgItem = document.getElementById(noLines[i]);
                svgItem.style.strokeWidth= 0;
            }

            for ( i=0; i<lines.length; i++){
                svgItem = document.getElementById(lines[i]);
                svgItem.style.strokeWidth= 2;
            }

            for ( i=0; i<IR.length; i++){
                svgItem = document.getElementById(IR[i]);
                svgItem.innerHTML = "0000000000000000";
            }

            for ( i=0; i<bus.length; i++){
                svgItem = document.getElementById(bus[i]);
                svgItem.innerHTML = "0000000000000000";
            }

            for ( i=0; i<adre.length; i++){
                svgItem = document.getElementById(adre[i]);
                svgItem.innerHTML = "0000000";
            }

            for ( i=0; i<PC.length; i++){
                svgItem = document.getElementById(PC[i]);
                svgItem.innerHTML = "0000000";
            }
            for ( i=0; i<clock.length; i++){
                svgItem = document.getElementById(clock[i]);
                svgItem.innerHTML = "-";
            }

        }

    });
    return vUi;
});

