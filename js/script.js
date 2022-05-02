class Metodo{
    arrayLineas = [];
    idxArrayLineas = 0;
    complejidadCiclomatica = 0;
    constructor(nombre, lineas) {
        this.nombre = nombre;
        this.lineas = lineas;
    }
}


var operadores = "+, -, /, *, int, double, float, ;, :, public, static, void, &&, ||, <=, >=, <, >"
const complejidadLimite = 11;
function mostrarMetricas()
{
	var codigoRaw = document.getElementById("id-codigo").value;
	codigoRaw = codigoRaw.toLowerCase();
  var arrayLineasCodigo = codigoRaw.split('\n');
  var lineas_del_archivo = arrayLineasCodigo.length - 1;
  analizarMetodos(arrayLineasCodigo);

	var lineas_comentarios_simples = codigoRaw.split('//').length - 1;
	var lineas_de_codigo = parseInt(lineas_del_archivo - lineas_comentarios_simples);
	var porcentaje_lineas_comentadas = (parseFloat((parseInt(lineas_comentarios_simples)/parseInt(lineas_del_archivo))*100).toFixed(2))+"%";
	if(!isNaN(porcentaje_lineas_comentadas))
         porcentaje_lineas_comentadas = 0+"%";
	var complejidad_ciclomatica = complejidadCiclomatica(codigoRaw);
    
	var halstead = halsteadMetodo(codigoRaw);
	var longitudHalstead = halstead[0];
	var volumenHalstead = halstead[1];

	document.getElementById("lineastotales").value = lineas_del_archivo+1;
	document.getElementById("lineascodigo").value = lineas_de_codigo+1;
	document.getElementById("lineascomentadas").value = lineas_comentarios_simples+1;
	document.getElementById("lineasporcentaje").value = porcentaje_lineas_comentadas;
	document.getElementById("complejidad").value = complejidad_ciclomatica;
	document.getElementById("longitud").value = longitudHalstead;
	document.getElementById("volumen").value = volumenHalstead;
	if(complejidad_ciclomatica<complejidadLimite) alert("No es necesario modularizar el codigo");
	else alert("Se recomienda modularizar el programa");
}

function complejidadCiclomatica(texto)
{
	var c = 0;
	c+=texto.split('if').length - 1;
	/* c+=texto.split('else').length - 1; */
	c+=texto.split('for').length - 1;
	c+=texto.split('while').length - 1;
	c+=texto.split('||').length - 1;
	c+=texto.split('&&').length - 1;
	return c+1;
}

function halsteadMetodo(texto)
{
	//Operadores + - = * ; int double float return
	var textosSinComentarios = texto.replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm, '');
	var cantidadOperadoresTotales = 0;
	var cantidadOperandosTotales = 0;
	var cantidadOperadoresUnicos = 0;
	var cantidadOperandosUnicos = 0;
	//var operadores = ["+", "-", "/", "*", "int", "double", "float", ";", ":", "public", "static", "void", "&&", "||", "<=", ">=", "<", ">"];
	var operadoresArray = operadores.split(',');
	var operandosUnicos = [];
	var i;
	//OPERADORES UNICOS Y TOTALES.
	for (i = 0; i < operadores.length; i++) 
	{
		if(textosSinComentarios.indexOf(operadoresArray[i]) !=-1)
			cantidadOperadoresUnicos++;
		cantidadOperadoresTotales += texto.split(operadoresArray[i]).length-1;
	}

	//OPERADORES TOTALES

	//OPERANDOS UNICOS Y TOTALES.
	var aAnalizar = textosSinComentarios.split(' ');
	var hasta = textosSinComentarios.split(' ').length;
	for (j = 0; j < hasta; j++) 
	{
		//Si no es un operador y todavia no esta en el array de operandos unicos.
		if(operadoresArray.indexOf(aAnalizar[j]) == -1 && operandosUnicos.indexOf(aAnalizar[j]) == -1)
		{
			operandosUnicos.push(aAnalizar[j]);
			cantidadOperandosUnicos++;
		}
		//Si no es un operador.
		if(operadoresArray.indexOf(aAnalizar[j]) == -1)
			cantidadOperandosTotales++;
	}
	var longitudHalstead = parseInt(cantidadOperadoresUnicos*Math.log2(cantidadOperadoresUnicos)+cantidadOperandosUnicos*Math.log2(cantidadOperandosUnicos));
	var volumenHalstead  = parseFloat((cantidadOperadoresTotales+cantidadOperandosTotales)*Math.log2(cantidadOperadoresUnicos+cantidadOperandosUnicos)).toFixed(2);
	return [longitudHalstead, volumenHalstead];
}

function dropHandler(ev) {
  console.log('Fichero(s) arrastrados');

  // Evitar el comportamiendo por defecto (Evitar que el fichero se abra/ejecute)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    // Usar la interfaz DataTransferItemList para acceder a el/los archivos)
    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
      // Si los elementos arrastrados no son ficheros, rechazarlos
      if (ev.dataTransfer.items[i].kind === 'file') {
        var file = ev.dataTransfer.items[i].getAsFile();
        console.log('... file[' + i + '].name = ' + file.name);

		var fr=new FileReader();
            fr.onload=function(){
                document.getElementById('id-codigo')
                        .textContent=fr.result;
            }  
            fr.readAsText(file);
			document.getElementById("id-analizar-codigo").style.display = "block";
            document.getElementById("id-drop-zone").style.display = "none";
		}
    }
  } else {
    // Usar la interfaz DataTransfer para acceder a el/los archivos
    for (var i = 0; i < ev.dataTransfer.files.length; i++) {
      console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
    }
  }

  // Pasar el evento a removeDragData para limpiar
  removeDragData(ev)
}

function removeDragData(ev) {
  console.log('Removing drag data')

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to remove the drag data
    ev.dataTransfer.items.clear();
  } else {
    // Use DataTransfer interface to remove the drag data
    ev.dataTransfer.clearData();
  }
}

function dragOverHandler(ev) {
  console.log('File(s) in drop zone');

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

function showOnlySelected(id){
	for(e of document.getElementsByClassName("showOrHide")){
		e.style.display = 'none';
	}
	document.getElementById(id).style.display = 'block';
	return false;
}

function deleteFile(){
    document.getElementById("id-analizar-codigo").style.display = "none";
    document.getElementById("id-drop-zone").style.display = "block";
    const myNode =  document.getElementById("id-resultado");
    while (myNode.firstChild) {
      myNode.removeChild(myNode.lastChild);
    }
}

function getNombreMetodo(line){
    var nombre = line.replace(/[\t]*(public|private|protected) +(static)? +([A-z])+ +/,"");
    nombre = nombre.split(' ')[0].split('(')[0];
    return nombre;
}

function generarLabelsSalida(texto,valor){
       var lab = document.createElement("label");
       lab.textContent = texto + valor;
       document.getElementById("id-resultado").appendChild(lab);
       document.getElementById("id-resultado").appendChild(document.createElement("br"));
}

function fanIn(functionName){

}

function fanOut(functionName){
    
}

function analizarMetodos(arrayLineasCodigo){
    var inicioMetodo = false;
    var metodos = [];
    var idxMet = 0;
    var llavesAbiertas = 0;
    for (let index = 0; index < arrayLineasCodigo.length; index++) {
        line = arrayLineasCodigo[index];
        if(!inicioMetodo && line.match(/(public|private|protected) +(static)? +([A-z])+ +([A-z])+ *\({1}([A-z\[\], ])+ +[A-z]+ *\){1}/)){
            console.log(line);
            inicioMetodo = true;
            llavesAbiertas = 1;
            var metodoDescubierto= new Metodo();
            metodoDescubierto.nombre = getNombreMetodo(line);
            metodos[idxMet] = metodoDescubierto;
        }else if(inicioMetodo){
            let metodo =  metodos[idxMet];
            metodo.arrayLineas[metodo.idxArrayLineas] += line;
            metodo.idxArrayLineas++;
            if(line.match(/([{*])/))
                llavesAbiertas++;
            if(line.match(/([}*])/))
                llavesAbiertas--;
            if(llavesAbiertas == 0){
                inicioMetodo = false;
                idxMet++;
            }
        }
    }

    for (let index = 0; index < metodos.length; index++) {
       var metodo = metodos[index];
       var gen_h5 = document.createElement("h5");
       gen_h5.textContent = "Metodo: " +  metodo.nombre;
       document.getElementById("id-resultado").appendChild(gen_h5);
       generarLabelsSalida("Lineas Totales: ",metodo.arrayLineas.length);
       generarLabelsSalida("Lineas de codigo: ",metodo.arrayLineas.length);
       generarLabelsSalida("Lineas de codigo comentadas: ",metodo.arrayLineas.length);
       generarLabelsSalida("porcentaje de lineas comentadas: ",metodo.arrayLineas.length + '%');
    }
}
