
class Metodo{
    arrayLineas = [];
    idxArrayLineas = 0;
    complejidadCiclomatica = 0;
    fanIn = 0;
    fanOut = 0;
    longitud = 0;
    volumen = 0;
    codigoRaw = "";
    codigoBlanco=0;
    constructor(nombre, lineas) {
        this.nombre = nombre;
        this.lineas = lineas;
    }
}

var metodos = [];


const complejidadLimite = 10;

function mostrarMetricas()
{
  var arrayLineasCodigo = document.getElementById("id-codigo").value.split('\n'); 
  analizarMetodos(arrayLineasCodigo);
}

complejidadCiclomatica = (texto) => {
  return(texto.match(/(\b(if|for|while|case|default|try)\b|\B(\|\||&&)\B)/gm) || []).length + 1;
}

function halsteadMetodo(texto)
{
  var textosSinComentarios = texto.replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm, '');
  var cantidadOperadoresTotales = 0;
  var cantidadOperandosTotales = 0;
  var cantidadOperadoresUnicos = 0;
  var cantidadOperandosUnicos = 0;
  var operadoresArray = ["int", "double", "float", "char", "Integer", "String", "Boolean", "Exception", "new",
            "if", "for", "while", "do", "switch", "case", "default", "try", "catch", "finally", "break", "continue",
            "+", "-", "/", "*", "%", "++", "--", ";", ":", "=", "(", "[", "{", "?", "return",
            "&&", "||", "==", "!=", "<=", ">=", "<", ">"];

  // Calculo de n1 y N1 (Operadores) //
  for (let operador of operadoresArray) 
  {
    if(textosSinComentarios.indexOf(operador) != -1){
      cantidadOperadoresUnicos++;
      cantidadOperadoresTotales += texto.split(operador).length-1;
    }
  }

  // Calculo de n2 y N2 (Operandos) //
  var textosSinOperadores = textosSinComentarios;
  for (let operador of operadoresArray) 
  {
    while(textosSinOperadores.indexOf(operador) != -1)
    textosSinOperadores = textosSinOperadores.replace(operador, "");
  }
  
  textosSinCaracteresDeSalto = textosSinOperadores.replace(/\n|\t|\)|\]|\}/gm, "");

  textosOperandos = textosSinCaracteresDeSalto.replace(/\s+/gm, " ");

  let operandosArray = textosOperandos.split(" ");
 
  cantidadOperandosTotales = operandosArray.length - 1 ;

  let operandosUnicosArray = [];

  for(let operando of operandosArray){
    if(!operandosUnicosArray.includes(operando))
      operandosUnicosArray.push(operando);
  }

  cantidadOperandosUnicos = operandosUnicosArray.length -1

  var longitudHalstead = cantidadOperadoresTotales + cantidadOperandosTotales;
  var volumenHalstead  = parseFloat((cantidadOperadoresTotales+cantidadOperandosTotales)*Math.log2(cantidadOperadoresUnicos+cantidadOperandosUnicos)).toFixed(2);
  
  return [longitudHalstead, volumenHalstead];
}

function obtenerNombreMetodo(primerLinea){
  return primerLinea.replace(/([\t|\s]+|[\t|\s]?)(public|private|protected)[\s]+(static)?[\s]?([A-z]+)[\s]+/, "").replace(/(\(.*)/,"").trim();
}

function fanOut(metodoAnalizado,metodos){
  var res = 0;
  var codigoRaw = document.getElementById("id-codigo").value;
  codigoRaw = codigoRaw.toLowerCase();
  for(const c of metodoAnalizado.arrayLineas){
    for (const m of metodos) {
      if(c.match(new RegExp(m.nombre.toLowerCase(),"g")))
        res++;
    }
  }
  return res;
}

function fanIn(functionName){
  var codigoRaw = document.getElementById("id-codigo").value;
  codigoRaw = codigoRaw.toLowerCase();
  return (codigoRaw.match(new RegExp(functionName.toLowerCase(),"g"))).length - 1;
}

function analizarMetodos(arrayLineasCodigo){
  var inicioMetodo = false;
  var idxMet = 0;
  var llavesAbiertas = 0;

  for (let index = 0; index < arrayLineasCodigo.length; index++) {
      line = arrayLineasCodigo[index];
      
      if(!inicioMetodo && line.match(/(public|private|protected)[\s]+(static)?[\s]?([A-z]+)[\s]+([A-z]+)([\s]?|[\s]+)[(]([A-z|\s|,]+)?[)]/)){ 
          
        // Fix inicio de Llave linea siguiente //
          let pos = index;
          while(!arrayLineasCodigo[pos].match(/({){1}/)){
            pos++;
          }
          
          arrayLineasCodigo[pos] = arrayLineasCodigo[pos].replace(/({){1}/, '');

          inicioMetodo = true;
          llavesAbiertas = 1;
          var metodoDescubierto= new Metodo();
          metodoDescubierto.nombre = obtenerNombreMetodo(line);
          metodos[idxMet] = metodoDescubierto;
      }else if(inicioMetodo){
          let metodo =  metodos[idxMet];
          metodo.arrayLineas[metodo.idxArrayLineas] += line;
          metodo.idxArrayLineas++;
     
          if(line.match(/([{*])/)){
            llavesAbiertas+=line.match(/([{*])/g).length;
          }
          if(line.match(/([}*])/)){
            llavesAbiertas-=line.match(/([}*])/g).length; 
          }
          if(llavesAbiertas == 0){
              inicioMetodo = false;
              idxMet++;
          }

          // Incrementa si es linea en blanco //
          if(line.match(/^(\\t|\s)*?$/)){
            metodo.codigoBlanco++;
          }
          
          // Fix llave de fin de metodo //
          if(llavesAbiertas != 0)
            metodo.codigoRaw += line + '\n';
      }
  }

  cargarDesplegable();

  window.scrollTo(0, document.body.scrollHeight);
}

cargarDesplegable = () => {
  document.getElementById("id-resultado").style.display = "block";

  const dropdown = document.getElementById('funciones');

  let index = 0;

  for(let metodo of metodos){
    let element = document.createElement('a');
    element.innerHTML = metodo.nombre;
    element.className = "dropdown-item";
    element.value = index;
    element.addEventListener('click', () => mostrarResultados(element.value), false);
    index++;
    dropdown.append(element);
  }
}

mostrarResultados = (index) => {
  document.getElementById('metodo').style.display = "block";
  
  let metodo = metodos[index];
     
  let lineasTotales = (metodo.arrayLineas.length - 1);
  let lineasComentadas = (metodo.codigoRaw.split('//').length - 1);
  let lineasCodigo = parseInt(lineasTotales - lineasComentadas - metodo.codigoBlanco);
  let porcComentadas = (parseFloat((parseInt(lineasComentadas)/parseInt(lineasTotales))*100).toFixed(2))+"%";
  porcComentadas = (!isNaN(porcComentadas))? 0+"%" : porcComentadas;
  let cc = complejidadCiclomatica(metodo.codigoRaw);
  metodo.fanIn = fanIn(metodo.nombre);
  metodo.fanOut = fanOut(metodo,metodos);
  let halstead = halsteadMetodo(metodo.codigoRaw);
  let recomendacion = "";
  
  if(cc<=complejidadLimite){
    recomendacion = "No es necesario modularizar el metodo.";
    document.getElementById('metodo-recomendacion').style.color = "green";
  }else{
    recomendacion = "Se recomienda modularizar el metodo.";
    document.getElementById('metodo-recomendacion').style.color = "red";
  }
  
  document.getElementById('metodo-nombre').innerHTML = "<b>Nombre del Metodo:</b> " + metodo.nombre;
  document.getElementById('metodo-lineasTotales').innerHTML = "<b>Cantidad de lineas totales:</b> " + lineasTotales;
  document.getElementById('metodo-lineasCodigo').innerHTML = "<b>Cantidad de lineas de codigo:</b> " + lineasCodigo;
  document.getElementById('metodo-lineasComentadas').innerHTML = "<b>Cantidad de lineas comentadas:</b> " + lineasComentadas;
  document.getElementById('metodo-lineasBlanco').innerHTML = "<b>Cantidad de lineas en blanco:</b> " + metodo.codigoBlanco;
  document.getElementById('metodo-porcComentadas').innerHTML = "<b>Porcentaje de comentarios:</b> " + porcComentadas;
  document.getElementById('metodo-complejidad').innerHTML = "<b>Complejidad Ciclomática:</b> " + cc;
  document.getElementById('metodo-fanIn').innerHTML = "<b>Fan-In:</b> " + metodo.fanIn;
  document.getElementById('metodo-fanOut').innerHTML = "<b>Fan-Out:</b> " + metodo.fanOut;
  document.getElementById('metodo-longitud').innerHTML = "<b>Longitud:</b> " + halstead[0];;
  document.getElementById('metodo-volumen').innerHTML = "<b>Volumen:</b> " +  halstead[1];
  document.getElementById('metodo-recomendacion').innerHTML = "<b>" + recomendacion + "</b>";

  window.scrollTo(0, document.body.scrollHeight);
}
