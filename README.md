
SIMULADOR DE LA MÀQUINA SENZILLA

Autor: Bryan Pierre.

1. Introduccio del Projecte

En el món de la docència ens trobem que, en moltes situacions necessitem eines extres per facilitar l’aprenentatge dels  alumnes. Sobretot a l’hora d’ensenyar temes més tècnics i difícils d’entendre.

En el nostre cas, ens centrarem en l’ensenyament de la màquina senzilla, la qual defineix el comportament més bàsic d’una computadora. Composta per uns registres de dades, una memòria RAM, una unitat
algorítmica lògica i senyals de control que, més endavant explicarem.

Aquesta màquina senzilla es basa en part de la docència de l’assignatura d’Estructures i Tecnologies de computadors II (ETCII) del primer curs del Grau d’Enginyeria Informàtica de la Universitat de Girona.
Per això mateix, és una aplicació única i  feta a mida, on no trobarem res semblant a la xarxa.

Abans de continuar hem de parlar de la primera versió d’aquesta aplicació feta l’any 1996 per en Ferran García i Pagans com el seu treball de fi de carrera. Una versió molt aconseguida per l’època,
ja que no comptaven amb els recursos tecnològics i d’informació que tenim avui dia. Amb el pas del temps aquesta aplicació web ha anat quedant obsoleta, ja que la tecnologia amb la qual està feta és
molt poc segura i els navegadors estan deixant de donar suport.

Per això, aquest projecte és la renovació des de zero i amb noves tecnologies d’aquesta vella versió. Serà una aplicació web moderna feta majorment en Javascript i compatible amb els navegadors actuals.
També solucionarem errors de l’antiga versió i afegirem noves funcionalitats i sobretot una millora visual.

La idea de començar aquest projecte va ser la necessitat d’adaptar una bona aplicació docent obsoleta, a una aplicació que els alumnes d’informàtica poguessin utilitzar per aprendre de manera ràpida i
intuïtiva la matèria de la màquina senzilla.

El repte del projecte, estarà a crear sense cap codi font anterior i des de zero la nova aplicació web de la màquina senzilla.


2. Motivacions, propòsits i objectius

La meva motivació per a realitzar aquest projecte ha estat aprendre com fer aplicacions webs des de zero, i sobretot a mida, sense fer ús de gestors de continguts.

A més, poder agilitzar els meus coneixements sobre llenguatges de programació com Javascript, d’estructura web HTML i de disseny CSS, que estan molt valorades avui dia és un punt positiu i motivant.

Finalment saber que els futurs alumnes de la meva universitat, podran fer servir la meva aplicació, potser 20 anys més, és un sentiment que m’omple.

Com a objectiu vull crear una aplicació (SPA) “Single page aplication” del simulador de la màquina senzilla. Semblant a l’antiga versió però adaptada al dia d’avui. Que sigui mínimament “responsive”
i que sigui intuïtiva i funcional.

El meu propòsit és fer que l’aplicació sigui tot el correcte per ser utilitzada pels alumnes de la Universitat. A part faré tot l’esforç possible per documentar correctament el projecte per si en un f
utur es vol ampliar de la mà dels professors o dels alumnes.


3. Implementació


Per dur a terme el projecte al final s’ha escollit el llenguatge de programació Javascript i el framework Backbone per realitzar-lo. Aquest framework està orientat en el model MVC (Model View Controller)
i ens permet crear i estructurar el projecte de manera fàcil i ràpida.

A més s’han fet ús de llibreries per aconseguir la resta d’objectius del projecte. Com jQuery, per accedir als elements del DOM i aplicar els canvis, Require.js, per estructurar les dependències i
carregar-les correctament, Bootstrap framework front-end per crear el disseny “responsive” de l’aplicació, jsColor llibreria que ens permet seleccionar els colors que volem, etc.

A part s’han fet servir imatges SVG (Scalable Vector Graphics) per reproduir els dibuixos de la màquina senzilla i animar-los i tractar sobre ells directament.
Aquestes imatges es representen com a vectors dins del html i no tenen costos d’espai molt elevats, fent així que l’aplicació sigui ràpida en descarregar-la del servidor.
