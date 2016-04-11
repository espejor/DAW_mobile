

//"use strict";
var app = {};
var iconoHumedad = "./images/iconos/humedad.png";
var iconoWind = "./images/iconos/wind.png";
var iconoTemp = "./images/iconos/temp.png";
var municipio = "Sevilla";
var flecha = "";


//---------- Geolocalización

var longitud;
var latitud;
function getLocation(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(cargaPosicion,falloPosicion,geoData);
    }
  }


function cargaPosicion(position) {
  latitud = position.coords.latitude;
  longitud = position.coords.longitude;
  app.cargaDatos();
//  app.cargaDatosFrcst();
}

function falloPosicion(objPositionError){
  switch (objPositionError.code){
    case objPositionError.PERMISSION_DENIED:
      alert("No se ha permitido el acceso a la posición del usuario.");
    break;
    case objPositionError.POSITION_UNAVAILABLE:
      alert("No se ha podido acceder a la información de su posición.");
    break;
    case objPositionError.TIMEOUT:
      alert("El servicio ha tardado demasiado tiempo en responder.");
    break;
    default:
      alert("Error desconocido.");
  }
}

var geoData = {
  enableHighAccuracy: false,
  maximumAge        : 30000,
  timeout           : 4000
};

//---------- FIN Geoloacalización

function asignaMunicipio(){
  municipio = $('#municipio').val();
  latitud = null;
  longitud = null;
  app.cargaDatos();
//  app.cargaDatosFrcst();
}


$(document).ready(function(){
  // Variables de inico
  app.apikey = "05b19ab20e25b29516d13983b8491391";
  app.municipio = "Sevilla";
  // Cargar contenido principal de la página
  cargaChunks();
  // Asignación de manejadores de eventos
  $('#consultar').click(asignaMunicipio);
  $('#home').click(cargaChunks);
  $('#ver_frcst').click(app.cargaDatosFrcst);
  $('#buscar_en_mapa').click(crearMapa);
  $('#area_inicio').click(miTiempo)
  // Cargar datos meteorológicos de la portada
  miTiempo();
  //  app.cargaDatosFrcst();

});

function miTiempo(){
  getLocation();
  app.cargaDatos();
}

function cargaChunks(){
  $('#contenido').css("height","auto");
  $('#contenido').attr("title","inicio");
  $('#nav_movil').load("iconos.html");
  $('#contenido').load("iconos.html");
}

app.cargaDatos = function() {

  if ($('#municipio').val() != ""){
    municipio = $('#municipio').val();
  }

  if (latitud && longitud){
    app.url = "http://api.openweathermap.org/data/2.5/weather?lat=" + latitud + "&lon=" + longitud + "&APPID=" + app.apikey + "&units=metric";
  } else{
    app.url = "http://api.openweathermap.org/data/2.5/weather?q=" + municipio + "&APPID=" + app.apikey + "&units=metric";
  }
  $.ajax({
    url: app.url,
    success: function(data) {
      app.datos = data;
      app.procesaDatos();
      if ($('#contenido').attr("title") == "forecast"){
        app.cargaDatosFrcst();
      }
      if ($('#contenido').attr("title") == "mapa"){
        obtenerCoordenada();
        crearMapa();
      }
    },
    error: function() {
      $('#contenido').load("error.html");
      $('#contenido').attr("title","error");
    }
  });
}

function obtenerCoordenada(){
  // // Creamos el Objeto Geocoder
  // var geocoder = new google.maps.Geocoder();
  // // Hacemos la petición indicando la dirección e invocamos la función
  // // geocodeResult enviando todo el resultado obtenido
  // geocoder.geocode({ 'address': municipio}, geocodeResult);

  longitud = app.datos.coord.lon;
  latitud = app.datos.coord.lat;
}

function geocodeResult(results, status){
  if (status == 'OK'){
    latitud = results[0].geometry.location.lat();
    longitud = results[0].geometry.location.lng();
    crearMapa();
  }
}

app.cargaDatosFrcst = function() {
  if (latitud && longitud){
    app.url_frcst = "http://api.openweathermap.org/data/2.5/forecast/daily?lat=" + latitud + "&lon=" + longitud + "&APPID=" + app.apikey + "&units=metric&cnt7";
  }else{
    app.url_frcst = "http://api.openweathermap.org/data/2.5/forecast/daily?q=" + municipio + "&APPID=" + app.apikey + "&units=metric&cnt7";
  }
  $.ajax({
    url: app.url_frcst,
    success: function(data) {
      app.datos_frcst = data;
      app.procesaDatos_frcst();
    },
    error: function() {
//      alert("Ups! No puedo obtener información de la previsión a una semana");
      $('#contenido').load("errorFrcst.html");
      $('#contenido').attr("title","errorFrcst");
    }
  });
}

app.procesaDatos = function() {
  app.municipio = app.datos.name;
  app.condicionNombre = app.datos.weather[0].main;
  app.temperatura = app.datos.main.temp;
  app.temperatura = (parseInt(app.temperatura)).toString();

  app.windSpeed = app.datos.wind.speed;
  app.windSpeed = (parseInt(app.windSpeed)).toString();

  app.windDir = app.datos.wind.deg;
  if (!isNaN(parseInt(app.windDir))){
    app.windDir = (parseInt(app.windDir)).toString();
  }else{
    app.windDir = "0";
  }
  app.humedad = app.datos.main.humidity;
  //var condicionIcono = app.datos.weather[0].icon;
  app.icono = "http://openweathermap.org/img/w/"+app.datos.weather[0].icon+".png";
  //app.obtenIcono(condicionIcono);
  app.portada = "images/" + app.datos.weather[0].icon+".jpg";
  app.muestra();
}
app.procesaDatos_frcst = function() {
  app.fecha_frcst = new Array(7);
  app.temp_max_frcst = new Array(7);
  app.temp_min_frcst = new Array(7);
  app.windSpeed_frcst = new Array(7);
  app.windDir_frcst = new Array(7);
  app.humedad_frcst = new Array(7);
  app.icono_frcst = new Array(7);

  for(var i=0;i<7;i++){
    app.fecha_frcst[i] = new Date (app.datos_frcst.list[i].dt * 1000);
    app.temp_max_frcst[i] = app.datos_frcst.list[i].temp.max;
    app.temp_max_frcst[i] = (parseInt(app.temp_max_frcst[i])).toString();
    app.temp_min_frcst[i] = app.datos_frcst.list[i].temp.min;
    app.temp_min_frcst[i] = (parseInt(app.temp_min_frcst[i])).toString();

    app.windSpeed_frcst[i] = app.datos_frcst.list[i].speed;
    app.windSpeed_frcst[i] = (parseInt(app.windSpeed_frcst[i])).toString();

    app.windDir_frcst[i] = app.datos_frcst.list[i].deg;
    app.windDir_frcst[i] = (parseInt(app.windDir_frcst[i])).toString();

    app.humedad_frcst[i] = app.datos_frcst.list[i].humidity;
    //var condicionIcono = app.datos.weather[0].icon;
    app.icono_frcst[i] = "http://openweathermap.org/img/w/"+app.datos_frcst.list[i].weather[0].icon+".png";
  //app.obtenIcono(condicionIcono);
  }
  app.muestra_frcst();
}

app.muestra = function() {
//  var archivoFlecha=determinaFlechaViento();
  $('#portada').attr("src",app.portada);

  $('#temp_big').html(app.temperatura + " ºC");

  //$('#flechaWind').attr("src",archivoFlecha);
  //$('#flechaWind').attr("src","images/flechaN.png");
  var funcionRotar = "rotate(" + (parseInt(app.windDir) + 180).toString() + "deg)";
  $('#flechaWind').css("transform",funcionRotar);
  $('#flechaWind').css("msTransform",funcionRotar);
  $('#flechaWind').css("WebkitTransform",funcionRotar);
  $('#js_w_munic').html(app.municipio);
  $('#js_w_icon').attr("src",app.icono);
  $('#js_w_temp_icon').attr("src",iconoTemp);
  $('#js_w_temp').html(app.temperatura + " ºC");
  $('#js_w_wind_Icon').attr("src",iconoWind);
  $('#js_w_windS').html(app.windSpeed + " m/s");
  $('#js_w_windD').html(app.windDir + " º");
  $('#js_w_humedad').html(app.humedad + " %");
  $('#js_w_humedad_Icon').attr("src",iconoHumedad);
}
//
// app.muestra_frcst2 = function() {
//   for (i=0;i<7;i++){
//     var j = i.toString();
//     $('#dia_sem_frcst_'+j).html(getDiaSemana(app.fecha_frcst[i].getDay()) + " ");
//     $('#dia_mes_frcst_'+j).html(app.fecha_frcst[i].getDate() + " ");
//     $('#mes_frcst_'+j).html(getMes(app.fecha_frcst[i].getMonth()));
//     $('#icon_frcst_'+j).attr("src",app.icono_frcst[i]);
//     $('#tmp_frcst_max_'+j).html(app.temp_max_frcst[i] + " ºC");
//     $('#tmp_frcst_min_'+j).html(app.temp_min_frcst[i] + " ºC");
//     $('#wind_frcst_vel_'+j).html(app.windSpeed_frcst[i] + " m/s");
//     $('#wind_frcst_dir_'+j).html(app.windDir_frcst[i] + " º");
//     $('#humedad_frcst_'+j).html(app.humedad_frcst[i] + " %");
//   }
// }

app.muestra_frcst = function() {
  //$('#contenido').load("section_forecast.html");
  $('#contenido').html("");
  $('#contenido').css("height","auto");
  $('#contenido').attr("title","forecast");

  var txt = "<div class='section_forecast'>";
  for (i=0;i<7;i++){
    var j = i.toString();
    txt = txt +
      "<div class='Dia' id='dia_" + i + "'>" +
        "<div class='cabecera_frcst'>" +
          "<span id='dia_sem_frcst_" + i + "'>" + getDiaSemana(app.fecha_frcst[i].getDay()) + " </span>" +
          "<span id='dia_mes_frcst_" + i + "'>" + app.fecha_frcst[i].getDate() + " </span>" +
          "<span id='mes_frcst_" + i + "'>" + getMes(app.fecha_frcst[i].getMonth()) + "</span>" +
        "</div>" +
        "<div class='icon_frcst'>" +
          "<img id='icon_frcst_" + i + "' src='" + app.icono_frcst[i] + "'>" +
        "</div>" +
        "<div class='tmp_frcst'>" +
          "<p class= 'tmp_frcst_max' id='tmp_frcst_max_" + i + "'>" + app.temp_max_frcst[i] + " ºC</p>" +
          "<p class= 'tmp_frcst_min' id='tmp_frcst_min_" + i + "'>" + app.temp_min_frcst[i] + " ºC</p>" +
        "</div>" +
        "<div class='wind_frcst'>" +
            "<p class= 'wind_frcst_vel' id='wind_frcst_vel_" + i + "'>" + app.windSpeed_frcst[i] + " m/s</p>" +
            "<p class= 'wind_frcst_dir' id='wind_frcst_dir_" + i + "'>" + app.windDir_frcst[i] + " º</p>" +
        "</div>" +
        "<div class='humedad_frcst'>" +
          "<span id='humedad_frcst_" + i + "'>" + app.humedad_frcst[i] + " %</span>" +
        "</div>" +
      "</div>";
  }
  txt = txt + "</div>";
  $('#contenido').append(txt);
}

function getDiaSemana(diaEN){
  var diaES = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  return diaES[diaEN];
}

function getMes(mesNum){
  var mes = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return mes[mesNum];
}

function crearMapa(){
  latlon = new google.maps.LatLng(latitud, longitud)
  // mapholder = document.getElementById('contenido')
  // mapholder.style.height = '250px';
  $('#contenido').css("height","500px");
  $('#contenido').attr("title","mapa");

  var myOptions = {
    center:latlon,zoom:8,
    mapTypeId:google.maps.MapTypeId.ROADMAP,
    mapTypeControl:false,
    navigationControlOptions:{style:google.maps.NavigationControlStyle.SMALL}
  }

  var map = new google.maps.Map(document.getElementById("contenido"), myOptions);
  var marker = new google.maps.Marker({
    position:latlon,
    map:map,
    draggable:true,
    title:"You are here!"
  });
  // map.addListener('click', function(e) {
  //   var coordenadas = e.latLng;
  //   latitud = coordenadas.lat();
  //   longitud = coordenadas.lng();
  //   app.cargaDatos();
  // });

  marker.addListener('dragend', function(){
    var coordenadas = this.getPosition();
    latitud = coordenadas.lat();
    longitud = coordenadas.lng();
    app.cargaDatos();
  });

}
