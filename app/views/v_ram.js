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
define(['jquery' ,'backbone' , 'underscore', '../models/m_ram'], function($, Backbone, _, nram) {
    
    var vRam = Backbone.View.extend({

        /**
         * Inicialitza la vista de la memòria RAM.
         */
        initialize: function() {
            _.bindAll(this, 'render', 'render_update');
            this.model = new nram;
            this.render();
        },

        /**
         * Renderitza per defecte inicialitzant la memòria.
         */
        render: function() {
            console.log("render memoria");

            this.model.inicializarMemoria();

            var table = document.getElementById("mytable");
            var table2 = document.getElementById("mytable2");

            if (table.rows.length > 0 || table2.rows.length>0){
                this.render_update();
            }

            else {
                var mida = this.model.get("mida");

                // Instruccions
                var etiqI = this.model.get("etiquetaI");
                var operI = this.model.get("operadorI");
                var fontI = this.model.get("fontI");
                var destiI = this.model.get("destiI");
                var aIntru= this.model.get("aInstruccions");

                // Dadas
                var etiqD = this.model.get("etiquetaD");
                var valorD = this.model.get("valorD");
                var aDades = this.model.get("aDades");

                for (var i=mida-1; i>=0; i--){

                    if (i>=aDades){
                        var row = table2.insertRow(0);

                        var cell1 = row.insertCell(0);
                        cell1.innerHTML = etiqD[i];
                        cell1.className = 'custom-td-20';

                        var cell2 = row.insertCell(1);
                        cell2.innerHTML = i;
                        cell2.className = 'custom-td-20';

                        var cell3 = row.insertCell(2);
                        cell3.innerHTML = valorD[i];
                        cell3.className = 'custom-td-70';
                    }

                    else {
                        var row = table.insertRow(0);

                        var cell1 = row.insertCell(0);
                        cell1.innerHTML = etiqI[i] + "";
                        cell1.className = 'custom-td-20';

                        var cell2 = row.insertCell(1);
                        cell2.innerHTML = i;
                        cell2.className = 'custom-td-20';

                        var cell3 = row.insertCell(2);
                        cell3.innerHTML = operI[i]+" "+fontI[i]+" "+destiI[i];
                        cell3.className = 'custom-td-70';
                    }
                }

            }
        },

        /**
         * Renderitza la memòria sense inicialitzar-la.
         */
        render_update: function () {

            var table = document.getElementById("mytable");
            var table2 = document.getElementById("mytable2");

            var mida = this.model.get("mida");

            // Instruccions
            var etiqI = this.model.get("etiquetaI");
            var operI = this.model.get("operadorI");
            var fontI = this.model.get("fontI");
            var destiI = this.model.get("destiI");

            // Dades
            var etiqD = this.model.get("etiquetaD");
            var valorD = this.model.get("valorD");
            var aDades = this.model.get("aDades");

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

            // Controlador L/E
            var LE = document.getElementById("XMLID_324_");
            LE.innerHTML = this.model.get("flag");

            //var add = document.getElementById("XMLID_304_");
            //add.innerHTML = this.model.get_address();

            /*var addValor = document.getElementById("XMLID_311_");
             addValor.innerHTML = this.model.get_flag();*/
        },

        /**
         * Ens mostra un Modal per editar-lo.
         */
        editar_memoria: function () {
            $('#myModal').modal('show');
            var value = this.model.get("memoria_text");
            $('textarea').val(value);
        },

        /**
         * Guarda el resultat del Modal, i el passa al "parser" de l'applicació.
         * 
         * Si hi ha algun tipus d'error retorna una taula amb aquets, altrament 1.
         */
        guardar_edicio: function () {

            var value = $('textarea').val();

            this.model.carregarfitxer(value);
            $('#myModal').modal('hide');

            var err = this.model.get("errors");

            if (err.length>0){
                this.model.set("errors",[]);
                return err;
            }
            else {
                this.render_update();
                return 1;
            }
        }
    });
    return vRam;
});