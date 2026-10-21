/* =========================================================
   Umbral · Ruta de aprendizaje sobre IA y empresa
   Interacciones de la página (JavaScript sin dependencias)
   ========================================================= */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Almacenamiento local protegido (puede fallar en modo privado)
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  /* ---------- 1. Datos ---------- */
  var DATA = {
    market: { max: 1484, fmt: function (v) { return v.toLocaleString('es-MX'); }, rows: [
      ['Infraestructura', 1484, 'key'], ['Servicios', 576], ['Software', 462], ['Ciberseguridad con IA', 51],
      ['Agentes y asistentes', 29], ['Modelos de IA generativa', 28], ['Plataformas de ciencia de datos', 26], ['Otros', 13]
    ] },
    region: { max: 285.88, fmt: function (v) { return v.toLocaleString('es-MX', { minimumFractionDigits: 2 }); }, rows: [
      ['Estados Unidos', 285.88, 'key'], ['Europa', 20.92], ['China', 12.41]
    ] },
    jobs: { max: 170, fmt: function (v) { return v + ' M'; }, rows: [
      ['Empleos creados', 170, 'key'], ['Empleos desplazados', 92, 'hi'], ['Saldo neto', 78]
    ] },
    skills: { max: 100, fmt: function (v) { return v + ' %'; }, rows: [
      ['Universitarios mexicanos que ya usan IA generativa', 80, 'key'],
      ['Empleadores que ven la brecha de habilidades como su principal obstáculo', 63],
      ['Estudiantes que sienten que no saben suficiente de IA', 58],
      ['Habilidades clave que cambiarán hacia 2030', 40],
      ['Empleadores que califican como excelente la evaluación crítica de la IA de los egresados', 8, 'hi'],
      ['Egresados que cursaron una materia universitaria de IA', 3, 'hi']
    ] },
    ilia: { max: 100, fmt: function (v) { return v.toFixed(2); }, rows: [
      ['Colombia', 55.84], ['Costa Rica', 53.83], ['Argentina', 52.98], ['Perú', 51.93], ['México', 47.03, 'hi']
    ] },
    expect: { max: 50, fmt: function (v) { return v + ' %'; }, rows: [
      ['Esperaban reducir personal', 32, 'key'], ['Lo hicieron realmente', 14, 'hi']
    ] }
  };

  var GLOSSARY = {
    'subrayadas': ['Términos del glosario', 'Así se ven los términos con definición. Tócalos para leerla; el glosario completo está en el botón Glosario del encabezado.'],
    'ia-generativa': ['IA generativa', 'IA que produce contenido nuevo (texto, imágenes, código) a partir de instrucciones, como los asistentes de chat.'],
    'escalar': ['Escalar', 'Pasar de un uso aislado o piloto a un uso integrado en varios procesos o en toda la empresa.'],
    'agente': ['Agente de IA', 'Sistema de IA que ejecuta tareas de varios pasos con cierta autonomía: consulta datos, decide y actúa, por ejemplo enviando un correo o registrando un pago.'],
    'ebit': ['EBIT', 'Utilidad antes de intereses e impuestos. Mide la ganancia que genera la operación del negocio.'],
    'flujo': ['Flujo de trabajo', 'Secuencia de pasos, responsables y aprobaciones con la que se completa un proceso, como ir de la cotización a la factura.'],
    'prima': ['Prima salarial', 'Diferencia de salario que reciben quienes tienen cierta habilidad frente a quienes no la tienen en puestos comparables.'],
    'ilia': ['ILIA', 'Índice Latinoamericano de Inteligencia Artificial, elaborado por la CEPAL y el CENIA. Califica de 0 a 100 el avance relativo de cada país en factores habilitantes, investigación y adopción, y gobernanza.'],
    'petaflops': ['Petaflops', 'Unidad de capacidad de cómputo: mil billones de operaciones de punto flotante por segundo.'],
    'alucinacion': ['Alucinación', 'Respuesta de una IA que suena segura pero es falsa o inventada.'],
    'gobernanza': ['Gobernanza de IA', 'Políticas, responsables y controles que definen cómo se usa la IA en una organización.'],
    'pyme': ['Pyme', 'Pequeña y mediana empresa.'],
    'id': ['I+D', 'Investigación y desarrollo: gasto destinado a generar conocimiento y nuevas tecnologías, medido como porcentaje del PIB.'],
    'prompt': ['Prompt', 'Instrucción que se le da a un modelo de IA para que realice una tarea.'],
    'piloto': ['Piloto', 'Prueba controlada de una tecnología con un grupo reducido antes de extenderla a toda la organización.']
  };

  var ROLES = [
    { n: 'Capturista de datos', r: 'high', rl: 'Muy alta', m: 92,
      auto: ['Captura manual de facturas y formularios', 'Validación repetitiva de datos'],
      human: ['Supervisar excepciones', 'Cuidar la calidad de los datos'],
      t: 'Está entre los puestos con mayor caída proyectada hacia 2030 (Foro Económico Mundial, 2025).' },
    { n: 'Auxiliar contable y de nómina', r: 'high', rl: 'Alta', m: 78,
      auto: ['Captura de pólizas', 'Conciliación bancaria', 'Clasificación de gastos y cálculo de nómina'],
      human: ['Resolver discrepancias', 'Atender requerimientos de auditoría'],
      t: 'Los auxiliares contables, de teneduría y de nómina figuran entre los puestos que más disminuirán (Foro Económico Mundial, 2025).' },
    { n: 'Atención a clientes', r: 'high', rl: 'Alta', m: 70,
      auto: ['Respuestas a preguntas frecuentes', 'Seguimiento de pedidos'],
      human: ['Casos complejos y quejas', 'Empatía y negociación'],
      t: 'Los chatbots son la herramienta de IA más escalada, en 47 % de las empresas (McKinsey, 2026). El caso Klarna muestra que el cliente sigue necesitando acceso a una persona.' },
    { n: 'Contador', r: 'mid', rl: 'Media', m: 50,
      auto: ['Borradores de reportes', 'Revisión preliminar de documentos'],
      human: ['Interpretar y asesorar', 'Firmar y asumir la responsabilidad legal'],
      t: 'Se transforma más de lo que desaparece: la IA prepara y el contador valida, interpreta y firma.' },
    { n: 'Recursos humanos', r: 'mid', rl: 'Media', m: 50,
      auto: ['Filtrado inicial de currículums', 'Preguntas frecuentes de empleados', 'Agendas de entrevistas'],
      human: ['Entrevistas y decisiones de contratación', 'Clima laboral y conflictos'],
      t: 'Gartner proyecta que 50 % de las tareas de RR. HH. se automatizará hacia 2030; aun así, el impacto de la IA tiene 5.7 veces más probabilidad de cambiar responsabilidades y 3 veces más de crear puestos que de eliminarlos (SHRM, 2026).' },
    { n: 'Analista de inteligencia de negocios', r: 'low', rl: 'Crece', m: 25,
      auto: ['Consultas y limpieza de datos', 'Primeros borradores de tableros'],
      human: ['Definir la pregunta de negocio', 'Interpretar y comunicar hallazgos'],
      t: 'Está entre los puestos de mayor crecimiento hacia 2030 (Foro Económico Mundial, 2025).' }
  ];

  var CHECKS = [
    ['Procesos digitalizados', 'Ventas, facturación e inventario están en formato digital.'],
    ['Un proceso elegido', 'Hay al menos un proceso concreto para aplicar IA, con una métrica definida.'],
    ['Política de datos', 'Está definido qué información puede entrar a herramientas de IA.'],
    ['Supervisión humana', 'Se sabe quién revisa y aprueba lo que produce la IA antes de que llegue a clientes.'],
    ['Capacitación', 'El personal sabe usar la IA con criterio y verificar sus resultados.'],
    ['IA ya incluida', 'Se aprovechan las funciones de IA del software que ya se paga.'],
    ['Medición', 'Se compara el resultado antes y después: tiempo, errores, ventas.'],
    ['Herramientas autorizadas', 'Las herramientas no autorizadas están identificadas o prohibidas.']
  ];

  var FIELDS = [
    ['R', 'Rol', '¿Quién debe ser la IA?', 'Actúa como…', 'Actúa como consultor en procesos administrativos para pymes.', ''],
    ['C', 'Contexto', 'Situación y antecedentes', 'Trabajo en… / Tenemos…', 'Trabajo en una distribuidora con 25 empleados; la cobranza se lleva en Excel y la cartera vencida va en aumento.', 'Contexto: '],
    ['T', 'Tarea', 'Qué debe hacer, con un verbo', 'Propón… / Analiza… / Redacta…', 'Propón cómo usar IA para reducir la cartera vencida en los próximos tres meses.', 'Tarea: '],
    ['F', 'Formato', 'Cómo debe entregarlo', 'Una tabla con… / Máximo 300 palabras…', 'Una tabla con acción, herramienta, costo aproximado y responsable, seguida de tres pasos para empezar esta semana.', 'Formato de respuesta: '],
    ['A', 'Audiencia', 'Para quién y con qué tono', 'Para el director… tono…', 'Para el dueño de la empresa, sin conocimientos técnicos; tono claro y directo.', 'Audiencia y tono: '],
    ['Rs', 'Restricciones', 'Límites a respetar', 'No incluyas… / Presupuesto máximo…', 'Presupuesto máximo de 1,000 pesos al mes; no compartir datos personales de clientes con herramientas externas.', 'Restricciones: '],
    ['Q', 'Calidad', 'Cómo saber que quedó bien', 'Cita fuentes… / Señala supuestos…', 'Indica la fuente de cualquier dato y señala qué supuestos debo verificar antes de decidir.', 'Criterios de calidad: ']
  ];

  var QUIZ = [
    { q: '¿Qué porcentaje de las organizaciones usaba IA en al menos una función en 2025?', o: ['37 %', '55 %', '88 %', '44 %'], a: 2,
      e: 'Según Stanford HAI (2026), 88 % usaba IA en 2025, frente a 55 % en 2023. El 37 % corresponde a las que ven impacto en utilidades.' },
    { q: '¿Por qué el 48 % y el 4.8 % de adopción en México no se contradicen?', o: ['Porque uno de los dos estudios está mal hecho', 'Porque miden periodos, universos, definiciones y métodos distintos', 'Porque uno se refiere a otro país', 'Porque el 4.8 % es un error de redondeo'], a: 1,
      e: 'La encuesta mide cualquier uso en 2026 en todas las empresas; el censo mide IA integrada en 2023 solo en manufactura con más de 10 empleados.' },
    { q: '¿Qué distingue a las empresas que sí obtienen utilidades de la IA?', o: ['Compran más licencias', 'Contratan más programadores', 'Rediseñan sus flujos de trabajo completos', 'Usan el modelo más caro'], a: 2,
      e: 'Casi tres cuartas partes de las empresas de alto desempeño rediseñaron sus flujos de trabajo, frente a una cuarta parte del resto (McKinsey, 2026).' },
    { q: '¿Qué mide realmente el dato de alucinaciones de 22 % a 94 %?', o: ['El porcentaje de respuestas falsas en general', 'Con qué frecuencia el modelo inventa una respuesta cuando no la sabe', 'Los errores de ortografía de la IA', 'Las fallas técnicas del servidor'], a: 1,
      e: 'La prueba AA-Omniscience mide exceso de confianza: inventar en lugar de abstenerse ante preguntas difíciles. En tareas acotadas la tasa puede ser menor a 1 %.' },
    { q: '¿Cuál es la principal brecha de México en el Índice Latinoamericano de IA?', o: ['El tamaño de su economía', 'El número de habitantes', 'El talento humano y la inversión en investigación', 'La falta de internet en las ciudades'], a: 2,
      e: 'México obtuvo 37.67 puntos en talento (Chile, 66.75) e invierte 0.27 % del PIB en I+D (Brasil, 1.15 %).' },
    { q: 'Según el Foro Económico Mundial, ¿cuál es el saldo neto de empleos hacia 2030?', o: ['−92 millones', '+78 millones', '+170 millones', 'Sin cambio'], a: 1,
      e: 'Se crearían 170 millones de empleos y se desplazarían 92 millones: un saldo neto de +78 millones.' },
    { q: '¿Cómo mejorarías el prompt “hazme la MEJOR página web”?', o: ['Escribiéndolo todo en mayúsculas', 'Sustituyendo “la mejor” por criterios verificables: audiencia, secciones, tecnología y requisitos', 'Pidiéndolo varias veces hasta que salga bien', 'Agregando “por favor”'], a: 1,
      e: 'Los adjetivos no medibles no orientan a la IA. Definir audiencia, contenido, formato y criterios de aceptación sí lo hace.' }
  ];

  var LOG = [
    { t: "Investigación inicial con rol", p: "actua como un investigador especializado en tecnologia y negocios. Estoy haciendo una investigacion universitaria sobre como la inteligencia artificial está transformando a las empresas. Organizalo con subtitulos, usa un lenguaje claro y profesional e indica la fuente y el año de cada dato o estadistica.",
      m: "fffffnf", as: "Alta", s: 8.0,
      a: "Rol, propósito, formato y tono son explícitos; la tarea no admite interpretaciones contradictorias.",
      c: "Cubre seis de siete componentes. Faltan delimitaciones: región, periodo, extensión y número mínimo de fuentes.",
      i: "Agregar: “Enfócate en datos de 2024 a 2026, con énfasis en México y América Latina; extensión de 1,500 palabras”." },
    { t: "Corrección del canal de entrega", p: "Escribe la respuesta completa directamente aquí en el chat como texto normal, sin crear documentos ni artefactos. Necesito que todo el contenido quede visible en la conversación",
      m: "hhffhfn", as: "Alta", s: 7.0,
      a: "Instrucción de formato inequívoca y justificada (“que todo quede visible”).",
      c: "Es un prompt de corrección: hereda tarea y contexto. Habría evitado el retrabajo si esta restricción se hubiera incluido en el prompt 1.",
      i: "Incluir las restricciones de entrega desde el primer prompt de la conversación." },
    { t: "Casos de empresas reales", p: "vale, veo que mencionas muchas estadisticas, pero ¿me podrias dar ejemplos de empresas reales que ya esten usando ia y que resultados han tenido?, como regla de aqui en adelante responde directamente en este chat sin crear documentos sin que yo te lo pida",
      m: "hffnhff", as: "Alta", s: 7.5,
      a: "Pide evidencia concreta (empresas reales y resultados) y fija una regla persistente para la conversación.",
      c: "No precisa cuántos casos, de qué sectores o regiones, ni qué tipo de resultado (financiero u operativo).",
      i: "“Dame 5 casos de empresas reales, al menos 2 de América Latina, con un resultado medible y su fuente”." },
    { t: "Brecha de valor", p: "me llamó la atencion que dijeras que mercado libre es de los pocos casos en donde el beneficio supera el costo, en tu primera respuesta mencionaste la brecha de valor, pero no me quedo claro ¿porque si la mayoria de personas dicen que la ia las hace mas productivas, pocas empresas ven mas ganancias ?",
      m: "hffhhhn", as: "Alta", s: 8.5,
      a: "Excelente anclaje: cita dos afirmaciones previas y formula la contradicción que quiere resolver.",
      c: "Hereda formato y tono; no define profundidad ni ejemplos esperados.",
      i: "Añadir “explícalo con una analogía administrativa y un ejemplo numérico sencillo”." },
    { t: "Empleo y puestos administrativos", p: "mencionas que klarna dijo que su asistente hacia el trabajo de 700 empleados, pero luego tuvo que volver a poner a personas, eso me hizo pensar en el empleo de ¿que trabajos estan en mas riesgo de ser reemplazados por la ia y cuales van a crecer ? y ¿que pasa con puestos administrativos como el de un contador o uno de recursos humanos ?",
      m: "hffhhhn", as: "Alta", s: 8.0,
      a: "Transición lógica desde un caso a una pregunta general, con dos puestos concretos que aterrizan la respuesta.",
      c: "No indica horizonte temporal ni región, que cambian sustancialmente las proyecciones de empleo.",
      i: "Precisar “hacia 2030 y en el mercado laboral mexicano”." },
    { t: "Universidades y habilidades", p: "vale ya me quedo claro que puestos crecen y cuales estan en riesgo, pero entonces ¿las universidades estan preparando a los estudiantes para esto?, ¿que habilidades deberian estar enseñando y que tanto pesan las habilidades humanas, como la comunicacion o el pensamiento critico, frente a las tecnicas?, como regla de este chat solo desglosa al final el resumen relacionado a la carrera afin que estoy estudiando sin seguir mencionando consejos de mentor",
      m: "hfffhfn", as: "Media", s: 7.0,
      a: "Las preguntas son claras, pero la regla final es ambigua: no nombra la carrera y “carrera afín” admite varias lecturas.",
      c: "Tres preguntas y una regla en un solo prompt; falta indicar cómo comparar el peso de las habilidades (datos, ranking).",
      i: "Separar la regla: “Regla: cierra cada respuesta con 3 viñetas aplicadas a Informática Administrativa, sin consejos personales”." },
    { t: "México en el ILIA", p: "mencionaste que mexico bajo del sexto al octavo lugar en el indice latinoamericano de ia, por debajo de paises como chile, brasil y uruguay, ¿porque mexico esta mas atrasado si es una de las economias mas grandes de la region?, ¿que estan haciendo diferente esos paises y que le falta a mexico ?",
      m: "hffhhhn", as: "Alta", s: 8.5,
      a: "Pregunta causal y comparativa bien construida: dato de partida, paradoja y dos preguntas de análisis.",
      c: "Podría pedir explícitamente las dimensiones del índice para estructurar la comparación.",
      i: "“Compara por dimensión del índice (talento, infraestructura, I+D, gobernanza)”." },
    { t: "48 % frente a 4.8 % y pymes", p: "primero dijiste que el 48% de las empresas en mexico ya usan ia, pero ahora mencionas que solo el 4.8% de las manufactureras las usa, ¿como explicas tanta diferencia? y pensando en las pymes, ¿una empresa pequeña o mediana realmente puede usar ia?, ¿que herramientas podria usar sin gastar mucho y que le impide poder adoptarla?",
      m: "hffhhfn", as: "Alta", s: 8.5,
      a: "Detecta una inconsistencia aparente y exige explicarla: verificación crítica, una práctica muy valiosa al trabajar con IA.",
      c: "Une dos temas distintos; “sin gastar mucho” es una restricción útil, pero no cuantificada.",
      i: "Definir presupuesto: “herramientas de menos de 500 pesos al mes”." },
    { t: "Riesgos y empresa a 5 años", p: "en tu primera respuesta mencionaste que las alucinaciones de la ia van del 22% al 94% segun el modelo,  si cada vez mas empresas pasan de usar solo ia a integrarla en sus procesos, ¿cuales son los mayores riesgos de depender de ella?, ¿y como crees que seran las empresas dentro de 5 años?",
      m: "hffhhhn", as: "Alta", s: 8.0,
      a: "Buen anclaje en un dato; al retomarlo provocó la aclaración de su significado real.",
      c: "La prospectiva pide opinión (“cómo crees”) sin solicitar que se distinga entre evidencia y especulación.",
      i: "“Distingue lo que respaldan los datos de lo que es proyección”." },
    { t: "Explicación académica formal", p: "con todo lo que investigamos en esta conversacion ahora necesito una explicacion academica sobre como la inteligencia artificial esta transformando a las empresas. Que tenga introduccion, desarrollo con subtitulos y conclusion, con un lenguaje  formal. Integra lo mas importante de todas tus respuestas incluyendo las aclaraciones que hiciste como la del dato de las alucinaciones y la diferenicia entre el 48% y el 4.8% y usa de preferencia fuentes primarias como estudios, organismos e instituciones en lugar de blogs o medios. esta vez no incluyas consejos personales ni secciones para mi  carrera. Responde directamente en el chat",
      m: "hffffff", as: "Alta", s: 9.5,
      a: "Muy preciso: estructura, registro, contenido obligatorio, jerarquía de fuentes, exclusiones y canal de entrega.",
      c: "Prácticamente completo. Solo falta extensión objetivo y estilo de citación.",
      i: "Añadir “entre 1,500 y 2,000 palabras, con citas en formato APA”." },
    { t: "Resumen ejecutivo para director", p: "ahora hazme un resumen ejecutivo de la investigacion pensado para el director de una empresa que tiene poco tiempo, que sea de maximo una pagina con los hallazgos mas importantes, los datos clave y 3 o 4 recomendaciones en particular",
      m: "hffffff", as: "Alta", s: 9.0,
      a: "Audiencia, límite de extensión y contenido mínimo están definidos con claridad.",
      c: "Completo. Podría precisar el giro o tamaño de la empresa para que las recomendaciones sean más específicas.",
      i: "“…para el director de una pyme de servicios en México”." },
    { t: "Explicación para un niño", p: "por ultimo, explicale todo esto a un niño de 10 años, usa palabras sencillas, ejemplos de la vida diaria y analogias faciles de entender, sin tantos numeros",
      m: "hffhffn", as: "Alta", s: 9.0,
      a: "Audiencia muy concreta y restricciones de estilo claras; es un uso ejemplar del patrón de persona de audiencia.",
      c: "No define extensión ni formato (cuento, preguntas y respuestas, lista).",
      i: "“En máximo 300 palabras, como una historia corta”." },
    { t: "Sitio web y logotipo", p: "Necesito que te comportes como un EXPERTO EN DESARROLLO DE PAGINA WEB y me des configuraciones para que se comporte como tal, quiero que con la información ya pedida me hagas la MEJOR pagina web  quiero que sea un diseño empresarial, la pagina deberá verse de manera correcta en todos los dispositivos, en proceso de navegación que sea clara y sencilla, hazme un logo relacionada con la  investigación y me lo des en código HTML",
      m: "fffffnn", as: "Media", s: 6.0,
      a: "La intención general es clara, pero “configuraciones para que se comporte como tal” es ambigua y “la MEJOR” no es verificable.",
      c: "Define rol, contenido, estilo, adaptabilidad y formato, pero no indica audiencia del sitio, secciones, nombre de marca, tecnologías ni criterios de aceptación; además combina tres entregables.",
      i: "Dividir en dos prompts: (1) sitio de una página con secciones X, Y, Z, para directivos, en HTML/CSS sin librerías; (2) logotipo SVG con nombre y concepto definidos." },
    { t: "Código completo en el chat", p: "muéstrame el código HTML COMPLETO aquí en el chat",
      m: "hhffnfn", as: "Alta", s: 8.0,
      a: "Breve e inequívoco; el énfasis en “COMPLETO” evita respuestas recortadas.",
      c: "No especifica si incluir también el archivo del logotipo ni si se desean comentarios en el código.",
      i: "“Muestra el código completo del sitio y del logotipo, en bloques separados y con comentarios por sección”." },
    { t: "Documento PDF de evaluación", p: "Genera un PDF que sumarice todo lo vertido en este chat, agrega un resumen ejecutivo al inicio. Integra en la primer pagina una portada gráfica con mi nombre \"Angel Israel Orozco Cortés\" y el producto que se presenta \"Material para evaluación de unidad Ingeniería de Prompt\". En la sección penúltima integra una bitacora de los prompts expuestos por mi, asi como una evaluación que tu deberás integrar respecto al prompt en cuestión (asertividad de la elaboración del prompt, completitud del prompt ingenierilmente y puntuación 0 a 10 para el prompt en cuanto a mejores prácticas en su diseño). En la última sección, integra la bibliografía que empleaste y referencias en tus respuestas en formato APA 2020",
      m: "hfffhff", as: "Alta", s: 9.0,
      a: "Estructura del documento, orden de secciones, datos exactos de portada y criterios de evaluación están definidos.",
      c: "Muy completo. “APA 2020” requiere inferir que se trata de la 7.ª edición, y no se define la escala de asertividad y completitud ni la extensión.",
      i: "Precisar “APA 7.ª edición” y “asertividad en escala alta/media/baja; máximo 20 páginas”." }
  ];

  /* ---------- 2. Tema claro / oscuro ---------- */
  $('#theme-toggle').addEventListener('click', function () {
    var root = document.documentElement;
    var current = root.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('umbral-theme', next); } catch (e) {}
    toast(next === 'dark' ? 'Tema oscuro activado' : 'Tema claro activado');
  });

  /* ---------- 3. Ruta, progreso y navegación ---------- */
  var modules = $$('section.module');
  var done = store.get('umbral-progress', []);
  var rail = $('#rail');
  var routeMap = $('#route-map');
  $('#total-count').textContent = modules.length;

  modules.forEach(function (sec, i) {
    var n = String(i + 1).padStart(2, '0');
    var a = document.createElement('a');
    a.href = '#' + sec.id;
    a.dataset.target = sec.id;
    a.innerHTML = '<span class="chk" aria-hidden="true"></span><span class="n">' + n + '</span>' + sec.dataset.title;
    rail.appendChild(a);

    var r = document.createElement('a');
    r.href = '#' + sec.id;
    r.dataset.target = sec.id;
    r.innerHTML = '<span class="rn">' + n + '</span><span class="rt">' + sec.dataset.title + '</span>' +
      '<span class="rd">' + sec.dataset.desc + ' · ' + sec.dataset.min + ' min</span><span class="rs">Pendiente</span>';
    routeMap.appendChild(r);
  });

  function paintProgress() {
    $$('[data-target]').forEach(function (a) {
      var isDone = done.indexOf(a.dataset.target) !== -1;
      a.classList.toggle('is-done', isDone);
      var s = $('.rs', a);
      if (s) s.textContent = isDone ? 'Completado' : 'Pendiente';
      var label = a.closest('.rail') ? (isDone ? ' (completado)' : '') : '';
      a.setAttribute('aria-label', a.textContent.replace(/Completado|Pendiente/, '').trim() + label);
    });
    $('#done-count').textContent = done.length;
    var c = 81.68;
    $('.ring-fg').style.strokeDashoffset = String(c - c * (done.length / modules.length));
  }
  paintProgress();

  function markDone(id) {
    if (done.indexOf(id) !== -1) return;
    done.push(id);
    store.set('umbral-progress', done);
    paintProgress();
    if (done.length === modules.length) toast('¡Completaste toda la ruta!');
  }

  function setCurrent(id) {
    $$('#rail a').forEach(function (a) {
      if (a.dataset.target === id) {
        a.setAttribute('aria-current', 'true');
        var left = a.offsetLeft - rail.clientWidth / 2 + a.clientWidth / 2;
        rail.scrollTo({ left: left, behavior: reduceMotion ? 'auto' : 'smooth' });
      } else a.removeAttribute('aria-current');
    });
  }

  if ('IntersectionObserver' in window) {
    var currentObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setCurrent(en.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    modules.forEach(function (m) { currentObs.observe(m); });

    var doneObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { markDone(en.target.closest('section').id); doneObs.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    modules.forEach(function (m) { var t = $('.takeaway', m); if (t) doneObs.observe(t); });
  }

  // Barra de lectura y botón para volver arriba
  var bar = $('#scroll-bar');
  var toTop = $('#to-top');
  function onScroll() {
    var h = document.documentElement;
    var pct = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    bar.style.width = (pct * 100).toFixed(2) + '%';
    toTop.classList.toggle('show', h.scrollTop > 800);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    $('#hero-title').setAttribute('tabindex', '-1');
    $('#hero-title').focus({ preventScroll: true });
  });

  /* ---------- 4. Revelado, contadores y gráficas ---------- */
  function renderChart(ul) {
    var d = DATA[ul.dataset.chart];
    ul.innerHTML = d.rows.map(function (r) {
      var pct = Math.max(0.6, (r[1] / d.max) * 100);
      return '<li><span class="lbl">' + r[0] + '</span><span class="bar"><span class="fill ' + (r[2] || '') +
        '" data-w="' + pct.toFixed(2) + '"></span><span class="v">' + d.fmt(r[1]) + '</span></span></li>';
    }).join('');
  }
  $$('[data-chart]').forEach(renderChart);

  function grow(scope) {
    $$('[data-w]', scope).forEach(function (el) { el.style.width = el.dataset.w + '%'; });
    $$('[data-count]', scope).forEach(countUp);
  }

  function countUp(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    var end = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = end + suffix; return; }
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / 1100);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var growTargets = $$('.reveal, .chart, .split, .panel');
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          grow(en.target);
          revealObs.unobserve(en.target);
        }
      });
    }, { threshold: 0.15 });
    growTargets.forEach(function (el) { revealObs.observe(el); });
  } else {
    growTargets.forEach(function (el) { el.classList.add('is-in'); grow(el); });
  }

  /* ---------- 5. Pestañas accesibles ---------- */
  $$('[role="tablist"]').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    var panels = tabs.map(function (t, i) {
      var id = t.getAttribute('aria-controls');
      if (id) return document.getElementById(id);
      return $$('.panel', list.parentElement)[i];
    });
    function select(i, focus) {
      tabs.forEach(function (t, j) {
        var on = i === j;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        if (panels[j]) { panels[j].hidden = !on; if (on) grow(panels[j]); }
      });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.type = 'button';
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = tabs.length;
        if (k === 'ArrowRight') { e.preventDefault(); select((i + 1) % n, true); }
        if (k === 'ArrowLeft') { e.preventDefault(); select((i - 1 + n) % n, true); }
        if (k === 'Home') { e.preventDefault(); select(0, true); }
        if (k === 'End') { e.preventDefault(); select(n - 1, true); }
      });
    });
  });

  /* ---------- 6. Escalera de valor ---------- */
  var ladderBtns = $$('#ladder > button');
  ladderBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      ladderBtns.forEach(function (o) {
        var open = o === b && o.getAttribute('aria-expanded') !== 'true';
        o.setAttribute('aria-expanded', String(open));
        document.getElementById(o.getAttribute('aria-controls')).hidden = !open;
      });
    });
  });

  /* ---------- 7. Explorador de puestos ---------- */
  var roleList = $('#role-list');
  var roleDetail = $('#role-detail');
  function showRole(i, focus) {
    $$('button', roleList).forEach(function (b, j) {
      b.setAttribute('aria-selected', String(i === j));
      b.tabIndex = i === j ? 0 : -1;
    });
    var r = ROLES[i];
    roleDetail.innerHTML = '<h4>' + r.n + '</h4>' +
      '<span class="risk-chip r-' + r.r + '">Exposición: ' + r.rl + '</span>' +
      '<div class="meter" role="img" aria-label="Nivel de exposición ' + r.rl + '"><i></i></div>' +
      '<div class="role-grid"><div><h5>Lo que la IA puede asumir</h5><ul>' + r.auto.map(li).join('') + '</ul></div>' +
      '<div><h5>Lo que sigue siendo humano</h5><ul>' + r.human.map(li).join('') + '</ul></div></div>' +
      '<p style="margin:20px 0 0">' + r.t + '</p>';
    requestAnimationFrame(function () { requestAnimationFrame(function () { $('.meter i', roleDetail).style.width = r.m + '%'; }); });
    if (focus) $$('button', roleList)[i].focus();
  }
  function li(x) { return '<li>' + x + '</li>'; }
  ROLES.forEach(function (r, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-controls', 'role-detail');
    b.innerHTML = '<span>' + r.n + '</span><span class="risk-chip r-' + r.r + '">' + r.rl + '</span>';
    b.addEventListener('click', function () { showRole(i); });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); showRole((i + 1) % ROLES.length, true); }
      if (e.key === 'ArrowUp') { e.preventDefault(); showRole((i - 1 + ROLES.length) % ROLES.length, true); }
    });
    roleList.appendChild(b);
  });
  showRole(1);

  /* ---------- 8. Distribución del trabajo hoy / 2030 ---------- */
  var YEARS = {
    hoy: { w: [47.5, 22.2, 30.3], l: ['47 %', '22 %', '30 %'], a: 'Hoy: 47 % de las tareas las hacen principalmente personas, 22 % la tecnología y 30 % ambas' },
    '2030': { w: [33.4, 33.3, 33.3], l: ['⅓', '⅓', '⅓'], a: '2030: cerca de un tercio de las tareas para cada categoría' }
  };
  $$('#year-toggle button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('#year-toggle button').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      var y = YEARS[b.dataset.year];
      var segs = $$('#stackbar span');
      segs.forEach(function (s, i) { s.style.width = y.w[i] + '%'; s.textContent = y.l[i]; });
      $('#stackbar').setAttribute('aria-label', y.a);
    });
  });

  /* ---------- 9. Autodiagnóstico ---------- */
  var checksEl = $('#checks');
  var savedChecks = store.get('umbral-checks', []);
  CHECKS.forEach(function (c, i) {
    var id = 'chk-' + i;
    var label = document.createElement('label');
    label.setAttribute('for', id);
    label.innerHTML = '<input type="checkbox" id="' + id + '"' + (savedChecks.indexOf(i) !== -1 ? ' checked' : '') + '>' +
      '<span><strong>' + c[0] + '</strong><small>' + c[1] + '</small></span>';
    checksEl.appendChild(label);
  });
  function evalDiag() {
    var boxes = $$('input', checksEl);
    var on = [];
    boxes.forEach(function (b, i) { if (b.checked) on.push(i); });
    store.set('umbral-checks', on);
    var n = on.length, level, msg;
    if (n <= 2) { level = 'Etapa inicial'; msg = 'Empieza por digitalizar procesos y definir quién es responsable del uso de la IA.'; }
    else if (n <= 5) { level = 'En desarrollo'; msg = 'Hay bases. Elige un proceso con métrica clara y establece reglas de supervisión antes de ampliar.'; }
    else if (n <= 7) { level = 'Avanzada'; msg = 'La empresa está cerca de capturar valor. Cierra las brechas pendientes y mide resultados financieros.'; }
    else { level = 'Lista para escalar'; msg = 'Cumple las condiciones clave. El siguiente paso es rediseñar más procesos y medir su impacto en utilidades.'; }
    $('#diag-score').textContent = n + '/' + CHECKS.length;
    $('#diag-level').textContent = level;
    $('#diag-msg').textContent = msg;
  }
  checksEl.addEventListener('change', evalDiag);
  $('#diag-reset').addEventListener('click', function () {
    $$('input', checksEl).forEach(function (b) { b.checked = false; });
    evalDiag();
  });
  evalDiag();

  /* ---------- 10. Constructor de prompts ---------- */
  var form = $('#builder');
  FIELDS.forEach(function (f) {
    var id = 'pf-' + f[0];
    var wrap = document.createElement('div');
    wrap.className = 'field';
    wrap.innerHTML = '<label for="' + id + '">' + f[0] + ' · ' + f[1] + ' <span>' + f[2] + '</span></label>' +
      '<textarea id="' + id + '" rows="2" placeholder="' + f[3] + '"></textarea>';
    form.appendChild(wrap);
  });
  var areas = $$('textarea', form);
  var savedPrompt = store.get('umbral-prompt', null);
  if (savedPrompt) areas.forEach(function (a, i) { a.value = savedPrompt[i] || ''; });

  function buildPrompt() {
    var parts = [], count = 0, chips = '';
    areas.forEach(function (a, i) {
      var v = a.value.trim();
      if (v) { parts.push(FIELDS[i][5] + v); count++; }
      chips += '<span class="' + (v ? 'on' : '') + '">' + FIELDS[i][0] + '</span>';
    });
    $('#prompt-out').textContent = parts.length ? parts.join('\n\n') : 'Tu prompt aparecerá aquí conforme llenes los campos.';
    $('#q-val').textContent = count + '/7';
    $('#q-bar').style.width = (count / 7 * 100) + '%';
    $('#q-chips').innerHTML = chips;
    store.set('umbral-prompt', areas.map(function (a) { return a.value; }));
  }
  form.addEventListener('input', buildPrompt);
  $('#example-prompt').addEventListener('click', function () {
    areas.forEach(function (a, i) { a.value = FIELDS[i][4]; });
    buildPrompt();
    toast('Ejemplo cargado');
  });
  $('#clear-prompt').addEventListener('click', function () {
    areas.forEach(function (a) { a.value = ''; });
    buildPrompt();
  });
  $('#copy-prompt').addEventListener('click', function () {
    var text = $('#prompt-out').textContent;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { toast('Prompt copiado'); }, function () { toast('No se pudo copiar'); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('Prompt copiado'); } catch (e) { toast('No se pudo copiar'); }
      ta.remove();
    }
  });
  buildPrompt();

  /* ---------- 11. Bitácora evaluada ---------- */
  var COMP = ['R', 'C', 'T', 'F', 'A', 'Rs', 'Q'];
  var logChart = $('#log-chart');
  var total = 0;
  LOG.forEach(function (p, i) {
    total += p.s;
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', 'Prompt ' + (i + 1) + ': ' + p.t + ', ' + p.s.toFixed(1) + ' de 10');
    b.innerHTML = '<span class="ix">' + (i + 1) + '</span><span class="tr"><span>' + p.t + '</span><i style="width:' + (p.s * 10) + '%"></i></span><span class="sc">' + p.s.toFixed(1) + '</span>';
    b.addEventListener('click', function () {
      showLog(i);
      if (window.innerWidth < 1040) $('#log-detail').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
    var liEl = document.createElement('li');
    liEl.appendChild(b);
    logChart.appendChild(liEl);
  });
  if (LOG.length) $('#log-avg').textContent = (total / LOG.length).toFixed(1);

  function showLog(i) {
    $$('button', logChart).forEach(function (b, j) { b.setAttribute('aria-pressed', String(i === j)); });
    var p = LOG[i];
    var val = { f: 1, h: 0.5, n: 0 };
    var comp = p.m.split('').reduce(function (s, k) { return s + val[k]; }, 0);
    var dots = p.m.split('').map(function (k, j) {
      var title = k === 'f' ? 'presente' : k === 'h' ? 'heredado' : 'ausente';
      return '<span class="' + k + '" title="' + title + '">' + COMP[j] + '</span>';
    }).join('');
    $('#log-detail').innerHTML = '<h4>' + (i + 1) + '. ' + p.t + ' · ' + p.s.toFixed(1) + '/10</h4>' +
      '<blockquote>“' + escapeHtml(p.p) + '”</blockquote><dl>' +
      '<div><dt>Asertividad: ' + p.as + '</dt><dd>' + p.a + '</dd></div>' +
      '<div><dt>Completitud: ' + comp.toFixed(1) + '/7</dt><dd>' + p.c + '<div class="dots" aria-label="Componentes: color pleno presente, tenue heredado, gris ausente">' + dots + '</div></dd></div>' +
      '<div><dt>Mejora sugerida</dt><dd>' + p.i + '</dd></div></dl>';
  }
  function escapeHtml(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  if (LOG.length) showLog(0);

  /* ---------- 12. Evaluación ---------- */
  var quizEl = $('#quiz');
  var qi = 0, score = 0;
  function renderQuestion() {
    var q = QUIZ[qi];
    quizEl.innerHTML = '<div class="quiz-top"><span class="muted">Pregunta ' + (qi + 1) + ' de ' + QUIZ.length + '</span>' +
      '<div class="quiz-progress" role="progressbar" aria-valuemin="0" aria-valuemax="' + QUIZ.length + '" aria-valuenow="' + qi + '"><i style="width:' + (qi / QUIZ.length * 100) + '%"></i></div></div>' +
      '<div class="q-card"><h4 tabindex="-1">' + q.q + '</h4><div class="options">' +
      q.o.map(function (o, i) { return '<button type="button" data-i="' + i + '"><span class="k">' + 'ABCD'[i] + '</span><span>' + o + '</span></button>'; }).join('') +
      '</div><div class="fb-slot" aria-live="polite"></div></div>';
    $$('.options button', quizEl).forEach(function (b) { b.addEventListener('click', answer); });
  }
  function answer(e) {
    var q = QUIZ[qi];
    var pick = +e.currentTarget.dataset.i;
    var ok = pick === q.a;
    if (ok) score++;
    $$('.options button', quizEl).forEach(function (b, i) {
      b.disabled = true;
      if (i === q.a) b.classList.add('correct');
      else if (i === pick) b.classList.add('wrong');
    });
    $('.fb-slot', quizEl).innerHTML = '<div class="feedback"><b>' + (ok ? '✓ Correcto' : '✕ No exactamente') + '</b>' + q.e + '</div>' +
      '<div class="quiz-nav"><button class="btn btn-primary" type="button" id="q-next">' + (qi < QUIZ.length - 1 ? 'Siguiente pregunta' : 'Ver resultado') + '</button></div>';
    $('#q-next').addEventListener('click', function () {
      qi++;
      if (qi < QUIZ.length) { renderQuestion(); $('.q-card h4', quizEl).focus(); }
      else renderResult();
    });
    $('#q-next').focus();
  }
  function renderResult() {
    var best = Math.max(store.get('umbral-quiz-best', 0), score);
    store.set('umbral-quiz-best', best);
    var msg = score === QUIZ.length ? 'Dominas los conceptos clave de la investigación.'
      : score >= 5 ? 'Muy buen resultado. Repasa los módulos de las preguntas que fallaste.'
      : 'Vale la pena recorrer de nuevo los módulos para reforzar los conceptos.';
    quizEl.innerHTML = '<div class="result"><div class="big">' + score + '/' + QUIZ.length + '</div>' +
      '<h4 tabindex="-1" style="font-family:var(--serif);font-weight:500;font-size:1.7rem;margin:10px 0">' + msg + '</h4>' +
      '<p class="muted">Tu mejor resultado en este navegador: ' + best + '/' + QUIZ.length + '.</p>' +
      '<button class="btn btn-primary" type="button" id="q-retry">Intentar de nuevo</button></div>';
    $('.result h4', quizEl).focus();
    $('#q-retry').addEventListener('click', function () { qi = 0; score = 0; renderQuestion(); });
    if (score >= 5) toast('¡Evaluación aprobada!');
  }
  renderQuestion();

  /* ---------- 13. Glosario: ventanas emergentes y diálogo ---------- */
  var pop = $('#popover');
  var popOwner = null;
  function closePop() {
    if (!popOwner) return;
    pop.hidden = true;
    popOwner.removeAttribute('aria-describedby');
    popOwner.setAttribute('aria-expanded', 'false');
    popOwner = null;
  }
  function openPop(btn) {
    var g = GLOSSARY[btn.dataset.term];
    if (!g) return;
    if (popOwner === btn) { closePop(); return; }
    closePop();
    pop.innerHTML = '<b>' + g[0] + '</b>' + g[1];
    pop.hidden = false;
    var r = btn.getBoundingClientRect();
    var pw = pop.offsetWidth;
    var left = Math.min(Math.max(16, r.left + window.scrollX), window.scrollX + document.documentElement.clientWidth - pw - 16);
    var top = r.bottom + window.scrollY + 8;
    if (r.bottom + pop.offsetHeight + 16 > window.innerHeight) top = r.top + window.scrollY - pop.offsetHeight - 8;
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
    btn.setAttribute('aria-describedby', 'popover');
    btn.setAttribute('aria-expanded', 'true');
    popOwner = btn;
  }
  $$('.term').forEach(function (t) {
    t.setAttribute('aria-expanded', 'false');
    t.addEventListener('click', function (e) { e.stopPropagation(); openPop(t); });
  });
  document.addEventListener('click', function (e) { if (!pop.contains(e.target)) closePop(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && popOwner) { var o = popOwner; closePop(); o.focus(); } });
  window.addEventListener('resize', closePop);

  var dlg = $('#glossary');
  var glList = $('#gl-list');
  var entries = Object.keys(GLOSSARY).filter(function (k) { return k !== 'subrayadas'; })
    .map(function (k) { return GLOSSARY[k]; })
    .sort(function (a, b) { return a[0].localeCompare(b[0], 'es'); });
  function renderGlossary(filter) {
    var f = (filter || '').toLowerCase();
    var html = entries.filter(function (g) { return !f || (g[0] + ' ' + g[1]).toLowerCase().indexOf(f) !== -1; })
      .map(function (g) { return '<dt>' + g[0] + '</dt><dd>' + g[1] + '</dd>'; }).join('');
    glList.innerHTML = html || '<dd>Sin resultados.</dd>';
  }
  renderGlossary();
  $('#gl-search').addEventListener('input', function (e) { renderGlossary(e.target.value); });
  $('#open-glossary').addEventListener('click', function () {
    closePop();
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    $('#gl-search').focus();
  });
  $('#close-glossary').addEventListener('click', function () { dlg.close ? dlg.close() : dlg.removeAttribute('open'); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
})();
