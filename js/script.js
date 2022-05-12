
class Metodo{
    arrayLineas = [];
    idxArrayLineas = 0;
    complejidadCiclomatica = 0;
    fanIn = 0;
    fanOut= 0;
    codigoRaw = "";
    codigoBlanco=0;
    constructor(nombre, lineas) {
        this.nombre = nombre;
        this.lineas = lineas;
    }
}

const operadores = "+, -, /, *, int, double, float, ;, :, public, static, void, &&, ||, <=, >=, <, >";
const complejidadLimite = 10;

function mostrarMetricas()
{
  var arrayLineasCodigo = document.getElementById("id-codigo").value.split('\n'); 
  analizarMetodos(arrayLineasCodigo);
}

function complejidadCiclomatica(texto){
  let cc = 0;

  cc+=texto.split('if').length - 1;
  cc+=texto.split('for').length - 1;
  cc+=texto.split('while').length - 1;
  cc+=texto.split('||').length - 1;
  cc+=texto.split('&&').length - 1;
  cc+=texto.split('case').length - 1;
  cc+=texto.split('try').length - 1;
  
  return cc+1;
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

function getNombreMetodo(line){
  var nombre = line.replace(/[\t]*(public|private|protected) +(static)? +([A-z])+ +/,"");
  nombre = nombre.split(' ')[0].split('(')[0];
  return nombre;
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

function fanIn(metodoAnalizado,metodos){
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

function fanOut(functionName){
  var codigoRaw = document.getElementById("id-codigo").value;
  codigoRaw = codigoRaw.toLowerCase();
  return (codigoRaw.match(new RegExp(functionName.toLowerCase(),"g"))).length - 1;
}

function analizarMetodos(arrayLineasCodigo){
  var inicioMetodo = false;
  var metodos = [];
  var idxMet = 0;
  var llavesAbiertas = 0;
  for (let index = 0; index < arrayLineasCodigo.length; index++) {
      line = arrayLineasCodigo[index];
      if(!inicioMetodo && line.match(/(public|private|protected) +(static)? +([A-z])+ +([A-z]*\()+(\)|.*\))/)){
          //console.log(line);
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
          //Incrementa si es Linea en Blanco
          if(line.match(/^(\\t|\s)*?$/) != null){
            metodo.codigoBlanco++;
          }
          metodo.codigoRaw += line + '\n';
      }
  }
  
  document.getElementById("id-resultado").style.display = "block";

  for (let index = 0; index < metodos.length; index++) {
    var metodo = metodos[index];
     
    metodo.fanIn = fanIn(metodo,metodos);
    metodo.fanOut = fanOut(metodo.nombre);
     
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
      gen_h5.textContent = "Metodo: " +  metodo.nombre;
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
      generarLabelsSalida("Longitud: ",longitudHalstead,div_halstead);
      generarLabelsSalida("Volumen: ",volumenHalstead,div_halstead);
      div.appendChild(div_halstead);
      
      var lblRecomendacion = document.createElement("label");
      lblRecomendacion.style.fontWeight = "bolder";
      
      if(complejidad_ciclomatica<=complejidadLimite){
        lblRecomendacion.textContent = "No es necesario modularizar el metodo";
        lblRecomendacion.style.color = "green";
      } else {
        lblRecomendacion.textContent = "Se recomienda modularizar el metodo";
        lblRecomendacion.style.color = "red"
      }
      div.appendChild(lblRecomendacion);
      document.getElementById("id-resultado").appendChild(div);
      div.className = "res_div"
      div.setAttribute("align","center");
      div.appendChild(document.createElement("br"));
  }
}
