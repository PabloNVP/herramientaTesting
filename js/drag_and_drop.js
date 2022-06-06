function dropHandler(ev) {
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
    metodos = [];
    while (myNode.firstChild) {
      myNode.removeChild(myNode.lastChild);
    }
}