export function EsTriangleArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Calculadora de Triángulos: Resolución de Lados, Ángulos, Áreas y Alturas</h2>
        <p className="lead">
          El triángulo es la figura geométrica más rígida e indeformable del universo físico. En arquitectura, ingeniería
          estructural, carpintería de armar y topografía, cualquier superficie poligonal compleja se descompone en
          triángulos para poder calcular tensiones mecánicas, replantear cimientos o dimensionar cubiertas con exactitud
          milimétrica.
        </p>
        <p>
          Resolver un triángulo consiste en encontrar el valor de sus tres lados y sus tres ángulos interiores a partir
          de un conjunto mínimo de datos conocidos. Aunque parece un ejercicio puramente escolar, cometer un error en el
          cálculo trigonométrico de una cercha de tejado o en el corte en inglete de una viga puede arruinar una
          estructura completa.
        </p>
        <p>
          Nuestra calculadora resuelve cualquier tipo de triángulo al instante (rectángulo, isósceles, escaleno,
          obtusángulo o equilátero), mostrando el diagrama a escala proporcional, las tres alturas, el área, el
          perímetro, el radio de la circunferencia inscrita (inradio) y el de la circunscrita (circunradio).
        </p>

        <h3>Cuántos datos necesitas y la regla de la desigualdad triangular</h3>
        <p>
          Para resolver de manera unívoca un triángulo cualquiera en el plano euclidiano, la geometría exige conocer
          exactamente tres medidas independientes, de las cuales al menos una debe ser obligatoriamente la longitud de un
          lado. Conocer únicamente los tres ángulos interiores no basta: determina la forma del triángulo por semejanza,
          pero deja su tamaño flotando en una escala infinita.
        </p>
        <p>
          Existe además una condición física insoslayable denominada la desigualdad triangular. Para que tres segmentos
          puedan unirse y cerrar un triángulo en el espacio, la suma de las longitudes de dos lados cualesquiera debe ser
          estrictamente mayor que la longitud del tercer lado (<code>{"a + b > c, a + c > b, b + c > a"}</code>). Si intentas
          construir un triángulo con varillas de 2, 3 y 6 metros, las dos varillas cortas jamás llegarán a tocarse en el
          vértice superior, quedando planas sobre la varilla larga.
        </p>
        <p>
          Nuestra herramienta valida de forma automática esta condición antes de realizar cualquier cálculo para evitar
          introducir medidas físicamente imposibles.
        </p>

        <h3>Los métodos matemáticos de resolución: Pitágoras, senos y cosenos</h3>
        <p>
          El algoritmo que aplica la calculadora varía según la configuración geométrica de los datos facilitados:
        </p>
        <p>
          En triángulos rectángulos (aquellos que poseen un ángulo recto de 90 grados), la solución es directa y limpia.
          La relación entre sus catetos y su hipotenusa se rige por el Teorema de Pitágoras, mientras que las razones
          trigonométricas básicas (seno, coseno y tangente) permiten deducir los ángulos agudos y las proporciones
          restantes con dos únicos datos conocidos.
        </p>
        <p>
          En triángulos oblicuángulos (sin ningún ángulo recto), se combinan dos leyes fundamentales de la trigonometría:
        </p>
        <ul>
          <li>
            <strong>La Ley de los Cosenos:</strong> Constituye la generalización del teorema de Pitágoras para cualquier
            ángulo interior. Se aplica prioritariamente cuando se conocen los tres lados (caso LLL) o cuando se conocen
            dos lados y el ángulo comprendido entre ellos (caso LAL).
          </li>
          <li>
            <strong>La Ley de los Senos:</strong> Establece que la longitud de cada lado es directamente proporcional al
            seno de su ángulo opuesto. Es el método idóneo cuando se conocen dos ángulos y un lado (casos ALA o AAL).
          </li>
          <li>
            <strong>El caso ambiguo (dos lados y un ángulo no comprendido, LLA):</strong> Es el escenario más delicado de
            la geometría plana. Dependiendo de la longitud relativa del cateto opuesto respecto a la altura del triángulo,
            pueden existir dos triángulos válidos distintos (uno acutángulo y otro obtusángulo), una única solución o
            ninguna. Nuestra herramienta identifica este caso ambiguo y te permite alternar entre ambas soluciones
            geométricas.
          </li>
        </ul>

        <h3>El cálculo del área y la célebre fórmula de Herón</h3>
        <p>
          Conocer la superficie interior de un triángulo es imprescindible para calcular metros cuadrados de tarima,
          tejas para tejados o parcelas de terreno irregular.
        </p>
        <p>
          Cuando se conoce la base y la altura perpendicular, se aplica la fórmula clásica de base por altura dividido
          entre dos. Si se conocen dos lados y el ángulo que forman, la fórmula trigonométrica ½ · a · b · sen(C) resuelve
          el área en un solo paso.
        </p>
        <p>
          Cuando únicamente dispones de la medida perimetral de los tres lados (a, b y c), la herramienta aplica la
          milenaria Fórmula de Herón de Alejandría. Primero calcula el semiperímetro sumando los tres lados y dividiendo
          entre dos: s = (a + b + c) / 2. A continuación, el área se obtiene mediante la raíz cuadrada del producto
          continuo: Área = √(s · (s - a) · (s - b) · (s - c)).
        </p>

        <h3>Aplicaciones prácticas: la regla del 3-4-5 y el diseño de cerchas</h3>
        <p>La utilidad del cálculo de triángulos se manifiesta a diario en pie de obra:</p>
        <p>
          En el replanteo de excavaciones y tabiquería, los albañiles emplean la regla pitagórica del 3-4-5 para trazar
          esquinas con escuadras perfectas de 90 grados. Miden 3 metros a lo largo de un muro, 4 metros sobre el muro
          perpendicular y tensan una cinta métrica en diagonal. Si la diagonal mide exactamente 5 metros (3² + 4² = 9 + 16
          = 25 = 5²), la estancia está a escuadra perfecta.
        </p>
        <p>
          En la construcción de cubiertas a dos aguas, las cerchas de madera o acero forman triángulos isósceles. Al
          trazar la altura central (el pendolón), la estructura se divide en dos triángulos rectángulos idénticos,
          permitiendo calcular la longitud exacta de las vigas inclinadas (pares) y los grados de corte para que los
          apoyos asienten sin holguras sobre los muros de carga.
        </p>
      </div>
    </article>
  );
}

export function EsDiagonalArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Calculadora de Diagonales: Rectángulos, Pantallas de TV y Cajas 3D</h2>
        <p className="lead">
          La diagonal es la línea recta que une dos vértices no consecutivos de un polígono o cuerpo tridimensional.
          Aunque la fórmula matemática básica procede del célebre teorema de Pitágoras formulado en la Grecia clásica,
          calcular diagonales es una tarea cotidiana indispensable en la albañilería profesional, el diseño de interiores,
          el embalaje logístico y la compra de televisores y monitores.
        </p>
        <p>
          Si vas a realizar una reforma en casa, embalar un paquete largo para enviarlo por mensajería o comprar un mueble
          nuevo y dudas si entrará por el hueco del ascensor, calcular la diagonal correcta te ahorrará mediciones fallidas
          y devoluciones engorrosas.
        </p>
        <p>
          Nuestra calculadora permite hallar al instante la diagonal exacta, el área, el perímetro y los ángulos internos
          de rectángulos y cuadrados, la diagonal espacial tridimensional de cajas y ortoedros, y la equivalencia de
          pantallas en formato panorámico 16:9.
        </p>

        <h3>Cómo calcular la diagonal en dos dimensiones: rectángulos y cuadrados</h3>
        <p>
          En cualquier rectángulo plano, la diagonal divide la figura en dos triángulos rectángulos idénticos donde el
          ancho y el alto actúan como catetos perpendiculares y la diagonal representa la hipotenusa.
        </p>
        <p>
          Aplicando el teorema de Pitágoras, la fórmula universal de la diagonal bidimensional es:{" "}
          <strong>{"d = √(ancho² + alto²)"}</strong>
        </p>
        <p>
          Si una habitación mide 4 metros de largo por 3 metros de ancho, la diagonal se calcula elevando ambos valores al
          cuadrado (16 + 9 = 25) y hallando su raíz cuadrada, obteniendo exactamente 5 metros.
        </p>
        <p>
          En el caso particular del cuadrado, donde todos los lados tienen idéntica longitud (L), la fórmula se simplifica
          de forma elegante: <strong>{"d = L · √2 ≈ L · 1,4142"}</strong>
        </p>
        <p>
          Un azulejo cuadrado de 30 centímetros de lado tiene una diagonal exacta de 42,43 centímetros (30 multiplicado
          por 1,4142). Este cálculo resulta esencial para embaldosar suelos en espiga o en diagonal, permitiendo estimar el
          sobrante de piezas en los cortes perimetrales contra el rodapié.
        </p>

        <h3>La regla de las diagonales cruzadas para replantear escuadras en obra</h3>
        <p>
          En el sector de la construcción, verificar que las esquinas de una estancia, una solera de hormigón o el marco
          de una ventana formen ángulos rectos impecables de 90 grados es fundamental para que el suelo y los tabiques no
          queden torcidos.
        </p>
        <p>
          Los albañiles profesionales utilizan el método de comprobación de diagonales cruzadas:
        </p>
        <p>
          Miden con cinta métrica las dos diagonales de la habitación (desde la esquina frontal izquierda hasta la trasera
          derecha, y viceversa). En un cuadrilátero con lados opuestos de igual longitud, los cuatro vértices están a
          escuadra perfecta si y solo si ambas diagonales miden exactamente lo mismo (d1 = d2). Si una diagonal mide 5,10
          metros y la otra mide 4,92 metros, la estancia está descuadrada en forma de paralelogramo oblicuo, lo que
          obligará a corregir los encofrados antes de verter el hormigón.
        </p>
        <p>
          Asimismo, emplean la conocida regla pitagórica del 3-4-5 para trazar esquinas rectas en excavaciones de
          parcelas, midiendo 3 metros en un eje, 4 metros en el otro y verificando que la cuerda diagonal mida 5 metros
          justos.
        </p>

        <h3>La diagonal espacial 3D: el truco clave en mudanzas y embalajes</h3>
        <p>
          Cuando un objeto largo no cabe apoyado plano sobre el suelo ni de pie contra la pared, la única opción para
          introducirlo consiste en colocarlo inclinado aprovechando la diagonal tridimensional del espacio receptor.
        </p>
        <p>
          Un ortoedro (una caja de cartón, un contenedor marítimo, una furgoneta de carga o un ascensor) tiene tres
          dimensiones ortogonales: longitud (a), anchura (b) y altura (c). Su diagonal espacial interna se calcula
          extendiendo el teorema de Pitágoras a tres dimensiones: <strong>{"d3D = √(a² + b² + c²)"}</strong>
        </p>
        <p>
          Si compras una barra de cortina o un perchero metálico de 2,30 metros de longitud y el maletero de tu coche mide
          1,60 metros de fondo, 1,10 metros de ancho y 0,90 metros de alto, puedes calcular la diagonal cúbica máxima:
          √(1,60² + 1,10² + 0,90²) = √(2,56 + 1,21 + 0,81) = √4,58 ≈ 2,14 metros. La barra no cabrá en el maletero
          cerrado ni siquiera inclinada de esquina a esquina, evitándote un viaje inútil a la tienda.
        </p>

        <h3>Cómo se calculan las pulgadas de un televisor o monitor</h3>
        <p>
          En el mercado audiovisual y tecnológico existe una convención estandarizada: las dimensiones de las pantallas de
          televisores, monitores de ordenador y teléfonos móviles se comercializan indicando exclusivamente la longitud de
          su diagonal en pulgadas.
        </p>
        <p>
          Una pulgada equivale exactamente a 2,54 centímetros. Por tanto, un televisor de 55 pulgadas tiene una diagonal
          de pantalla de 139,7 centímetros (55 × 2,54), mientras que un televisor de 65 pulgadas alcanza los 165,1
          centímetros de diagonal visible (sin incluir el bisel ni el marco plástico).
        </p>
        <p>
          Casi todos los televisores modernos utilizan la relación de aspecto panorámica 16:9, lo que permite deducir con
          precisión matemática el ancho y alto del panel mediante dos coeficientes fijos:
        </p>
        <ul>
          <li>
            <strong>Ancho de pantalla:</strong> Diagonal multiplicada por 0,8716.
          </li>
          <li>
            <strong>Alto de pantalla:</strong> Diagonal multiplicada por 0,4903.
          </li>
        </ul>
        <p>
          Aplicando estos factores a una pantalla de 55 pulgadas (139,7 cm), sabemos que medirá 121,8 centímetros de
          anchura por 68,5 centímetros de altura, datos indispensables para comprobar si el televisor cabe en el hueco del
          mueble del salón antes de comprarlo.
        </p>
      </div>
    </article>
  );
}

export function EsTrigonometryArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Calculadora de trigonometría: seno, coseno, tangente y resolución de triángulos rectángulos</h2>
        <p className="lead">
          Medir distancias verticales inaccesibles resulta imposible con una cinta métrica común. Nadie puede trepar
          hasta la copa de un eucalipto centenario o la punta de una antena de telecomunicaciones con un metro en la mano.
          Para resolver esas incógnitas nació la trigonometría. Esta rama matemática conecta las longitudes de los lados
          de una figura con las aberturas de sus esquinas mediante proporciones numéricas fijas.
        </p>
        <p>
          En cualquier triángulo con una esquina recta de 90 grados, las razones entre sus aristas se mantienen idénticas
          sin importar si la figura mide tres centímetros o quinientos metros. Esta propiedad geométrica sostiene el
          trabajo diario de topógrafos, carpinteros, arquitectos, instaladores de paneles solares y desarrolladores de
          motores de videojuegos.
        </p>

        <h3>Las razones trigonométricas y la regla SOH-CAH-TOA</h3>
        <p>
          La forma más rápida de memorizar las tres relaciones básicas en un triángulo rectángulo es el acrónimo
          SOH-CAH-TOA:
        </p>
        <ul>
          <li>
            <strong>SOH (Seno):</strong> El seno de un ángulo agudo equivale a dividir la longitud del cateto opuesto
            entre la hipotenusa. Su valor oscila siempre entre -1 y 1.
          </li>
          <li>
            <strong>CAH (Coseno):</strong> El coseno se obtiene dividiendo el cateto contiguo o adyacente entre la
            hipotenusa. Si el ángulo vale 0 grados, el coseno alcanza su máximo de 1.
          </li>
          <li>
            <strong>TOA (Tangente):</strong> La tangente vincula el cateto opuesto con el adyacente. También representa el
            cociente exacto entre el seno y el coseno del mismo ángulo.
          </li>
        </ul>
        <p>
          Junto a estas tres razones directas existen tres funciones recíprocas: la cosecante (el inverso multiplicativo
          del seno), la secante (el inverso del coseno) y la cotangente (el inverso de la tangente). Todas ellas respetan
          la identidad pitagórica madre: la suma del cuadrado del seno y el cuadrado del coseno de cualquier ángulo
          equivale exactamente a 1 (<code>{"sen²(θ) + cos²(θ) = 1"}</code>).
        </p>

        <h3>Grados sexagesimales frente a radianes</h3>
        <p>
          Un fallo recurrente en exámenes de secundaria y cálculos de obra ocurre por la confusión entre grados y
          radianes. Un círculo completo se divide en 360 partes llamadas grados sexagesimales. En cambio, el cálculo
          matemático superior y la física emplean radianes, una medida que toma como base el radio de la circunferencia.
          Una vuelta entera equivale exactamente a 2 por pi radianes (unos 6,28318 rad).
        </p>
        <p>
          Para pasar de grados a radianes, multiplica el ángulo por pi y divide el resultado entre 180 (
          <code>{"rad = grados × π / 180"}</code>). Si necesitas el camino inverso, multiplica los radianes por 180 y
          divide entre pi. Cuando una calculadora de bolsillo arroja resultados disparatados, casi siempre se debe a que
          la pantalla muestra la etiqueta RAD en lugar de DEG. Si calculas el seno de 30 en grados obtienes 0,5, pero si
          tu dispositivo procesa 30 radianes el resultado caerá en -0,9880.
        </p>

        <h3>De porcentaje a grados en rampas y tejados</h3>
        <p>
          En el sector de la edificación nadie habla de ángulos sexagesimales para definir una rampa de garaje o el faldón
          de una nave industrial. Los planos expresan la inclinación en porcentaje de pendiente. Este porcentaje refleja
          cuántos centímetros asciende verticalmente una superficie por cada 100 centímetros de avance horizontal.
        </p>
        <p>
          La conexión entre ambas magnitudes es directa gracias a la función tangente:
        </p>
        <p>
          <strong>{"Pendiente % = tan(θ) × 100"}</strong>
        </p>
        <p>
          Para encontrar el ángulo en grados a partir de un porcentaje, se aplica el arco tangente del porcentaje dividido
          entre 100. En España, el Código Técnico de la Edificación (CTE DB-SUA) fija límites estrictos para rampas
          accesibles de personas con movilidad reducida: un máximo del 10 % para tramos cortos de menos de 3 metros (unos
          5,71 grados), un 8 % para tramos de hasta 10 metros (4,57 grados) y un 6 % en recorridos mayores (3,43 grados).
          Superar estos umbrales convierte una rampa peatonal en una barrera impracticable o peligrosa. En tejados de teja
          cerámica tradicional, se exige habitualmente una pendiente mínima del 30 % al 35 % (entre 16,7 y 19,3 grados)
          para garantizar el desagüe veloz y frenar el remonte de agua bajo rachas de viento fuerte.
        </p>

        <h3>El círculo goniométrico y la tangente infinita</h3>
        <p>
          Cuando los ángulos superan los 90 grados, el triángulo rectángulo tradicional se queda corto. Los matemáticos
          recurren entonces al círculo goniométrico, una circunferencia de radio 1 trazada sobre los ejes cartesianos X e
          Y. En este esquema, cualquier punto de la circunferencia posee coordenadas donde la posición horizontal X
          coincide con el coseno del ángulo y la posición vertical Y representa el seno.
        </p>
        <p>
          Este modelo explica por qué la tangente de 90 grados no existe. En 90 grados exactos, el punto de la
          circunferencia se sitúa en las coordenadas (0, 1). Al calcular la tangente dividiendo la coordenada Y entre la X,
          surge una división entre cero (1 / 0). La recta tangente a la circunferencia en ese punto corre en paralelo
          perfecto al eje vertical, por lo que nunca llega a cortarlo.
        </p>

        <h3>Ejemplo práctico: medir la altura de un edificio</h3>
        <p>
          Imagina que deseas medir la altura de un bloque de viviendas sin subir al tejado. Te sitúas en la acera a 25
          metros de distancia de la fachada. Con un clinómetro o una aplicación móvil calibrada en el teléfono, apuntas a
          la cornisa superior y registras un ángulo de elevación de 34 grados. La altura de tus ojos respecto al suelo es
          de 1,65 metros.
        </p>
        <p>
          El cateto opuesto representa la elevación desde tus ojos hasta la cornisa. Aplicando la tangente:
        </p>
        <p>
          <strong>{"Cateto opuesto = 25 × tan(34°) = 25 × 0,6745 = 16,86 metros"}</strong>
        </p>
        <p>
          Para obtener la altura total del inmueble, sumas la distancia ocular: 16,86 + 1,65 = 18,51 metros. Con dos
          mediciones sencillas sobre el terreno resuelves la cota exacta en menos de dos minutos.
        </p>
      </div>
    </article>
  );
}

export function EsConcreteArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Cómo calcular metros cúbicos de hormigón o concreto y sacos de cemento</h2>
        <p className="lead">
          Pedir hormigón a ciegas para una obra suele terminar en disgusto. Si pides de menos, el vertido se
          interrumpe a mitad de la solera, creando una junta fría que arruina la impermeabilidad y la resistencia de la
          estructura. Si pides de más, verás cómo cientos de euros acaban vertidos en un descampado porque el camión no
          puede regresar con la cuba cargada.
        </p>
        <p>
          La denominación varía según la geografía: en España se utiliza el término hormigón, mientras que en México,
          Colombia, Argentina, Chile y casi toda América Latina se habla de concreto. Ambos conceptos describen
          exactamente el mismo compuesto: una mezcla dosificada de cemento, arena lavada, grava triturada y agua potable
          que fragua hasta transformarse en piedra artificial.
        </p>

        <h3>Cálculo de volumen según el elemento constructivo</h3>
        <p>
          Para estimar la cantidad exacta de material, la geometría básica exige multiplicar tres cotas medidas en
          metros: longitud, anchura y espesor.
        </p>
        <ul>
          <li>
            <strong>Losas y soleras de suelo:</strong> Multiplica el largo por el ancho y por el espesor. Una solera de
            garaje de 6 metros de largo por 4 metros de ancho y 15 centímetros de grosor (0,15 m) requiere exactamente
            3,60 metros cúbicos de hormigón.
          </li>
          <li>
            <strong>Zapatas de cimentación:</strong> Multiplica la base por la profundidad de excavación. Si construyes 6
            zapatas aisladas de 1,20 m por 1,20 m con 0,80 m de canto, cada zapata consume 1,15 m³, sumando 6,91 m³ en
            total.
          </li>
          <li>
            <strong>Pilares o columnas rectangulares:</strong> Multiplica ancho, fondo y altura libre. Un pilar de 30 por
            30 centímetros con 2,80 metros de altura demanda 0,25 m³.
          </li>
          <li>
            <strong>Columnas cilíndricas:</strong> Aplica la fórmula del cilindro calculando el área del círculo base (pi
            por el radio al cuadrado) y multiplicando por la altura. Un tubo de encofrado de 30 cm de diámetro (0,15 m de
            radio) y 3 metros de alto alberga 0,21 m³.
          </li>
          <li>
            <strong>Muros y vigas:</strong> Multiplica la longitud del elemento por su espesor y por la altura o canto.
          </li>
          <li>
            <strong>Escaleras de hormigón:</strong> Se calcula sumando el volumen de la losa inclinada de apoyo (la rampa)
            y el volumen acumulado de todos los peldaños triangulares (base de la huella multiplicada por la contrahuella,
            dividida entre dos y multiplicada por el ancho del escalón).
          </li>
        </ul>

        <h3>Coeficiente de aporte y merma en obra</h3>
        <p>
          Existe una trampa clásica cuando se prepara la mezcla a mano con hormigonera portátil en lugar de pedir camión
          de planta: el volumen de los materiales secos sueltos no coincide con el volumen de hormigón fresco resultante.
        </p>
        <p>
          Al mezclar la grava, la arena y el cemento con agua, los granos finos se introducen entre los huecos de las
          piedras gruesas. Esta compactación genera una contracción de volumen de entre el 30 % y el 35 %. En edificación
          se utiliza el coeficiente de aporte estándar de 1,54. Esto significa que para fabricar 1 metro cúbico de
          hormigón compactado en obra necesitas comprar aproximadamente 1,54 metros cúbicos de áridos secos combinados.
        </p>
        <p>
          A este fenómeno físico se suma la merma de obra. Las excavaciones nunca son geométricas perfectas, los
          encofrados de madera ceden unos milímetros por la presión hidrostática del vertido y siempre queda producto
          pegado a la bomba o la canaleta. Por regla general, añade siempre entre un 5 % y un 10 % de volumen adicional
          sobre el cálculo teórico.
        </p>

        <h3>Camión hormigonera frente a sacos comerciales</h3>
        <p>
          A partir de 1,5 o 2 metros cúbicos de volumen, amasar en obra con pala resulta agotador y desaconsejable. Un
          camión hormigonera estándar transporta entre 6 y 8 metros cúbicos (habitualmente 7 m³ por viaje). Pedir
          hormigón elaborado en planta garantiza que la resistencia especificada en plano cumpla las normas técnicas
          vigentes (como el Código Estructural en España o la norma ACI en América Latina).
        </p>
        <p>
          Si decides preparar el material por tu cuenta para reparaciones menores, la calculadora desglosa la compra en
          sacos comerciales:
        </p>
        <ul>
          <li>
            <strong>Sacos de 25 kg:</strong> Es el formato estándar obligatorio en España y la Unión Europea para
            respetar los límites de salud laboral y prevenir lesiones lumbares en los operarios. Para una dosificación
            estándar de resistencia media (unos 350 kg de cemento por m³), necesitas aproximadamente 14 sacos de cemento
            por cada metro cúbico de hormigón.
          </li>
          <li>
            <strong>Sacos de 50 kg:</strong> Formato habitual en ferreterías y corralones de México, Colombia y otros
            países latinoamericanos. Se precisan unos 7 u 8 sacos de 50 kg para producir 1 m³ de concreto estructural.
          </li>
        </ul>

        <h3>Dosificación en obra y la regla del agua</h3>
        <p>
          Para una resistencia estructural media (tipo H-20 o 200 kg/cm², adecuada para losas de vivienda y cimientos
          comunes), la proporción volumétrica tradicional de mezcla en seco es 1 : 2 : 3 (una parte de cemento, dos
          partes de arena lavada y tres partes de grava o gravilla).
        </p>
        <p>
          El error más destructivo en una obra consiste en añadir agua de más a la hormigonera para que la masa corra con
          facilidad por las carretillas. Cada litro de agua sobrante que no interviene en la hidratación química del
          cemento se evaporará durante las semanas siguientes, dejando microporos vacíos en la masa endurecida. Este
          exceso reduce drásticamente la resistencia a compresión del hormigón y multiplica el riesgo de grietas por
          retracción.
        </p>
        <p>
          Mantener la superficie húmeda regándola dos o tres veces al día durante los primeros siete días posteriores al
          vertido garantiza un fraguado resistente sin fisuras indeseadas.
        </p>
      </div>
    </article>
  );
}

export function EsGallonArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Conversión de galones a litros: diferencia entre galón estadounidense e imperial</h2>
        <p className="lead">
          Comprar aceite de motor para un coche clásico, encargar pintura para la fachada de una casa o consultar un
          manual de acuarios importados genera frecuentes quebraderos de cabeza. El motivo es simple: la palabra galón
          no representa una cantidad universal en todo el planeta.
        </p>
        <p>
          Quien asuma que todos los galones son iguales cometerá errores notables. Si compras lubricante en una tienda de
          repuestos pensando en la medida británica pero el bote sigue el estándar de Estados Unidos, recibirás casi un
          litro menos por cada envase. En aviación comercial o en la industria química, semejante confusión ha provocado
          aterrizajes de emergencia y paradas de producción.
        </p>

        <h3>Galón estadounidense frente a galón imperial británico</h3>
        <p>
          En el comercio internacional conviven dos unidades principales con el mismo nombre y volúmenes muy distintos:
        </p>
        <ul>
          <li>
            <strong>Galón líquido estadounidense (US Liquid Gallon):</strong> Equivale exactamente a 3,785411784 litros.
            Su origen se remonta al antiguo galón británico de vino fijado por la reina Ana en 1707, definido como un
            cilindro de 231 pulgadas cúbicas. Se divide en 4 cuartos (quarts), 8 pintas o 128 onzas líquidas
            estadounidenses. Es la unidad vigente en Estados Unidos y la medida habitual para vender combustible en
            gasolineras de Colombia, Perú, Ecuador, República Dominicana, Guatemala, Honduras y Panamá.
          </li>
          <li>
            <strong>Galón imperial británico (UK Gallon):</strong> Equivale exactamente a 4,54609 litros. El Parlamento
            británico lo introdujo en 1824 para unificar las distintas medidas del reino, definiéndolo como el volumen
            ocupado por 10 libras de agua destilada a 62 grados Fahrenheit con una presión atmosférica estándar. Alberga
            160 onzas líquidas imperiales y resulta aproximadamente un 20,1 % más voluminoso que el galón estadounidense.
          </li>
          <li>
            <strong>Galón seco estadounidense (US Dry Gallon):</strong> Equivale a 4,40488 litros. Se emplea casi en
            exclusiva en el sector agrícola norteamericano para medir cosechas a granel como cereales, bayas o frutas,
            dividiéndose en 8 pintas secas.
          </li>
        </ul>

        <h3>Factores de conversión y cálculo mental veloz</h3>
        <p>
          Para convertir galones estadounidenses a litros sobre la marcha, multiplica la cifra por 3,785. Si necesitas
          una aproximación mental rápida en el supermercado, multiplica los galones por 4 y resta un 5 % al resultado
          final. Por ejemplo, 10 galones por 4 dan 40 litros; restando el 5 % (2 litros) obtienes 38 litros, una cifra
          casi idéntica a los 37,85 litros exactos.
        </p>
        <p>
          Si trabajas con galones imperiales británicos, la regla mental consiste en multiplicar por 4,5 o sumar un
          tercio de litro a cada galón multiplicado por 4. Para el camino inverso, convierte litros a galones
          estadounidenses dividiendo los litros entre 3,785, o multiplica por 0,2642.
        </p>
        <p>
          El célebre incidente del Gimli Glider en 1983 ilustra el peligro de las confusiones métricas. Un avión Boeing
          767 de Air Canada se quedó sin queroseno en pleno vuelo a 12.000 metros de altitud porque el personal de tierra
          calculó el combustible mezclando densidades en libras y litros en lugar de kilogramos, asumiendo volúmenes
          erróneos de galones en sus fórmulas de repostaje. Los pilotos lograron planear milagrosamente hasta aterrizar
          en una pista abandonada sin víctimas.
        </p>

        <h3>Aplicaciones cotidianas: pintura, coches y acuarios</h3>
        <p>
          En la construcción y la pintura profesional, el formato más vendido en ferreterías es el cubo de 5 galones
          estadounidenses. Ese recipiente alberga 18,93 litros de pintura o sellador, razón por la cual en España y
          Latinoamérica los fabricantes comercializan cubetas redondas etiquetadas como 19 litros.
        </p>
        <p>
          En el mercado automovilístico, los vehículos de importación norteamericana expresan el rendimiento del motor en
          millas por galón (MPG). Para transformar esa cifra al estándar hispanohablante de consumo en litros cada 100
          kilómetros (L/100 km), se utiliza la constante matemática 235,215:
        </p>
        <p>
          <strong>{"Consumo en L/100 km = 235,215 / MPG estadounidense"}</strong>
        </p>
        <p>
          Un utilitario que anuncia 30 MPG consume realmente 7,84 litros cada 100 kilómetros en autopista. Si el vehículo
          procede de Gran Bretaña y usa galones imperiales, la constante de conversión sube a 282,481.
        </p>
        <p>
          En acuarios domésticos, las tablas biológicas de carga de peces suelen fijar un límite de un centímetro de pez
          por cada litro de agua, o una pulgada de pez por galón. Conocer si una urna de cristal importada mide 20
          galones (75,7 litros) o 55 galones (208,2 litros) evita sobrepoblar el tanque y arruinar el ciclo biológico del
          filtro bacteriano.
        </p>
      </div>
    </article>
  );
}
