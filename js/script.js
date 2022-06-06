
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


const complejidadLimite = 10;

function mostrarMetricas()
{
  var arrayLineasCodigo = document.getElementById("id-codigo").value.split('\n'); 
  analizarMetodos(arrayLineasCodigo);
}

complejidadCiclomatica = (texto) => {
  return(texto.match(/(if|for|while|\|\||&&|case|default|try)/gm) || []).length + 1;
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
  return primerLinea.replace(/[\t]*(public|private|protected) +(static)? +([A-z])+ +/, "").match(/.*[A-z]/)[0].replace(/(\(.*)/,"").trim();
}

function generarLabelsSalida(texto,valor,div){
    var lab = document.createElement("label");
    lab.textContent = texto;
    lab.style.fontWeight = "bold";
    lab.className = "col-md-3"
    div.appendChild(lab);
    var labDato = document.createElement("label");
    labDato.textContent = valor;
    div.appendChild(labDato);
    div.appendChild(document.createElement("br"));
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
  console.log(functionName.toLowerCase());
  codigoRaw = codigoRaw.toLowerCase();
  return (codigoRaw.match(new RegExp(functionName.toLowerCase(),"g"))).length - 1;
}

var metodos = [];

function analizarMetodos(arrayLineasCodigo){
  var inicioMetodo = false;
  var idxMet = 0;
  var llavesAbiertas = 0;

  for (let index = 0; index < arrayLineasCodigo.length; index++) {
      line = arrayLineasCodigo[index];
      if(!inicioMetodo && line.match(/(public|private|protected) +(static)? +([A-z])+ +([A-z].*\()+(\)|.*\))/)){
      
          // Fix Inicio de Llave linea siguiente //
          if(!line.match(/({){1}/))
            index++;

          inicioMetodo = true;
          llavesAbiertas = 1;
          var metodoDescubierto= new Metodo();
          metodoDescubierto.nombre = obtenerNombreMetodo(line);
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

          // Incrementa si es linea en blanco //
          if(line.match(/^(\\t|\s)*?$/)){
            metodo.codigoBlanco++;
          }
          
          // Fix llave de fin de metodo //
          if(llavesAbiertas != 0)
            metodo.codigoRaw += line + '\n';
      }
  }
  
  document.getElementById("id-resultado").style.display = "block";

  for (let index = 0; index < metodos.length; index++) {
    var metodo = metodos[index];
     
    metodo.fanIn = fanIn(metodo.nombre);
    metodo.fanOut = fanOut(metodo,metodos);
     
    var lineas_metodo = metodo.arrayLineas.length - 1 ;
    var lineas_comentarios_simples = metodo.codigoRaw.split('//').length - 1;
    var lineas_de_codigo = parseInt(lineas_metodo - lineas_comentarios_simples - metodo.codigoBlanco);
    var porcentaje_lineas_comentadas =(parseFloat((parseInt(lineas_comentarios_simples)/parseInt(lineas_metodo))*100).toFixed(2))+"%";
      
    if(!isNaN(porcentaje_lineas_comentadas))
      porcentaje_lineas_comentadas = 0+"%";
    
    var complejidad_ciclomatica = complejidadCiclomatica(metodo.codigoRaw);
    
    var halstead = halsteadMetodo(metodo.codigoRaw);
    var longitudHalstead = halstead[0];
    var volumenHalstead = halstead[1];

    var div = document.createElement("div");
    div.id = "id-div-" + index;
    var gen_h5 = document.createElement("h5");
    gen_h5.textContent = "Nombre del Metodo: " + metodo.nombre;
    div.appendChild(gen_h5);

    generarLabelsSalida("Cantidad de Lineas totales: ",lineas_metodo,div);
    generarLabelsSalida("Cantidad de Lineas de codigo: ",lineas_de_codigo,div);
    generarLabelsSalida("Cantidad de Lineas comentadas: ",lineas_comentarios_simples,div);
    generarLabelsSalida("Cantidad de Lineas en blanco: ", metodo.codigoBlanco, div);
    generarLabelsSalida("Porcentaje de comentarios: ", porcentaje_lineas_comentadas,div);
    var div_mccabe = document.createElement("div");
    div_mccabe.id = "id-div-mccabe";
    generarLabelsSalida("Complejidad: " ,complejidad_ciclomatica,div_mccabe);
    div.appendChild(div_mccabe);
    var div_halstead = document.createElement("div");
    div_halstead.id = "id-div-halstead";
    generarLabelsSalida("Fan in: ",metodo.fanIn,div);
    generarLabelsSalida("Fan out: ",metodo.fanOut,div);
    //generarLabelsSalida("Operadores: ",operadores,div_halstead);
    generarLabelsSalida("Longitud: ",longitudHalstead, div_halstead);
    generarLabelsSalida("Volumen: ",volumenHalstead, div_halstead);
    div.appendChild(div_halstead);
    
    var lblRecomendacion = document.createElement("label");
    lblRecomendacion.style.fontWeight = "bolder";
    
    if(complejidad_ciclomatica<=complejidadLimite){
      lblRecomendacion.textContent = "No es necesario modularizar el metodo.";
      lblRecomendacion.style.color = "green";
    } else {
      lblRecomendacion.textContent = "Se recomienda modularizar el metodo.";
      lblRecomendacion.style.color = "red"
    }
    div.appendChild(lblRecomendacion);
    document.getElementById("id-resultado").appendChild(div);
    div.className = "res_div"
    div.setAttribute("align","center");
    div.appendChild(document.createElement("br"));
  }
}
