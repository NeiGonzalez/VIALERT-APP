# **ViAlert-APP**

**REPORTE GEOLOCALIZADO DE EMERGENCIAS EN CONTEXTOS DE CONECTIVIDAD LIMITADA**

**Proyecto presentado a CoderCUP IA 2026**

**Autora: Patricia G. González (Nei González)**

**Demo:** https://neigonzalez.github.io/VIALERT-APP/

## 1. PROBLEMA Y PROPUESTA

### 1.1 Contexto

**ViAlert-APP** es un MVP web orientado al reporte temprano de accidentes e incendios, especialmente pensado para rutas, áreas rurales y grandes extensiones territoriales con cobertura móvil intermitente o inexistente.

En Argentina existen enormes extensiones donde pueden recorrerse decenas o incluso cientos de kilómetros con conectividad limitada. En Patagonia esta situación se combina con largas distancias, baja densidad poblacional y condiciones climáticas que pueden volver las rutas especialmente peligrosas.

Durante el invierno, el hielo y la nieve pueden provocar despistes o accidentes en lugares sin cobertura. En esas circunstancias, el aviso puede depender de que otra persona encuentre el vehículo, continúe hasta recuperar señal y recién entonces consiga comunicar la emergencia.

Una situación similar puede producirse ante un incendio rural o forestal. Una persona puede observar humo o fuego en un área aislada sin disponer en ese momento de conexión para reportarlo.

### 1.2 Origen de la problemática

El problema abordado por **ViAlert-APP** surge también del conocimiento directo de los contextos territoriales para los que fue pensado.

Su autora reside actualmente en la Comarca Andina, en la provincia de Chubut, una región donde los incendios forestales, las condiciones invernales de las rutas, las grandes distancias y los sectores con conectividad limitada forman parte de riesgos concretos del territorio.

También residió durante años en la zona serrana de Córdoba, donde los incendios rurales y forestales alcanzan periódicamente grandes extensiones y donde las características de las rutas y caminos serranos presentan riesgos propios ante accidentes y emergencias.

Estas experiencias permitieron identificar una dificultad común a territorios geográficamente diferentes: la posibilidad de presenciar una emergencia en un lugar donde la comunicación inmediata no está garantizada.

El proyecto parte de situaciones y condiciones territoriales conocidas directamente por su autora y no de escenarios hipotéticos construidos exclusivamente para el desarrollo del MVP.

### 1.3 Registro y transmisión

**ViAlert-APP** parte de la premisa de no perder la información disponible en el lugar y momento en que una persona presencia una emergencia solamente porque todavía no existe conexión para transmitirla.

El sistema separa dos acciones que habitualmente se producen juntas:

<div align="center">

**REGISTRAR → TRANSMITIR**

</div>

El incidente puede registrarse cuando ocurre. La aplicación conserva localmente información como tipo de emergencia, geoposición, fecha, hora, descripción y evidencia. Cuando existe una vía de comunicación disponible, esa información puede ser transmitida.

La ausencia temporal de Internet no impide registrar el incidente.

### 1.4 Información asociada al hecho

El registro inmediato puede tener además otro valor. En situaciones con víctimas o en hechos que posteriormente sean objeto de una investigación, la información capturada cerca del momento del incidente podría resultar relevante.

Una implementación productiva podría preservar fotografías, audios, geoposición, fecha, hora y otros metadatos mediante mecanismos que garanticen integridad, trazabilidad e inalterabilidad.

Bajo esas condiciones, determinados registros podrían constituir evidencia potencialmente útil para una investigación judicial. Esta capacidad no forma parte del MVP actual y requeriría una arquitectura específica para preservar adecuadamente la información.

## 2. EL MVP

### 2.1 Funcionalidades

**ViAlert-APP** cuenta actualmente con las siguientes funcionalidades:

* Reporte de incendios y accidentes
* Geolocalización del incidente
* Persistencia local de reportes
* Funcionamiento ante pérdida de conectividad
* Envío al recuperar conexión
* Descripción escrita
* Dictado de descripción por voz en navegadores compatibles
##### Grabación de audio

* Incorporación de fotografías
* Historial de reportes
* Visualización de incidentes sobre mapa
* Confirmación ciudadana mediante “Yo también lo veo”
* Simulación de conectividad satelital
* Paneles demostrativos para organismos de emergencia
Los eventos precargados en el mapa y los accesos institucionales utilizan datos de demostración para representar el funcionamiento del sistema.

### 2.2 UX/UI y accesibilidad

El diseño de **ViAlert-APP** parte de un contexto de uso particular. La interacción puede producirse durante una situación de emergencia y bajo un nivel elevado de estrés. Esto condicionó las decisiones de UX/UI del MVP.

La interfaz prioriza una baja carga cognitiva, legibilidad y rapidez de interacción. Se utilizaron tipografías de tamaño fácilmente legible, alto contraste entre fondo, textos y controles, botones de dimensiones adecuadas para interacción táctil y una jerarquía visual que permite identificar rápidamente las acciones principales.

El flujo de reporte busca reducir la cantidad de decisiones y acciones necesarias para completar una operación. Las opciones se presentan progresivamente y se prioriza la información indispensable para generar el reporte.

También se incorporaron diferentes modalidades de entrada para reducir la dependencia del teclado:

* Ingreso de texto
##### Dictado por voz

##### Grabación de audio

* Captura o incorporación de fotografías
* Geolocalización automática
Estas alternativas contemplan situaciones en las que el usuario puede estar nervioso, accidentado, utilizando una sola mano, con poca iluminación, sin sus anteojos o con dificultades para escribir.

La interfaz es responsive y fue desarrollada con prioridad de uso en dispositivos móviles, aunque mantiene su funcionalidad en diferentes tamaños de pantalla.

La versión actual está optimizada principalmente para Google Chrome. El reconocimiento de voz depende actualmente de tecnologías disponibles en el navegador y no presenta un soporte homogéneo entre plataformas. Una versión productiva debería desacoplar esta funcionalidad del navegador para ofrecer un comportamiento consistente.

### 2.3 Conectividad y persistencia

El concepto central del proyecto establece que registrar una emergencia y transmitirla no necesariamente tienen que ocurrir al mismo tiempo.

Si existe conectividad, el reporte puede enviarse inmediatamente.

Si no existe, puede conservarse localmente hasta recuperar conexión.

Una evolución productiva debería incorporar una cola persistente con estados diferenciados:

<div align="center">

**REGISTRADO → PENDIENTE DE TRANSMISIÓN → TRANSMITIDO → RECIBIDO POR EMERGENCIAS**

</div>

También debería establecer prioridades de transmisión. Ante una conexión extremadamente breve o inestable, los primeros datos enviados deberían ser:

TIPO DE EMERGENCIA + COORDENADAS + FECHA Y HORA + IDENTIFICADOR

La descripción, el audio, las fotografías y otros archivos de mayor tamaño podrían transmitirse posteriormente.

Este mecanismo permitiría aprovechar incluso ventanas muy breves de conectividad para comunicar primero la información indispensable para localizar y clasificar una emergencia.

### 2.4 Gestión y seguimiento de reportes

El reporte generado por el usuario constituye el inicio de un circuito de información que continúa en las interfaces destinadas a los organismos de emergencia.

En el MVP, los paneles demostrativos de Policía y Bomberos representan el entorno desde el cual los organismos receptores pueden visualizar los incidentes reportados y acceder a la información asociada, como tipo de evento, geoposición, fecha, hora, descripción y evidencia disponible. Actualmente estos paneles tienen carácter demostrativo.

En una implementación productiva, una vez transmitido, el reporte ingresaría a un sistema centralizado que permitiría clasificarlo, establecer su prioridad, determinar la jurisdicción correspondiente, derivarlo al organismo responsable y administrar su estado durante el ciclo de atención.

<div align="center">

**REPORTE RECIBIDO → CLASIFICACIÓN → PRIORIZACIÓN → DERIVACIÓN → ATENCIÓN → RESOLUCIÓN → CIERRE**

</div>

La prioridad podría establecerse a partir del tipo de emergencia, ubicación, información disponible, existencia de personas potencialmente afectadas y confirmaciones realizadas por otros usuarios. Los reportes correspondientes a un mismo evento podrían agruparse para evitar que distintas observaciones generen incidentes independientes.

El organismo receptor podría actualizar el estado del reporte durante su tratamiento y distinguir entre incidentes nuevos, recibidos, en proceso de atención, resueltos y cerrados.

La visibilidad del incidente en el mapa ciudadano sería independiente de su estado operativo. En el caso de los accidentes, se prevé que los reportes que permanezcan sin actualización durante 48 horas dejen de visualizarse automáticamente en el mapa. Esta lógica permitiría evitar la acumulación de incidentes que probablemente ya no se encuentren vigentes y mantener la información visual relevante para el usuario.

Que un accidente deje de mostrarse en el mapa no significa que el caso haya sido cerrado, resuelto o eliminado. El organismo interviniente mantendría su propio ciclo de gestión y sería responsable de determinar el estado operativo del incidente.

La permanencia de los incendios en el mapa respondería a una lógica diferente, vinculada con la naturaleza y evolución del evento, y no a la regla prevista para accidentes.

Los reportes cerrados podrían conservarse en el sistema de acuerdo con las políticas de trazabilidad, auditoría, seguridad y retención de información definidas para una implementación productiva.

### 2.5 Uso de la aplicación y perfiles de acceso

**ViAlert-APP** contempla dos tipos principales de usuario dentro del flujo del sistema: el ciudadano que genera el reporte y los organismos que reciben y gestionan la información. En el MVP, estos últimos están representados mediante perfiles demostrativos de Policía y Bomberos.

Los distintos perfiles permiten mostrar el recorrido de la información desde que se registra una emergencia hasta su recepción por parte del organismo correspondiente.

<div align="center">

**USUARIO → REPORTE → TRANSMISIÓN → ORGANISMO RECEPTOR**

</div>

2.5.1 Perfil ciudadano

El perfil ciudadano está orientado a cualquier persona que necesite reportar un accidente o incendio.

El usuario realiza un registro inicial con sus datos básicos. Esta información queda almacenada localmente para evitar que deba volver a ingresarla durante una situación de emergencia.

Una vez registrado, puede acceder a las funcionalidades principales de **ViAlert-APP**.

Desde este perfil puede:

* Registrar accidentes e incendios
* Consultar sus reportes
* Visualizar incidentes activos en el mapa
* Consultar información de los eventos
* Confirmar determinados incidentes mediante “Yo también lo veo”
##### Pantalla principal

La pantalla principal concentra los accesos a las funciones principales de la aplicación y permite iniciar rápidamente un nuevo reporte.

Desde allí el usuario puede acceder al reporte de emergencias, al mapa y a sus reportes registrados.

La organización de esta pantalla responde al criterio general de UX/UI del proyecto: reducir la cantidad de decisiones necesarias y facilitar la identificación de las acciones principales en una situación de estrés.

##### Reportar una emergencia

Al ingresar en **Reportar emergencia**, el usuario selecciona el tipo de evento que desea informar, actualmente **Accidente** o **Incendio**.

A partir de esa selección comienza el registro de la información asociada al incidente.

La aplicación permite incorporar la descripción y evidencia mediante diferentes modalidades, de manera que el reporte no dependa exclusivamente de la escritura con teclado.

##### Descripción mediante teclado

El usuario puede escribir una descripción del incidente utilizando el teclado del dispositivo.

Esto permite incorporar cualquier información que considere relevante sobre lo que está observando o sobre las circunstancias del evento.

##### Dictado por voz

La descripción también puede ingresarse mediante dictado por voz.

Al activar esta función, la aplicación reconoce la voz del usuario y la convierte en texto dentro del campo de descripción. El resultado es, por lo tanto, un reporte escrito, pero sin necesidad de utilizar el teclado.

Esta alternativa fue incorporada especialmente para situaciones en las que escribir puede resultar difícil por estrés, condiciones ambientales, dificultades visuales o imposibilidad de utilizar ambas manos.

El reconocimiento de voz funciona actualmente en navegadores compatibles. El MVP está optimizado principalmente para Google Chrome debido a las diferencias de soporte de esta tecnología entre navegadores.

##### Grabación de audio

Además del dictado, el usuario puede realizar una grabación de voz.

Esta función es diferente del dictado. El dictado transforma la voz en texto, mientras que la grabación conserva el audio y lo incorpora como información asociada al reporte.

De esta manera, una persona puede aportar una explicación verbal cuando escribir o dictar un texto no resulte suficiente o conveniente.

##### Fotografía

El reporte permite incorporar una fotografía del incidente.

La imagen queda asociada al evento junto con el resto de la información registrada y puede aportar evidencia visual sobre las características y condiciones existentes en el lugar.

##### Geoposición

La aplicación obtiene la geoposición del dispositivo y la incorpora al reporte.

Esto evita depender de que el usuario conozca una dirección exacta, número de ruta, kilómetro o referencia geográfica precisa, algo especialmente relevante en rutas y áreas rurales.

##### Revisión y envío

Antes de completar el reporte, el usuario puede revisar la información incorporada.

El reporte puede contener:

* Tipo de emergencia
* Geoposición
* Fecha y hora
* Descripción ingresada mediante teclado o dictado
* Grabación de audio
* Fotografía
Una vez confirmado, si existe conectividad el reporte puede transmitirse.

Si no existe conexión, la información queda almacenada localmente hasta que pueda realizarse la transmisión.

Esta separación entre registro y transmisión constituye uno de los conceptos centrales de **ViAlert-APP**.

##### Mis reportes

La sección **Mis reportes** permite al usuario consultar los eventos que registró.

Desde allí puede acceder a la información asociada a cada reporte y verificar los registros realizados desde el dispositivo.

Esta funcionalidad permite mantener una referencia de las emergencias informadas sin depender exclusivamente de su representación en el mapa general.

##### Mapa

El mapa permite visualizar geográficamente los incidentes disponibles en el sistema.

El usuario puede identificar eventos reportados y consultar la información disponible sobre ellos.

En el MVP también se muestran eventos simulados que permiten representar funcionalidades proyectadas, especialmente las relacionadas con incendios y futuras fuentes externas de información.

##### “Yo también lo veo”

Cuando un usuario observa un evento que ya fue reportado, puede utilizar la función **“Yo también lo veo”**.

Esta acción permite incorporar una nueva confirmación desde otra geoposición sin generar necesariamente un incidente independiente.

En una evolución del sistema, múltiples observaciones podrían utilizarse para aumentar la confiabilidad de un reporte y, mediante procesamiento geoespacial, contribuir a estimar o delimitar mejor el área probable de un incidente.

2.5.2 Perfiles de organismos de emergencia

El MVP incorpora perfiles específicos para representar el otro extremo del circuito de **ViAlert-APP**: la recepción de la información por parte de los organismos responsables de intervenir.

Actualmente se incluyen accesos demostrativos para Policía y Bomberos.

Estos perfiles no representan una integración real con organismos oficiales. Su función dentro del MVP es demostrar cómo la información generada por un ciudadano puede continuar dentro del sistema después de ser transmitida.

<div align="center">

**QUIEN REPORTA → QUIEN RECIBE Y GESTIONA**

</div>

##### Acceso a los perfiles institucionales

El ingreso a los perfiles de Policía y Bomberos se realiza mediante códigos de acceso demostrativos.

Estos códigos se encuentran deliberadamente visibles para facilitar la evaluación y prueba del MVP.

No constituyen credenciales de seguridad reales ni deben interpretarse como el mecanismo de autenticación previsto para una implementación productiva.

En una versión operativa deberían reemplazarse por autenticación institucional segura, gestión de usuarios, roles y permisos, cifrado, auditoría y trazabilidad de accesos.

##### Perfil Policía

El perfil Policía permite representar la recepción de los reportes correspondientes a eventos que podrían requerir intervención policial.

Desde su interfaz puede visualizarse la información transmitida desde el reporte ciudadano y acceder a los datos asociados al incidente.

Esto permite comprobar dentro del propio MVP que la información ingresada por el ciudadano no termina en la pantalla de envío, sino que puede reflejarse en una interfaz destinada al organismo receptor.

En una implementación productiva, este entorno permitiría gestionar aspectos como:

* Recepción de nuevos incidentes
* Identificación de ubicación y jurisdicción
* Clasificación del evento
* Priorización
* Consulta de descripción y evidencia asociada
* Actualización del estado operativo
* Seguimiento del incidente
* Resolución y cierre
* Consulta posterior del registro cuando corresponda
##### Perfil Bomberos

El perfil Bomberos representa el circuito receptor para los eventos correspondientes a su intervención, especialmente incendios.

Desde esta interfaz pueden visualizarse los reportes y la información asociada disponible en el sistema.

En una implementación productiva, el panel podría integrar además:

* Nuevos reportes ciudadanos
* Ubicación del incidente
* Confirmaciones de otros observadores
* Fotografías y audios asociados
* Priorización de eventos
* Estado operativo del incidente
* Agrupación de distintos reportes correspondientes al mismo evento
* Información oficial y geoespacial
* Datos provenientes de sistemas de detección y monitoreo de incendios
* Seguimiento hasta la resolución y cierre del evento
La futura incorporación de fuentes como NASA FIRMS y CONAE permitiría complementar la información generada por los ciudadanos con datos provenientes de sistemas oficiales.

2.5.3 Ciclo de gestión del reporte

Una vez transmitido, el reporte debería ingresar en una implementación productiva a un sistema centralizado que permita gestionar todo su ciclo de vida.

<div align="center">

**RECEPCIÓN → CLASIFICACIÓN → PRIORIZACIÓN → DERIVACIÓN → ATENCIÓN → RESOLUCIÓN → CIERRE**

</div>

La clasificación permitiría determinar qué tipo de emergencia fue reportada.

La geoposición permitiría identificar la jurisdicción correspondiente.

La priorización permitiría establecer la urgencia relativa del incidente a partir de la información disponible.

La derivación permitiría dirigirlo hacia Policía, Bomberos, servicios médicos, Defensa Civil u otro organismo competente.

El organismo receptor sería responsable de actualizar posteriormente el estado operativo hasta la resolución y cierre del incidente.

En una implementación integrada con el sistema 911, el ciudadano no necesitaría determinar qué dependencia debe recibir el reporte. El sistema podría resolver la derivación a partir del tipo de evento, la geoposición y la jurisdicción correspondiente.

2.5.4 Estado operativo y visibilidad en el mapa

El estado de un incidente para los organismos de emergencia es conceptualmente independiente de su visibilidad en el mapa utilizado por los ciudadanos.

En el caso de los accidentes, se prevé que un reporte que permanezca sin actualización durante 48 horas pueda dejar de visualizarse automáticamente en el mapa.

Esta medida permitiría evitar la acumulación de eventos que probablemente ya no se encuentren vigentes y mantener el mapa concentrado en información relevante para el usuario.

La desaparición del accidente del mapa no implica su resolución, cierre ni eliminación del sistema.

El incidente puede continuar abierto dentro del circuito de Policía, 911 u otro organismo interviniente hasta que éste determine su estado y eventual cierre.

Los incendios requieren una lógica diferente debido a su duración y evolución. Por este motivo, no se les aplicaría automáticamente el mismo criterio temporal previsto para los accidentes.

De esta manera, **ViAlert-APP** diferencia tres aspectos de la gestión de la información:

* Visibilidad del evento en el mapa ciudadano
* Estado operativo del incidente para los organismos intervinientes
* Persistencia histórica del registro dentro del sistema
## 3. INCENDIOS Y MONITOREO TERRITORIAL

### 3.1 Detección temprana

En incendios, la rapidez con que se detecta y comunica un foco puede resultar especialmente importante. Un incendio detectado en una etapa inicial presenta un escenario de intervención diferente al de un incendio que ya alcanzó una extensión considerable.

Esta situación tiene particular relevancia en regiones que periódicamente enfrentan incendios forestales o rurales, como la zona cordillerana patagónica, las sierras de Córdoba o las islas del río Paraná.

Los sistemas satelitales constituyen una herramienta fundamental para la detección y monitoreo, pero la observación humana puede aportar información complementaria desde el territorio.

### 3.2 Información satelital

NASA FIRMS distribuye información de incendios activos obtenida mediante sensores como MODIS y VIIRS. Para sus productos globales Near Real Time, NASA informa una disponibilidad generalmente dentro de aproximadamente tres horas desde la observación satelital.

Argentina dispone además de infraestructura de CONAE para focos de calor, áreas quemadas y otros productos geoespaciales, con servicios que poseen diferentes frecuencias de actualización.

**ViAlert-APP** no pretende reemplazar estas fuentes. La propuesta consiste en complementarlas con observaciones humanas geolocalizadas.

Una persona que ya se encuentra en el territorio puede registrar:

* Ubicación
* Fecha y hora
* Descripción
##### Fotografía

* Audio
En una versión desarrollada, los reportes provenientes de NASA FIRMS, CONAE y otras fuentes oficiales podrían incorporarse automáticamente al mapa.

El MVP representa actualmente este concepto mediante incendios simulados que aparecen sobre el mapa. En una implementación productiva, esos datos precargados podrían ser reemplazados por información obtenida de fuentes reales.

### 3.3 Confirmación ciudadana

La función **“Yo también lo veo”** permite que una segunda persona que observa un incidente previamente reportado pueda confirmarlo desde su propia geoposición.

Múltiples observaciones podrían aportar diferentes posiciones, horarios, fotografías y perspectivas del mismo evento. También aumentarían la información disponible para evaluar si distintos reportes corresponden al mismo siniestro.

Las diferentes geoposiciones podrían utilizarse mediante procesamiento geoespacial para estimar o delimitar mejor un área probable del incidente. Esta capacidad no implica identificar necesariamente un punto exacto. Su precisión dependería de la información disponible, de la ubicación de los observadores y del tipo de evento reportado.

En incendios, esta información podría ser particularmente útil cuando el humo o las llamas son observados a distancia desde distintos puntos.

## 4. ARQUITECTURA PROYECTADA

### 4.1 Integración con organismos

El MVP no se encuentra actualmente conectado con organismos oficiales. La arquitectura proyectada contempla la integración con 911, Policía, Bomberos, Defensa Civil, servicios médicos de emergencia, brigadas y sistemas provinciales o nacionales de manejo del fuego. También contempla la incorporación de fuentes oficiales de información satelital y geoespacial.

La geoposición y clasificación del incidente permitirían establecer la jurisdicción correspondiente y canalizar el reporte hacia el organismo responsable.

<div align="center">

**REPORTE → GEOPOSICIÓN → CLASIFICACIÓN → JURISDICCIÓN → CENTRAL CORRESPONDIENTE → ORGANISMO OPERATIVO**

</div>

De esta manera, la persona que reporta no necesitaría conocer qué cuartel, comisaría, brigada o dependencia tiene jurisdicción en el lugar, ni recordar o buscar números telefónicos durante una situación de estrés.

### 4.2 Conectividad satelital

El MVP incluye una simulación de Starlink Direct to Cell para representar una posible evolución del sistema.

Esta capacidad tiene particular interés en territorios extensos sin infraestructura terrestre, donde se encuentra uno de los problemas que dieron origen al proyecto.

Una implementación real no debería depender exclusivamente de una tecnología o proveedor. El sistema debería aprovechar el primer canal de comunicación disponible:

* Datos móviles
* WiFi
* Conectividad satelital directa a dispositivos móviles
* Otros canales de contingencia técnicamente disponibles
La utilización efectiva de conectividad satelital dependería de cobertura regional, operadores, dispositivos compatibles, características del servicio y acuerdos institucionales o comerciales.

## 5. EVOLUCIÓN DEL PROYECTO

### 5.1 Backend y sincronización

Una implementación productiva requeriría un backend centralizado capaz de recibir, validar, almacenar y distribuir reportes.

La transmisión debería incorporar reintentos automáticos, control de duplicados, confirmación efectiva de recepción y sincronización de evidencia multimedia.

### 5.2 Integración de información geoespacial

El mapa podría incorporar información proveniente de NASA FIRMS, CONAE, meteorología, viento, cartografía satelital, rutas y otras fuentes relevantes para interpretar un evento.

La combinación de reportes ciudadanos con fuentes oficiales permitiría construir una representación territorial más completa.

### 5.3 Inteligencia artificial multimodal

Una evolución especialmente relevante se relaciona con situaciones en las que la propia persona afectada tiene dificultades para interactuar con el dispositivo.

Con autorización del usuario, una versión futura podría utilizar información proveniente de voz, fotografías o video para asistir en la construcción automática de un reporte.

La IA podría ayudar a identificar y estructurar información como:

* Posible tipo de incidente
* Vehículos involucrados
* Presencia de humo o fuego
* Cantidad aproximada de personas
##### Geoposición

* Evidencia multimedia disponible
El objetivo sería reducir la cantidad de interacción necesaria para generar información útil cuando el usuario se encuentra en una situación crítica. La evaluación y decisión operativa seguirían correspondiendo a los servicios de emergencia.

### 5.4 Otros eventos de alto riesgo poblacional

La arquitectura podría evolucionar posteriormente para incorporar otros tipos de emergencias que afecten a personas o poblaciones completas.

Entre ellas podrían contemplarse grandes inundaciones, tormentas severas, deslaves en regiones montañosas, viento blanco en zonas de nieve y otros eventos climáticos extremos.

Argentina presenta antecedentes recientes y recurrentes de este tipo de situaciones en regiones muy diferentes, desde inundaciones urbanas de gran magnitud hasta temporales, fenómenos de montaña y eventos severos en zonas rurales.

Esta ampliación no debería transformar **ViAlert-APP** en una aplicación compleja con múltiples funciones difíciles de identificar.

La simplicidad de uso debe mantenerse como una condición de diseño. En situaciones de alto estrés, aumentar las capacidades del sistema no debería aumentar proporcionalmente la cantidad de decisiones, pantallas o acciones necesarias para reportar.

El objetivo seguiría siendo registrar la información esencial mediante la menor cantidad posible de interacciones.

## 6. POSICIONAMIENTO Y ALCANCE

### 6.1 Posicionamiento

Existen actualmente soluciones argentinas para reporte geolocalizado de emergencias y plataformas específicas para monitoreo de incendios.

El diferencial de **ViAlert-APP** no consiste simplemente en permitir enviar una emergencia acompañada por una ubicación.

El proyecto se concentra en registrar y preservar información crítica cuando el incidente ocurre en un lugar donde la conectividad no puede darse por garantizada.

Su propuesta combina captura inmediata, geoposición, persistencia local y transmisión cuando aparece un canal disponible.

En una evolución productiva, esa arquitectura podría complementarse con múltiples canales de conectividad, información satelital, confirmaciones ciudadanas y derivación automática hacia organismos oficiales.

### 6.2 Alcance actual

**ViAlert-APP** es actualmente un MVP / Proof of Concept.

Esta versión implementa las principales funcionalidades y permite validar el flujo de interacción propuesto. No constituye un sistema operativo de emergencias y no sustituye los canales oficiales existentes.

La integración con organismos, la conectividad satelital y determinados datos mostrados en el mapa son simulaciones destinadas a representar el funcionamiento potencial de una implementación futura.

### 6.3 Tecnologías utilizadas

* React
* Vite
* JavaScript
* Leaflet
* OpenStreetMap
* Web Geolocation API
* Web Speech API
* Media APIs del navegador
* LocalStorage
* Git y GitHub
* GitHub Pages
* Desarrollo asistido por Inteligencia Artificial
## 7. DOCUMENTACIÓN

Este README presenta el alcance general, las funcionalidades implementadas y la arquitectura proyectada de **ViAlert-APP**.

La documentación ampliada del proyecto podrá desarrollar con mayor profundidad el análisis del problema, contexto territorial, arquitectura conceptual, análisis competitivo, decisiones de UX/UI, funcionamiento sin conexión, integración institucional, fuentes satelitales, seguridad, limitaciones y posibilidades de evolución.

## 8. AUTORA

Patricia G. González

**Demo de ViAlert-APP:** https://neigonzalez.github.io/VIALERT-APP/

**Repositorio y documentación técnica:** https://github.com/neigonzalez/VIALERT-APP

**Contacto:** neigonzalez.ar@gmail.com

**Video:** https://youtu.be/9HdWCtwOGdM
