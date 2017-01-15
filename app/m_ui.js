/*This file is part of Simulador de la Maquina Senzilla.

 Simulador de la Maquina Senzilla is free software: you can redistribute it and/or modify
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
 * Aquest model representa la interficie de la maquina senzilla. Aquesta interficie
 * executa les altres vistes de cada element de la maquina senzilla a mes
 * de guardar valors com el estat de la maquina o configuracions de la vista general.
 *
 */
define(['backbone', 'underscore','views/v_ram', 'views/v_pc', 'views/v_instruction', 'views/v_mux', 'views/v_registers', 'views/v_alu'], function(Backbone, _, v_ram, v_pc, v_instruction, v_mux, v_registers, v_alu){

    var Ui = Backbone.Model.extend({

        defaults: {
            ram: new v_ram(),                   /**< Vista de la memoria RAM. */
            pc: new v_pc(),                     /**< Vista del PC. */
            instruction: new v_instruction(),   /**< Vista del registre de instruccions. */
            mux: new v_mux(),                   /**< Vista del multiplexador. */
            registers: new v_registers(),       /**< Vista dels registres de dades. */
            alu: new v_alu(),                   /**< Vista de la ALU. */

            state: 0,                           /**< Estat actual en el que es troba la maquina senzilla. */
            buffer: [],                         /**< Buffer per guardar els estats anteriors de la maquina senzilla. */
            clock: 0,                           /**< Clock actual en el que es troba la maquina senzilla. */

            senyal1: '#90EE90',                 /**< Color del senyal de flag "1" utilitzat per representar els senyals de control. */
            senyal0:'#FF6347',                  /**< Color del senyal de flag "0" utilitzat per representar els senyals de control. */
            bus: '#00BFFF',                     /**< Color del flux de dades de la aplicacio. */
            
            assemblador: 0,                     /**< Entrada de dades del registre A. */

            diagrama: [ "-,0,0000000000000000,0,0,0000000000000000", "-,0,0000000000000000,0,0,0000000000000000",           /**< Configuracio inicial del diagrama de temps de la aplicacio. */
                "-,0,0000000000000000,0,0,0000000000000000", "-,0,0000000000000000,0,0,0000000000000000",
                "-,0,0000000000000000,0,0,0000000000000000", "X,0,0000000000000000,0,0,0000000000000000"]

        },
        
        /* ======================================================================= */

        /**
         * Funcio que representa el proces de fetch de la maquina senzilla.
         */
        fetch: function() {
            
            var pc = this.get("pc");
            var ram = this.get("ram");
            var instruction = this.get("instruction");
            var mux = this.get("mux");
            var registers = this.get("registers");
            var alu = this.get("alu");
            
            //1º mirar el PC
            var act_pc = pc.model.get("address");

            // 1,5º Falta Mux
            mux.model.set("address",["0","0"]);

            // Registers
            registers.model.set("MflagA","0");
            registers.model.set("MflagB","0");

            //2º coger registro memoria donde apunte el PC
            ram.model.set("flag",0);
            ram.model.set("address",act_pc);

            var font = (ram.model.get_font(act_pc));
            var desti = (ram.model.get_desti(act_pc));

            // Mirar fin del programa //
            var operador = ram.model.get("operadorI")[act_pc];

            //3º Guardarlo en la instruccion
            var co;
            if (operador == "add"){co = ["0","0"];}
            else if (operador == "mov"){co = ["1","0"];}
            else if (operador == "cmp"){co = ["0","1"];}
            else if (operador == "beq"){co = ["1","1"];}

            // DESCODIFICACIO
            instruction.model.set("flag","1");
            instruction.model.set("desti",parseInt(desti));
            instruction.model.set("font",parseInt(font));
            instruction.model.set("operacio",co);
            
            //4º PC + 1
            var num = act_pc+1;
            pc.model.set("address",num);

            var fz = alu.model.get("fz");
            var dadesF = ram.model.get_dades(font);
            var dadesD = ram.model.get_dades(desti);
            var ra = registers.model.get("dataA");
            var rb = registers.model.get("dataB");
            var buffer = this.get("buffer");
            buffer.push(act_pc+","+operador+","+font+","+dadesF+","+desti+","+dadesD+","+fz+","+ra+","+rb);
            this.set("buffer",buffer);

            if (this.get("assemblador")==0){
                this.render_normal();
            }
            else {this.render_assembly()}


            /* ******** Diagrama de temps ***** */
            var aux= this.get("diagrama");
            var aux_instr= aux[aux.length-1];
            var inst = aux_instr.split(",");
            aux.push(this.get("clock")+",0,"+inst[2]+","+act_pc+","+act_pc+","+operador+" "+font+" "+desti+",fetch");
            this.set("diagrama",aux);
            /* ******************************** */

            this.set("state",2);
        },


        /**
         * Funcio que representa el proces de decodificacio de la maquina senzilla.
         */
        decodificacio: function () {

            var instruction = this.get("instruction");
            var registres = this.get("registers");
            var mux = this.get("mux");
            var ram = this.get("ram");
            var pc = this.get("pc");

            instruction.model.set("flag","0");
            instruction.render_control(this.get("senyal1"),this.get("senyal0"));

            registres.model.set("MflagA","0");
            registres.model.set("MflagB","0");

            if (this.get("assemblador")==0){
                this.render_normal();
            }
            else {this.render_assembly()}

            this.set("state",3);

            var operador = instruction.model.get("operacio");

            /* ******** Diagrama de temps ***** */
            var act_pc = pc.model.get("address")-1;
            var font = (ram.model.get_font(act_pc));
            var desti = (ram.model.get_desti(act_pc));
            var operad = ram.model.get("operadorI")[act_pc];
            var aux= this.get("diagrama");

            aux.push(this.get("clock")+",0,"+operad+" "+font+" "+desti+","+act_pc+","+pc.model.get("address")+",D,decode");

            this.set("diagrama",aux);
            /* ******************************** */


            if (operador[0] == "1" && operador[1]== "1" ){
                this.set("state",7);
            }

        },

        /**
         * Funcio que representa el proces de consulta del flag de zero de la maquina senzilla.
         */
        consultaFZ: function () {

            var instruction = this.get("instruction");
            var alu = this.get("alu");
            var pc = this.get("pc");
            var ram = this.get("ram");


            var operador = instruction.model.get("operacio");

            /* ******** Diagrama de temps ***** */
            var act_pc = pc.model.get("address")-1;
            var font = (ram.model.get_font(act_pc));
            var desti = (ram.model.get_desti(act_pc));
            var operad = ram.model.get("operadorI")[act_pc];
            var aux= this.get("diagrama");

            aux.push(this.get("clock")+",0,"+operad+" "+font+" "+desti+","+act_pc+","+pc.model.get("address")+",X,exec");

            this.set("diagrama",aux);
            /* ******************************** */


            if (operador[0] == "1" && operador[1]== "1" && alu.model.get("fz") == 1 ){
                var indexDesti = instruction.model.get("desti");
                pc.model.set("address",indexDesti); // el fetch de la instruccio desti
                this.set("state",1);
            }

            else if (operador[0] == "1" && operador[1]== "1" && alu.model.get("fz") == 0 ){
                this.set("state",1);
            }

            if (this.get("assemblador")==0){
                this.render_normal();
            }
            else {this.render_assembly()}

        },

        /**
         * Funcio que representa el proces de cerca del openand font de la maquina senzilla.
         */
        operandB: function () {
            var pc = this.get("pc");
            var ram = this.get("ram");
            var instruction = this.get("instruction");
            var mux = this.get("mux");
            var registres = this.get("registers");
            var alu = this.get("alu");
            var pc = this.get("pc");


            // 1º Mux
            mux.model.set("address",["1","0"]);

            // 2º Valor de la Ram
            var indexFont = instruction.model.get("font");
            var valorB = ram.model.get_dades(indexFont);

            // 3º Copiar al registre B
            registres.model.set("dataB",valorB.toString());
            registres.model.set("MflagA","0");
            registres.model.set("MflagB","1");

            instruction.model.set("flag","0");

            /* ******** Diagrama de temps ***** */
            var act_pc = pc.model.get("address")-1;
            var font = (ram.model.get_font(act_pc));
            var desti = (ram.model.get_desti(act_pc));
            var operad = ram.model.get("operadorI")[act_pc];
            var aux= this.get("diagrama");

            aux.push(this.get("clock")+",0,"+operad+" "+font+" "+desti+","+font+","+pc.model.get("address")+","+ram.model.get_dades(font));
            this.set("diagrama",aux);
            /* ******************************** */

            this.set("state",4);

            var operador = instruction.model.get("operacio");
            if (operador[0] == "1" && operador[1]== "0"){
                this.set("state",8);
            }

            if (this.get("assemblador")==0){
                this.render_normal();
            }
            else {this.render_assembly()}
        },

        /**
         * Funcio que representa el proces de cerca del openand desti de la maquina senzilla.
         */
        operandA: function () {
            var ram = this.get("ram");
            var instruction = this.get("instruction");
            var mux = this.get("mux");
            var registers = this.get("registers");
            var pc = this.get("pc");


            // 1º Mux
            mux.model.set("address",["1","1"]);

            // 2º Valor de la Ram
            var indexFont = instruction.model.get("desti");
            var valorA = ram.model.get_dades(indexFont);

            // 3º Copiar al registre B
            registers.model.set("dataA",valorA.toString());
            registers.model.set("MflagA","1");
            registers.model.set("MflagB","0");

            instruction.model.set("flag","0");

            /* ******** Diagrama de temps ***** */
            var act_pc = pc.model.get("address")-1;
            var font = (ram.model.get_font(act_pc));
            var desti = (ram.model.get_desti(act_pc));
            var operad = ram.model.get("operadorI")[act_pc];
            var aux= this.get("diagrama");
            aux.push(this.get("clock")+",0,"+operad+" "+font+" "+desti+","+desti+","+pc.model.get("address")+","+ram.model.get_dades(desti));
            this.set("diagrama",aux);
            /* ******************************** */

            var operador = instruction.model.get("operacio");
            if (operador[0] == "0" && operador[1]== "1"){ //cmp
                this.set("state",6);
            }
            else{this.set("state",5);}

            if (this.get("assemblador")==0){
                this.render_normal();
            }
            else {this.render_assembly()}

        },

        /**
         * Funcio que representa el proces de execucio de la maquina senzilla
         * que segons quina instruccio estem executant fara una cosa o una altre.
         */
        execucio: function () {
            var ram = this.get("ram");
            var instruction = this.get("instruction");
            var mux = this.get("mux");
            var registers = this.get("registers");
            var alu = this.get("alu");
            var pc = this.get("pc");


            // Agafem valors dels registres A i B
            alu.model.set("inputA",registers.model.get("dataA"));
            alu.model.set("inputB",registers.model.get("dataB"));
            instruction.model.set("flag","0");

            registers.model.set("MflagA","0");
            registers.model.set("MflagB","0");

            // Mirem quina operacio efectua la Alu
            var operador = instruction.model.get("operacio");
            var clock = this.get("clock")+1;

            if (operador[0] == "0" && operador[1]== "0"){ //add
                
                mux.model.set("address",["1","1"]);
                mux.render();
                
                var limit = alu.model.add_inputs();

                if (limit==-1){return -1;}

                else{
                    alu.model.set("flag",["0","0"]);
                    alu.render();
                    alu.render_control(this.get("senyal1"),this.get("senyal0"));

                    ram.model.set("flag",1);
                    ram.model.set_valor(instruction.model.get("desti"),alu.model.get("sortida"));
                    ram.render_update();
                }

            }
            else if (operador[0] == "0" && operador[1]== "1"){ //cmp

                alu.model.cmp();
                alu.model.set("flag",["0","1"]);
                alu.render();
                alu.render_control(this.get("senyal1"),this.get("senyal0"));
                clock = clock - 1;

            }
            else if (operador[0] == "1" && operador[1]== "0"){ //mov
                mux.model.set("address",["1","1"]);
                mux.render();

                alu.model.mov();
                alu.model.set("flag",["1","0"]);
                alu.render();
                alu.render_control(this.get("senyal1"),this.get("senyal0"));

                ram.model.set("flag",1);
                ram.model.set_valor(instruction.model.get("desti"),alu.model.get("sortida"));
                ram.render_update();
                clock = clock - 1;

            }

            if (this.get("assemblador")==0){
                this.render_normal();
            }
            else {this.render_assembly()}

            this.set("state",1);

            /* ******** Diagrama de temps ***** */
            var act_pc = pc.model.get("address")-1;
            var font = (ram.model.get_font(act_pc));
            var desti = (ram.model.get_desti(act_pc));
            var operad = ram.model.get("operadorI")[act_pc];
            var aux= this.get("diagrama");

            aux.push(clock+",1,"+operad+" "+font+" "+desti+","+desti+","+pc.model.get("address")+",X,exec");
            this.set("diagrama",aux);
            /* ******************************** */

        },

        /* ======================================================================= */

        /**
         * Funcio que reseteja la maquina senzilla al clock 0, sense esborrar
         * els valors de la memporia RAM.
         */
        reset_clock: function () {
            var pc = this.get("pc");
            pc.model.set("address",0);

            var instruction = this.get("instruction");
            instruction.model.set("font",0);
            instruction.model.set("desti",0);
            instruction.model.set("operacio",["0","0"]);
            instruction.model.set("flag","0");

            var mux = this.get("mux");
            mux.model.set("address",["0","0"]);

            var registers = this.get("registers");
            registers.model.set("dataA","0");
            registers.model.set("dataB","0");
            registers.model.set("MflagA","0");
            registers.model.set("MflagB","0");

            var alu = this.get("alu");
            alu.model.set("inputA",0);
            alu.model.set("inputB",0);
            alu.model.set("fz","0");
            alu.model.set("flag",["0","0"]);

            this.set("state",1);
            this.set("buffer",[]);
            this.set("clock",0);

            this.set("diagrama",[ "-,0,0000000000000000,0,0,0000000000000000", "-,0,0000000000000000,0,0,0000000000000000",
                "-,0,0000000000000000,0,0,0000000000000000", "-,0,0000000000000000,0,0,0000000000000000",
                "-,0,0000000000000000,0,0,0000000000000000", "-,0,0000000000000000,0,0,0000000000000000"]);

            if (this.get("assemblador")==0){
                this.render_normal();
            }
            else {this.render_assembly()}
            
        },

        /**
         * Funcio que elimina tots els valors carregats previament a la memoria
         * RAM i reinicia tota la maquina senzilla.
         */
        kill: function () {
            var ram = this.get("ram");
            ram.model.inicializarMemoria();

            var pc = this.get("pc");
            pc.model.set("address",0);

            var instruction = this.get("instruction");
            instruction.model.set("font",0);
            instruction.model.set("desti",0);
            instruction.model.set("operacio",["0","0"]);
            instruction.model.set("flag","0");

            var mux = this.get("mux");
            mux.model.set("address",["0","0"]);

            var registers = this.get("registers");
            registers.model.set("dataA",0);
            registers.model.set("dataB",0);
            registers.model.set("MflagA","0");
            registers.model.set("MflagB","0");

            var alu = this.get("alu");
            alu.model.set("inputA",0);
            alu.model.set("inputB",0);
            alu.model.set("fz","0");
            alu.model.set("flag",["0","0"]);

            this.set("state",0);
            this.set("buffer",[]);
            this.set("clock",0);
            this.set("diagrama",[ "-,0,0000000000000000,0000000,0000000,0000000000000000", "-,0,0000000000000000,0000000,0000000,0000000000000000",
                "-,0,0000000000000000,0000000,0000000,0000000000000000", "-,0,0000000000000000,0000000,0000000,0000000000000000",
                "-,0,0000000000000000,0000000,0000000,0000000000000000", "-,0,0000000000000000,0000000,0000000,0000000000000000"]);

            if (this.get("assemblador")==0){
                this.render_normal();
            }
            else {this.render_assembly()}
        },
        
        /* ======================================================================= */

        /**
         * Funcio que carrega la instruccio anterior
         * @returns {number} retorna un numero que es el tipus de instruccion anterior (add, cmp, mov, beq)
         */
        carregarInstruccioAnterior: function () {
            
            var ram = this.get("ram");
            var instruction = this.get("instruction");
            var mux = this.get("mux");
            var registers = this.get("registers");
            var alu = this.get("alu");
            var pc = this.get("pc");

            var buffer = this.get("buffer");
            var array = buffer.pop().split(",");


            if (buffer.length==0 && this.get("clock")==0){this.set("state",1);}
            else {
                if (this.get("state")==2){
                    array = buffer.pop().split(",");
                }

                var index = parseInt(array[0]);

                pc.model.set("address",index);

                ram.model.set_operador(index,array[1]);

                ram.model.set_font(index,array[2]);
                ram.model.set_valor(parseInt(array[2]),this.convertir_input(array[3]));

                ram.model.set_desti(index,array[4]);
                ram.model.set_valor(parseInt(array[4]),this.convertir_input(array[5]));

                alu.model.set("fz",array[6]);

                registers.model.set("dataA",array[7]);
                registers.model.set("dataB",array[8]);
                
                this.set("state",1);

                if (array[1]=="add"){return 1;}
                else if (array[1]=="mov"){return 2;}
                else if (array[1]=="beq"){return 3;}
                else if (array[1]=="cmp"){return 4;}
                else {return 0;}
            }
        },

        /**
         * Funcio que retorna el valor del contingut del registre de instruccions
         * @returns {string} retornal el valor en format ("add 100 100")
         */
        get_instruccio: function () {
            var instruction = this.get("instruction");
            var inst = "";
            var oper = instruction.model.get("operacio");
            if (oper[0]=="0" && oper[1]=="0"){inst="add";}
            if (oper[0]=="0" && oper[1]=="1"){inst="cmp";}
            if (oper[0]=="1" && oper[1]=="0"){inst="mov";}
            if (oper[0]=="1" && oper[1]=="1"){inst="beq";}
            return (inst+" "+instruction.model.get("font")+", "+instruction.model.get("desti"));
        },

        /**
         * Converteix un string del tipus "add 100 100" o un enter a codi binari.
         * @param input string tipus "add 100 100" o "18"
         * @returns {string} retorna el valor entrat en binari
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


                return ("000000000000000" + operador + fontAux + destiAux).substr(-16);
            }

            else {
                return (parseInt(input).toString(2));
            }

        },

        /* ====================================================================== */

        /**
         * Rendereitza la maquina senzilla en mode normal
         */
        render_normal: function () {
            var pc = this.get("pc");
            var ram = this.get("ram");
            var instruction = this.get("instruction");
            var mux = this.get("mux");
            var registers = this.get("registers");
            var alu = this.get("alu");

            pc.render();
            mux.render();
            registers.render();
            instruction.render();
            ram.render_update();
            alu.render();

        },

        /**
         * Renderitza la maquina senzilla en mode assamblador
         */
        render_assembly: function () {

            var pc = this.get("pc");
            var ram = this.get("ram");
            var instruction = this.get("instruction");
            var mux = this.get("mux");
            var registers = this.get("registers");
            var alu = this.get("alu");

            pc.render_assembly();
            mux.render();
            registers.render_assembly();
            instruction.render_assembly();
            ram.render_update();
            alu.render();
        }

    });

    return Ui;

});

