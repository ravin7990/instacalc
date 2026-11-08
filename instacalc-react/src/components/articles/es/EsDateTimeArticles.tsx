export function EsAgeArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Calculadora de Edad Exacta: Años, Meses, Días y Horas Vividas</h2>
        <p className="lead">
          Saber cuántos años tienes parece una cuenta trivial: basta con restar el año en que naciste del año en curso.
          Sin embargo, cuando necesitas acreditar tu edad cronológica exacta para un trámite administrativo oficial,
          una matrícula escolar, una oposición pública del Estado o la contratación de una póliza de seguro, esa resta
          simple se queda corta.
        </p>
        <p>
          El calendario civil o gregoriano no es uniforme. Los meses tienen duraciones dispares de 28, 29, 30 o 31 días,
          y cada cuatro años se intercala un año bisiesto que añade un día extra a febrero. Calcular los años, meses y
          días cumplidos con precisión exige una aritmética de calendario rigurosa.
        </p>
        <p>
          Nuestra calculadora determina al segundo tu edad exacta desde tu fecha de nacimiento hasta el día de hoy o
          cualquier fecha pasada o futura, desglosando el total de semanas, días, horas y minutos que has vivido en el
          planeta, además de la cuenta atrás para tu próximo cumpleaños.
        </p>

        <h3>La matemática del calendario: por qué dividir entre 365 falla</h3>
        <p>
          Un error frecuente al programar hojas de cálculo consiste en restar los días totales transcurridos entre dos
          fechas y dividirlos entre 365 o entre 365,25. Ese cálculo aproximado genera desfases de varios días en personas
          adultas.
        </p>
        <p>
          Para obtener la edad cronológica exacta se utiliza el método de sustracción con acarreo de fechas, restando de
          derecha a izquierda: días, meses y años.
        </p>
        <p>
          Si el día de la fecha de referencia es inferior al día de tu nacimiento, no puedes realizar una resta directa.
          Debes pedir prestado un mes a la columna contigua. Ese mes prestado no vale una cifra teórica fija: equivale
          con exactitud a los días que tenía el mes inmediatamente anterior (por ejemplo, 31 días si vienes de marzo o 28
          días si vienes de febrero en un año no bisiesto). Si los meses tampoco alcanzan, se toma prestado un año
          completo que se convierte en doce meses.
        </p>
        <p>
          Esta rigurosidad evita cualquier discrepancia con los registros civiles, juzgados y administraciones públicas.
        </p>

        <h3>La regla de los años bisiestos y el caso del 29 de febrero</h3>
        <p>
          El calendario gregoriano introducido en 1582 ajusta el desfase de la rotación terrestre mediante los años
          bisiestos. La regla astronómica tiene tres condiciones matemáticas:
        </p>
        <ul>
          <li>Cualquier año divisible entre 4 es bisiesto y tiene 366 días.</li>
          <li>Los años que cierran siglo (seculares terminados en 00) no son bisiestos, aunque sean divisibles entre 4.</li>
          <li>
            Excepción a la regla anterior: si el año secular es divisible entre 400, sí es bisiesto. Por esa razón el
            año 2000 fue bisiesto, pero los años 1700, 1800 y 1900 no lo fueron, y el año 2100 tampoco lo será.
          </li>
        </ul>
        <p>
          Para quienes nacieron un 29 de febrero, surge la eterna duda: ¿cuándo cumplen años en los tres años comunes
          intermedios? En el plano legal y civil en España y la mayoría de países europeos, la convención administrativa
          y registral establece que el aniversario oficial se perfecciona al comenzar el 1 de marzo, ya que se exige
          haber completado las 365 jornadas completas posteriores al nacimiento.
        </p>

        <h3>Hitos legales y la edad actuarial en los seguros</h3>
        <p>
          La edad cronológica exacta determina derechos civiles, obligaciones legales y contratos financieros clave a lo
          largo de la vida.
        </p>
        <p>
          En el ordenamiento jurídico español, la mayoría de edad y la plena capacidad de obrar se adquieren a los 18
          años cumplidos según el artículo 12 de la Constitución. La edad laboral mínima se fija en los 16 años (con
          consentimiento paterno), mientras que en las oposiciones a cuerpos y fuerzas de seguridad del Estado se exigen
          edades mínimas y límites superiores vinculados a la fecha de publicación de la convocatoria.
        </p>
        <p>
          En el sector asegurador existe además un concepto técnico distinto: la <strong>edad actuarial</strong>. Al
          contratar un seguro de vida o de salud, muchas aseguradoras no utilizan tu edad cumplida en tu último
          cumpleaños, sino la edad más cercana en el calendario. Si hoy tienes 34 años pero faltan menos de seis meses
          para que cumplas los 35, la compañía de seguros te tarifará la póliza aplicando la prima de riesgo
          correspondiente a una persona de 35 años.
        </p>
      </div>
    </article>
  );
}

export function EsCatAgeArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Calculadora de Edad de Gatos en Años Humanos: Tabla Veterinaria Oficial</h2>
        <p className="lead">
          Durante décadas se ha repetido la creencia popular de que cada año de vida de un gato equivale a siete años
          humanos. Esta regla del siete es una simplificación matemática que no guarda relación con la biología real de
          los felinos.
        </p>
        <p>
          Los gatos no envejecen de manera lineal. Durante sus primeros veinticuatro meses experimentan un desarrollo
          físico y conductual vertiginoso. Un gatito de apenas un año de edad ya ha alcanzado la madurez sexual y la
          talla adulta, algo impensable para un niño humano de siete años.
        </p>
        <p>
          Por esta razón, la Asociación Americana de Hospitales de Animales (AAHA) y la Asociación Americana de
          Profesionales Felinos (AAFP) desarrollaron una escala clínica estandarizada. Esta tabla veterinaria refleja con
          precisión el ritmo biológico de los gatos y ayuda a los tutores a adaptar la alimentación, el enriquecimiento
          ambiental y las visitas preventivas al veterinario según cada etapa vital.
        </p>

        <h3>Cómo funciona la regla veterinaria de conversión felina</h3>
        <p>
          La fórmula de equivalencia respaldada por la comunidad veterinaria internacional divide el envejecimiento en
          dos fases muy diferenciadas:
        </p>
        <ul>
          <li>
            <strong>El primer año de vida:</strong> El gato pasa de ser un recién nacido lactante totalmente dependiente
            a un individuo fértil e independiente. Este primer año equivale a <strong>15 años humanos</strong> de
            desarrollo corporal y cognitivo.
          </li>
          <li>
            <strong>El segundo año de vida:</strong> Se consolida el crecimiento óseo, la estructura muscular y el
            temperamento definitivo. Al cumplir dos años, el felino equivale a una persona joven de{" "}
            <strong>24 años</strong>.
          </li>
          <li>
            <strong>A partir del tercer año:</strong> El reloj biológico se estabiliza en un ritmo regular y constante.
            Cada año natural adicional suma aproximadamente <strong>4 años humanos</strong>. De este modo, un gato de 3
            años tiene 28 años equivalentes, con 5 años tiene 36, a los 10 años alcanza los 56 y con 15 años llega a los
            76 años humanos.
          </li>
        </ul>
        <p>
          Esta progresión explica por qué un gato de doce años puede aparentar una agilidad envidiable mientras su
          organismo afronta los mismos desgastes celulares que una persona de sesenta y cuatro años.
        </p>

        <h3>Las cinco etapas vitales del gato y sus necesidades médicas</h3>
        <p>
          El consenso veterinario clasifica la trayectoria de los felinos domésticos en cinco grandes períodos de
          desarrollo:
        </p>
        <p>
          <strong>1. Gatito lactante y cachorro (de 0 a 1 año / 0 a 15 años humanos):</strong> Comprende la
          primovacunación (trivalente felina contra panleucopenia, calicivirus y rinotraqueítis), la desparasitación
          interna y la socialización temprana. En España, la Ley 7/2023 de Protección de los Derechos y el Bienestar de
          los Animales hace obligatoria la identificación individual con microchip a partir de los tres meses y exige la
          esterilización quirúrgica de todos los gatos domésticos antes de que cumplan seis meses de edad, salvo
          ejemplares inscritos en el Registro Oficial de Criadores.
        </p>
        <p>
          <strong>2. Adulto joven (de 1 a 6 años / 15 a 40 años humanos):</strong> Es la fase de mayor plenitud física y
          juego activo. El principal reto veterinario en esta etapa es evitar el sobrepeso derivado del sedentarismo en
          pisos pequeños y controlar la acumulación de sarro mediante higiene bucodental periódica.
        </p>
        <p>
          <strong>3. Adulto maduro (de 7 a 10 años / 44 a 56 años humanos):</strong> A partir de los siete años se inicia
          un declive metabólico sutil pero constante. Comienza la necesidad de realizar revisiones clínicas anuales con
          análisis de sangre y orina para detectar de forma temprana alteraciones hepáticas o pérdidas incipientes de
          función renal.
        </p>
        <p>
          <strong>4. Sénior (de 11 a 14 años / 60 a 72 años humanos):</strong> En esta franja de edad, más del 30 % de los
          gatos desarrolla problemas de salud crónicos. Las visitas veterinarias deben programarse cada seis meses. Es el
          momento de monitorizar la tensión arterial para prevenir desprendimientos de retina o accidentes
          cerebrovasculares, y evaluar si existen dolores articulares o artrosis que dificulten al animal saltar al
          sofá o a sus lugares de descanso habituales.
        </p>
        <p>
          <strong>5. Geriátrico o supersénior (15 años o más / 76 a 100+ años humanos):</strong> Los gatos que superan los
          quince años requieren cuidados paliativos centrados en el confort. La Insuficiencia Renal Crónica (IRC) y el
          hipertiroidismo son las patologías más habituales. El diagnóstico precoz mediante biomarcadores como la SDMA y
          la creatinina sérica permite pautar dietas húmedas bajas en fósforo y medicación protectora que prolongan su
          calidad de vida durante varios años más.
        </p>

        <h3>Gatos de interior frente a gatos con acceso al exterior</h3>
        <p>El entorno donde vive el animal determina de forma drástica su longevidad real.</p>
        <p>
          Los gatos que viven exclusivamente dentro de casa (<em>indoor</em>) disfrutan de una esperanza de vida media de
          entre 14 y 18 años, no siendo raro que alcancen las dos décadas con buenos cuidados preventivos. Al permanecer
          en un entorno seguro están protegidos frente a atropellos automovilísticos, peleas territoriales,
          intoxicaciones accidentales y contagio de virus letales como la leucemia felina (FeLV) o el virus de la
          inmunodeficiencia felina (FIV).
        </p>
        <p>
          En contraste, los gatos que deambulan libremente por la calle (<em>outdoor</em>) tienen una esperanza media de
          vida dramáticamente inferior, situada entre los 3 y 5 años debido a los múltiples riesgos del entorno urbano y
          rural.
        </p>
      </div>
    </article>
  );
}

export function EsBirthdayArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Calculadora de Cumpleaños: Cuenta Atrás, Día Semanal e Hitos de Vida</h2>
        <p className="lead">
          Celebrar un cumpleaños es una de las tradiciones humanas más universales. Sin embargo, más allá de apagar
          velas y sumar una cifra al documento de identidad, nuestra fecha de nacimiento encierra patrones matemáticos
          fascinantes vinculados al calendario gregoriano.
        </p>
        <p>
          Muchas personas desconocen en qué día de la semana llegaron al mundo. Otras se preguntan cuántos días exactos
          faltan para su próxima celebración o por qué su fiesta cae un sábado este año pero saltará al lunes en el
          siguiente.
        </p>
        <p>
          Nuestra calculadora de cumpleaños resuelve estos cálculos en milésimas de segundo, detallando los días y
          semanas que has vivido en el planeta, la fecha de tu medio cumpleaños y la cuenta atrás exacta para tu próximo
          aniversario.
        </p>

        <h3>Por qué tu cumpleaños cambia de día de la semana cada año</h3>
        <p>
          El movimiento de tu cumpleaños a lo largo de los días de la semana obedece a una propiedad aritmética
          fundamental del calendario:
        </p>
        <p>
          Un año común tiene 365 días. Si divides 365 entre los 7 días que componen una semana completa, obtienes 52
          semanas exactas más 1 día de resto (365 módulo 7 = 1). Este día sobrante provoca que cada año ordinario tu
          aniversario avance exactamente un día de la semana. Si el año pasado cumpliste en jueves, este año común
          cumplirás en viernes.
        </p>
        <p>
          La situación cambia cuando interviene un año bisiesto. Al contar con 366 jornadas, el residuo semanal pasa a
          ser de 2 días (366 módulo 7 = 2). Si tu fecha de nacimiento atraviesa un 29 de febrero bisiesto, tu cumpleaños
          da un salto doble en la semana, pasando por ejemplo de celebrarse en viernes a caer directamente en domingo.
        </p>
        <p>
          Existe además una periodicidad mayor conocida como el ciclo solar de 28 años. Debido a la combinación del ciclo
          de siete días semanales y los periodos bisiestos de cuatro años (7 × 4 = 28), el calendario gregoriano repite de
          forma idéntica los mismos días de la semana y fechas cada 28 años. Tu cumpleaños número 28, 56 y 84 caerá con
          precisión matemática exactamente en el mismo día de la semana en que naciste, siempre que en ese lapso no se
          interponga un año secular no bisiesto como 1900 o 2100. En periodos más breves, esta coincidencia se repite en
          secuencias intermedias de 6 u 11 años.
        </p>

        <h3>Cómo sabe la calculadora en qué día de la semana naciste</h3>
        <p>
          Para determinar si tu nacimiento ocurrió un lunes o un sábado, los sistemas informáticos no necesitan revisar
          archivos históricos en papel. Aplican algoritmos de calendario perpetuo basados en la aritmética modular.
        </p>
        <p>
          El método matemático más célebre es la Congruencia de Zeller, formulada por el matemático Christian Zeller en
          el siglo XIX. Esta ecuación calcula el residuo numérico de una fecha considerando el día del mes, el siglo y
          los ajustes bisiestos, asignando a enero y febrero la condición de meses 13 y 14 del año precedente. Otro
          método popular en cálculo mental es la regla del fin del mundo o Doomsday, inventada por el matemático británico
          John Conway.
        </p>
        <p>
          Nuestra herramienta aplica estas fórmulas en tiempo real para devolverte al instante el día de la semana en que
          naciste, eliminando cualquier duda familiar.
        </p>

        <h3>Hitos de vida alternativos: los 10.000 días y el medio cumpleaños</h3>
        <p>
          Medir la existencia únicamente en años solares pasa por alto aniversarios decimales memorables que cada vez más
          personas deciden festejar:
        </p>
        <ul>
          <li>
            <strong>El hito de los 1.000 días:</strong> Se alcanza aproximadamente a los 2 años y 9 meses de vida,
            marcando el final de la primera infancia y el inicio del lenguaje estructurado.
          </li>
          <li>
            <strong>El hito de los 5.000 días:</strong> Llega hacia los 13 años y 8 meses, coincidiendo con la transición
            hacia la adolescencia.
          </li>
          <li>
            <strong>El hito de los 10.000 días de vida:</strong> Ocurre alrededor de los 27 años y 4 meses de edad.
            Representa una de las celebraciones métricas más populares entre adultos jóvenes, simbolizando haber alcanzado
            diez millares de jornadas sobre la Tierra.
          </li>
          <li>
            <strong>El hito de los 20.000 días:</strong> Se cumple en torno a los 54 años y 9 meses, conmemorando más de
            medio siglo de experiencias acumuladas.
          </li>
          <li>
            <strong>El medio cumpleaños (<em>half-birthday</em>):</strong> Es la fecha que dista exactamente seis meses
            (182,5 días) de tu cumpleaños oficial. Esta celebración ha ganado enorme popularidad entre familias con niños
            nacidos a finales de diciembre o en pleno agosto, permitiéndoles festejar su día especial con compañeros de
            clase en épocas donde los colegios están abiertos y el buen clima acompaña.
          </li>
        </ul>
      </div>
    </article>
  );
}

export function EsDaysArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Calculadora de Días entre Fechas: Días Naturales, Hábiles y Laborables</h2>
        <p className="lead">
          Contar los días transcurridos entre dos fechas parece una operación elemental a simple vista. Sin embargo, en
          el mundo real de los contratos mercantiles, las relaciones laborales, las licitaciones públicas y los
          recursos judiciales, equivocarse en un solo día puede provocar la pérdida irremediable de un derecho, la
          anulación de una subvención o una penalización económica severa.
        </p>
        <p>
          La dificultad radica en que el tiempo legal no siempre coincide con el tiempo físico del calendario. No es lo
          mismo calcular un plazo en días naturales que computarlo en días hábiles o laborables, y las reglas varían
          drásticamente según nos encontremos ante la Administración Pública, los tribunales de justicia o un convenio
          colectivo de trabajo.
        </p>
        <p>
          Nuestra calculadora permite calcular de inmediato los días naturales totales, los días hábiles (de lunes a
          viernes) y los fines de semana entre dos fechas cualesquiera, además de sumar o restar días a cualquier fecha
          para averiguar con total exactitud la fecha límite de vencimiento.
        </p>

        <h3>Días naturales frente a días hábiles: la regla de oro legal</h3>
        <p>
          Para evitar sorpresas con plazos y notificaciones, conviene entender con absoluta nitidez las tres categorías
          de días que rigen en España y la mayoría de países hispanohablantes:
        </p>
        <p>
          Los días naturales abarcan absolutamente todos los días que componen el año civil, de lunes a domingo,
          incluyendo festivos nacionales, autonómicos y locales. Salvo indicación expresa en contrario, los plazos
          civiles de prescripción de contratos de arrendamiento, garantías de compraventa comercial o períodos de prueba
          fijados en días naturales se cuentan de corrido sin interrupción alguna. Si firmas un contrato de alquiler de
          maquinaria por quince días naturales un 1 de julio, el contrato expira el 16 de julio sin importar los fines de
          semana intermedios.
        </p>
        <p>
          Los días hábiles administrativos, por su parte, siguen una disciplina muy distinta. En España, el artículo 30
          de la Ley 39/2015 del Procedimiento Administrativo Común supuso una revolución al equiparar los sábados a los
          domingos. Por tanto, son días hábiles administrativos de lunes a viernes, excluyendo sábados, domingos y
          festivos oficiales. Siempre que la Administración conceda un plazo expresado en días sin especificar nada más,
          la ley presume de forma automática que son días hábiles.
        </p>
        <p>
          Los días laborables empresariales representan las jornadas en que una empresa o sector productivo presta
          efectivamente sus servicios. En los convenios colectivos, las vacaciones anuales retribuidas suelen pactarse
          en 30 días naturales o en su equivalente habitual de 22 días laborables.
        </p>

        <h3>El cómputo administrativo en la Ley 39/2015: dies a quo y dies ad quem</h3>
        <p>
          El cómputo de plazos oficiales cuenta con principios jurídicos muy precisos que evitan discrepancias en
          recursos y alegaciones frente a los organismos públicos:
        </p>
        <p>
          El día inicial del cómputo (<em>dies a quo</em>) nunca coincide con el día en que recibes una notificación en
          mano o accedes a una notificación electrónica de la Agencia Tributaria o de la Seguridad Social. El cómputo
          arranca siempre a partir del día siguiente hábil. Si una notificación llega un viernes por la tarde, el primer
          día de tu plazo no será el sábado ni el domingo, sino el lunes siguiente hábil.
        </p>
        <p>
          El día de vencimiento (<em>dies ad quem</em>) depende de cómo se formule el plazo legal. En los plazos fijados en
          días, se van sumando los días hábiles uno por uno, saltándose los fines de semana y festivos hasta agotar la
          cifra concedida, como los diez o quince días hábiles habituales para formular alegaciones o subsanar
          solicitudes.
        </p>
        <p>
          En los plazos fijados en meses o años, el cómputo se realiza estrictamente de fecha a fecha. Si te notifican una
          resolución sancionadora el 15 de marzo con un plazo de recurso de alzada de un mes, el plazo vence exactamente
          el 15 de abril. Si en el mes de vencimiento no existe un día equivalente, como ocurriría si recibes una
          notificación el 31 de enero, el plazo expira el último día de dicho mes, ya sea el 28 o 29 de febrero.
        </p>
        <p>
          Existe además una salvaguarda esencial para el administrado: la prórroga por día inhábil recogida en el
          artículo 30.5 de la ley. Si el último día del plazo coincide con un sábado, domingo o día festivo, el plazo se
          entiende prorrogado automáticamente hasta el primer día hábil siguiente a las 23:59 horas. Asimismo, si un día
          es festivo en el municipio del ciudadano o en la sede del órgano administrativo, se considera inhábil en todo
          caso para garantizar la igualdad de trato.
        </p>
      </div>
    </article>
  );
}

export function EsWeekArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Calculadora de Semanas entre Fechas: Semanas ISO, Proyectos y Gestación</h2>
        <p className="lead">
          Medir el tiempo en semanas ofrece una perspectiva mucho más práctica que hacerlo en días sueltos o en meses
          irregulares. La semana es el bloque de planificación universal por excelencia: estructura los calendarios
          laborales, los ciclos escolares, los sprints de desarrollo en proyectos tecnológicos y el seguimiento médico
          del embarazo.
        </p>
        <p>
          A pesar de ser una unidad cotidiana, calcular cuántas semanas exactas separan dos fechas del calendario
          presenta desafíos particulares. Los meses del año tienen duraciones dispares y los años no contienen un número
          exacto de semanas completas (365 días equivalen a 52 semanas y un día sobrante).
        </p>
        <p>
          Nuestra calculadora resuelve al instante la distancia entre dos fechas en semanas íntegras y días restantes,
          permitiéndote además sumar o restar semanas hacia adelante o hacia atrás para fijar entregas, calcular hitos de
          gestación y consultar el número oficial de semana bajo el estándar internacional ISO-8601.
        </p>

        <h3>El estándar internacional ISO-8601 y la regla del primer jueves</h3>
        <p>
          En el entorno industrial europeo, en la logística de transporte y en la gestión corporativa de nóminas y
          presupuestos, no se habla de fechas aleatorias sino de números de semana. Para que todas las empresas y
          organismos oficiales del mundo compartan el mismo criterio, la Organización Internacional de Normalización
          definió la norma ISO-8601.
        </p>
        <p>
          Este estándar establece dos reglas matemáticas inmutables:
        </p>
        <ul>
          <li>
            <strong>El inicio de la semana:</strong> Todas las semanas comienzan obligatoriamente en lunes a las 00:00
            horas y concluyen en domingo a las 23:59 horas.
          </li>
          <li>
            <strong>La definición de la Semana 1 del año:</strong> La primera semana de cualquier año natural es aquella
            que contiene la mayor parte de sus días dentro de enero. En términos matemáticos estrictos, la Semana 1 es la
            que incluye el primer jueves de enero, o de forma equivalente, la que contiene el 4 de enero.
          </li>
        </ul>
        <p>
          Esta regla evita cualquier ambigüedad. Si el 1 de enero cae en viernes, sábado o domingo, esos primeros días del
          año pertenecen formalmente a la última semana (la semana 52 o 53) del año precedente.
        </p>
        <p>
          Un año solar ordinario consta de 52 semanas y un día adicional, mientras que los años bisiestos tienen 52
          semanas y dos días de excedente. Debido a esta pequeña desviación acumulativa, aproximadamente cada cinco o seis
          años el calendario gregoriano produce un año excepcional de 53 semanas completas. Esto sucede cuando el año
          comienza en jueves, o cuando se trata de un año bisiesto que arranca en miércoles.
        </p>

        <h3>Planificación ágil de proyectos y diagramas de Gantt</h3>
        <p>
          Dentro de la gestión moderna de proyectos, la semana representa el bloque operativo fundamental. Los marcos de
          trabajo ágiles como Scrum organizan sus entregas en iteraciones de dos semanas (conocidas como sprints), lo que
          facilita medir la velocidad de trabajo y estimar plazos realistas con los clientes.
        </p>
        <p>
          Al diseñar diagramas de Gantt para obras civiles o licitaciones públicas, la granularidad semanal permite
          coordinar proveedores, compras de materiales y certificaciones sin perderse en el detalle excesivo del día a
          día ni en la vaguedad del mes natural.
        </p>
        <p>
          Nuestra calculadora permite sumar bloques de 2, 4, 12 o 52 semanas a la fecha de inicio del proyecto para
          prever fechas de entrega y vencimientos con total seguridad.
        </p>

        <h3>La cronología obstétrica: la regla de Naegele y las semanas de embarazo</h3>
        <p>
          En la medicina obstétrica y ginecológica en España, el embarazo nunca se contabiliza en meses civiles, sino
          estrictamente en semanas completas y días transcurridos desde la Fecha de la Última Menstruación (FUM).
        </p>
        <p>
          Para calcular la Fecha Probable de Parto (FPP), la Sociedad Española de Ginecología y Obstetricia (SEGO) y la
          práctica clínica internacional aplican la célebre Regla de Naegele. Esta fórmula matemática asume un ciclo
          ovulatorio regular de 28 días y añade 280 días (exactamente 40 semanas completas) a la fecha de la última regla.
        </p>
        <p>
          El desarrollo fetal se divide en tres trimestres clínicos bien diferenciados:
        </p>
        <ul>
          <li>
            <strong>Primer trimestre (semanas 1 a 13):</strong> Abarca la formación de los órganos vitales y la
            ecografía del primer trimestre entre las semanas 11 y 13+6, donde se mide la longitud cráneo-caudal (LCC)
            del feto para confirmar o reajustar la edad gestacional exacta.
          </li>
          <li>
            <strong>Segundo trimestre (semanas 14 a 27):</strong> Fase de crecimiento rápido y maduración de los sistemas
            corporales, culminando en la ecografía morfológica de la semana 20.
          </li>
          <li>
            <strong>Tercer trimestre (semana 28 hasta el parto):</strong> Periodo de ganancia de peso y preparación
            pulmonar para la vida extrauterina, considerándose un embarazo a término entre las semanas 37 y 42.
          </li>
        </ul>
      </div>
    </article>
  );
}

export function EsDateArticle({ seo }: { seo?: { canonical?: string; path?: string } } = {}) {
  if (seo?.canonical?.includes('week') || seo?.path?.includes('week')) {
    return <EsWeekArticle />;
  }
  return <EsDaysArticle />;
}

export function EsHourArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Calculadora de Horas Trabajadas: Control Horario, Descansos y Turnos Nocturnos</h2>
        <p className="lead">
          Llevar un control riguroso de las horas trabajadas ha dejado de ser una simple buena costumbre organizativa
          para convertirse en una exigencia legal prioritaria. En España, desde la entrada en vigor del Real
          Decreto-ley 8/2019 que modificó el artículo 34 del Estatuto de los Trabajadores, todas las empresas están
          obligadas a registrar diariamente la hora exacta de inicio y finalización de la jornada laboral de cada
          empleado.
        </p>
        <p>
          Tanto para trabajadores por cuenta ajena como para autónomos y profesionales que facturan sus servicios por
          horas, calcular con exactitud la jornada efectiva evita disputas salariales y sanciones laborales.
        </p>
        <p>
          Nuestra calculadora permite determinar al minuto el tiempo neto trabajado entre tu hora de entrada y tu hora de
          salida, descontando pausas de comida o descansos no remunerados, resolviendo automáticamente los turnos
          nocturnos que cruzan la medianoche y entregando el resultado en horas estándar y en formato decimal para
          facilitar la confección de nóminas y facturas.
        </p>

        <h3>Cómo resolver el cruce de medianoche en turnos nocturnos</h3>
        <p>
          Uno de los errores más comunes al calcular horas en plantillas caseras surge en los turnos de noche. Si un
          empleado entra a trabajar a las 22:00 horas y finaliza su turno a las 06:00 horas del día siguiente, una resta
          matemática directa arroja un resultado negativo absurdo (-16 horas).
        </p>
        <p>
          Para resolver esta discontinuidad temporal, el cálculo debe sumar 24 horas a la hora de salida siempre que esta
          sea numéricamente inferior a la hora de entrada. De esta forma, las 06:00 horas se transforman en las 30:00
          horas del día anterior, permitiendo que la resta (30:00 - 22:00) determine con precisión que se han trabajado
          8 horas completas.
        </p>
        <p>
          En el marco legal español, el artículo 36 del Estatuto de los Trabajadores define como trabajo nocturno aquel que
          se realiza entre las diez de la noche (22:00) y las seis de la mañana (06:00). La jornada laboral de los
          trabajadores nocturnos no puede exceder de ocho horas diarias de promedio en un período de quince días, y
          conlleva una retribución económica específica a través del plus de nocturnidad fijado en el convenio colectivo
          aplicable.
        </p>

        <h3>La gestión de las pausas y los descansos obligatorios</h3>
        <p>
          La normativa laboral española establece tiempos mínimos de descanso que protegen la salud de la plantilla y
          delimitan qué se considera tiempo de trabajo efectivo:
        </p>
        <p>
          El descanso durante la jornada continua está fijado en el artículo 34.4 del Estatuto de los Trabajadores.
          Siempre que la jornada diaria continuada supere las seis horas de duración, debe establecerse una pausa no
          inferior a quince minutos (la habitual pausa para el café o el bocadillo). Este tiempo solo computa como trabajo
          remunerado si así lo contempla expresamente el convenio colectivo o el contrato individual. En caso contrario,
          debe descontarse de la jornada para obtener las horas efectivas.
        </p>
        <p>
          El descanso entre jornadas exige que medien al menos doce horas ininterrumpidas entre el final de una jornada y
          el inicio de la siguiente (artículo 34.3 del Estatuto). Asimismo, el descanso semanal mínimo es de día y medio
          ininterrumpido (36 horas), acumulable por períodos de hasta catorce días.
        </p>
        <p>
          Nuestra calculadora incorpora un campo específico para deducir cualquier pausa o tiempo de comida (por
          ejemplo, 30, 45 o 60 minutos), calculando automáticamente las horas netas reales.
        </p>

        <h3>El paso decisivo: convertir horas y minutos a horas decimales</h3>
        <p>
          Para liquidar una nómina, calcular horas extraordinarias o emitir una factura por honorarios profesionales,
          las horas de reloj no pueden multiplicarse directamente por la tarifa pactada.
        </p>
        <p>
          El reloj utiliza el sistema sexagesimal de base 60, mientras que el dinero se rige por el sistema decimal de
          base 100. Si una persona trabaja 7 horas y 30 minutos a 20 euros la hora y multiplica 7,30 por 20, obtendrá
          erróneamente 146 euros. La cuenta real exige convertir los 30 minutos dividiéndolos entre 60 (30 / 60 = 0,50),
          obteniendo 7,50 horas decimales que multiplicadas por 20 euros arrojan los 150 euros correctos.
        </p>
        <p>
          Nuestra herramienta realiza esta conversión automática con cuatro decimales de precisión, garantizando que el
          total facturado o retribuido coincida al céntimo.
        </p>
      </div>
    </article>
  );
}

export function EsMinutesHoursArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Conversor de Minutos a Horas: Horas Decimales y Reloj Sexagesimal</h2>
        <p className="lead">
          Convertir minutos a horas parece un ejercicio elemental de primaria, pero en la gestión laboral diaria, la
          contabilidad de autónomos y la liquidación de nóminas, es el origen de miles de euros en errores de
          facturación cada mes.
        </p>
        <p>
          La raíz del problema radica en una colisión matemática clásica: los relojes y cronómetros miden el tiempo en
          el sistema sexagesimal de base 60, mientras que el dinero, las hojas de cálculo y los sistemas contables
          funcionan en el sistema decimal de base 100.
        </p>
        <p>
          Confundir ambos formatos provoca desfases inmediatos. Si un profesional trabaja una hora y media y anota 1,30
          horas en su factura multiplicando por una tarifa de 30 euros la hora, cobrará 39 euros en lugar de los 45
          euros que legítimamente le corresponden (1,50 horas por 30 euros).
        </p>
        <p>
          Nuestra herramienta resuelve esta conversión al instante, transformando cualquier cifra de minutos en su
          desglose en horas y minutos de reloj, horas decimales exactas para nóminas y segundos totales acumulados.
        </p>

        <h3>La matemática de la conversión: de base 60 a base 100</h3>
        <p>
          Para entender por qué se producen estos desajustes, conviene desglosar las dos operaciones matemáticas que
          intervienen según el resultado que busques:
        </p>
        <p>
          <strong>1. Pasar de minutos totales a horas y minutos de reloj (HH:MM):</strong> Si tienes una cifra acumulada
          de minutos (por ejemplo, 195 minutos) y deseas saber cuántas horas y minutos de reloj representa, debes
          realizar una división euclídea entera entre 60. El cociente entero de la división indica las horas completas
          transcurridas, mientras que el residuo o resto matemático señala los minutos sobrantes. Al dividir 195 entre 60,
          obtenemos un cociente de 3 y un resto de 15. Por consiguiente, 195 minutos equivalen exactamente a 3 horas y 15
          minutos (03:15).
        </p>
        <p>
          <strong>2. Pasar de minutos a horas decimales para facturación:</strong> En la gestión de nóminas y facturación
          de servicios, no puedes utilizar horas y minutos separados. Necesitas un número decimal único para
          multiplicarlo por el precio pactado por hora trabajada. Para obtener las horas decimales, se divide el total de
          minutos directamente entre 60 conservando todos los decimales. En el ejemplo anterior, 195 dividido entre 60
          arroja exactamente 3,25 horas decimales. Ese valor 3,25 es el que debe introducirse en el software de
          facturación o en la hoja de Excel para calcular el importe a cobrar.
        </p>

        <h3>La regla de los seis minutos en despachos profesionales y consultoría</h3>
        <p>
          En sectores donde el tiempo se factura con extrema minuciosidad, como los despachos de abogados corporativos,
          las grandes firmas de auditoría o los talleres mecánicos de automoción, se utiliza de forma generalizada el
          sistema de unidades de seis minutos.
        </p>
        <p>
          Dado que una hora contiene sesenta minutos, un bloque de seis minutos representa exactamente una décima de
          hora (6 / 60 = 0,10 horas decimales). Esto permite a los consultores y letrados computar sus tareas en
          incrementos de 0,1 horas:
        </p>
        <ul>
          <li>6 minutos equivalen a 0,10 horas.</li>
          <li>12 minutos equivalen a 0,20 horas.</li>
          <li>15 minutos equivalen a 0,25 horas (un cuarto de hora).</li>
          <li>30 minutos equivalen a 0,50 horas (media hora).</li>
          <li>45 minutos equivalen a 0,75 horas (tres cuartos de hora).</li>
        </ul>
        <p>
          Si un abogado dedica 24 minutos a redactar un contrato comercial, anota en su software de gestión 0,40 horas de
          trabajo sin necesidad de lidiar con números fraccionarios incómodos.
        </p>

        <h3>Cómo manejar minutos y horas en hojas de cálculo como Excel</h3>
        <p>
          Quienes gestionan partes de trabajo en hojas de cálculo suelen toparse con resultados desconcertantes si
          desconocen cómo almacena el tiempo el programa.
        </p>
        <p>
          Excel y Google Sheets no almacenan las horas como números absolutos, sino como fracciones de un día completo
          de 24 horas. Por esa razón, las 12:00 del mediodía equivalen internamente al número 0,50, y una jornada de 8
          horas equivale a 0,3333.
        </p>
        <p>
          Si en una celda tienes un formato de hora de reloj (por ejemplo, 07:30) y deseas multiplicarlo por el precio de
          la hora, debes multiplicar la celda obligatoriamente por 24 y cambiar el formato de la casilla a número común:
          <code>=A1 * 24</code>. De lo contrario, la fórmula devolverá una cifra diminuta e incomprensible.
        </p>
        <p>
          Nuestra calculadora en línea te ahorra todas estas complejidades técnicas, ofreciéndote la cifra lista para
          copiar y pegar en tus presupuestos y partes horarios.
        </p>
      </div>
    </article>
  );
}

export function EsTimeArticle({ seo }: { seo?: { canonical?: string; path?: string } } = {}) {
  if (seo?.canonical?.includes('minutes') || seo?.path?.includes('minutes')) {
    return <EsMinutesHoursArticle />;
  }
  return <EsHourArticle />;
}

export function EsTimeZoneArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Conversor de Zonas Horarias Mundiales: Husos Horarios y Horario de Verano</h2>
        <p className="lead">
          Coordinar una llamada de trabajo, un lanzamiento de producto digital o un viaje internacional entre distintos
          continentes es una fuente inagotable de despistes. No basta con memorizar que entre España y México hay varias
          horas de diferencia, porque esa distancia temporal no es constante a lo largo del año.
        </p>
        <p>
          El planeta está dividido teóricamente en veinticuatro husos horarios longitudinales de 15 grados cada uno, pero
          las decisiones políticas, los límites fronterizos y las normativas de ahorro energético han fragmentado ese
          mapa ideal en un complejo mosaico de normas locales.
        </p>
        <p>
          Nuestra calculadora de zonas horarias resuelve al segundo la hora exacta entre las principales capitales de
          España, Latinoamérica, Estados Unidos y el resto del mundo, ajustando de forma automática el horario de verano
          (DST) según la fecha elegida y avisándote con claridad si la conversión cruza la medianoche hacia el día
          anterior o posterior.
        </p>

        <h3>La singularidad horaria de España: de Madrid a Canarias</h3>
        <p>
          España presenta una situación horaria fascinante con raíces históricas y peculiaridades geográficas que
          conviene conocer:
        </p>
        <p>
          La península ibérica y las Islas Baleares se rigen por la Hora Central Europea (CET, equivalente a UTC+1 en
          invierno y a UTC+2 en verano). Geográficamente, por su longitud terrestre, a la España peninsular le
          correspondería el huso del meridiano de Greenwich (UTC+0), el mismo que utilizan el Reino Unido y Portugal.
          Sin embargo, en 1940 el gobierno español decidió adelantar los relojes una hora para sincronizarse con la hora
          oficial de Berlín y Europa central, una anomalía que perdura hasta el día de hoy y explica por qué en Galicia
          el sol se pone pasadas las diez de la noche en pleno verano.
        </p>
        <p>
          En el archipiélago canario rige el horario de Europa Occidental (WET, UTC+0 en invierno y UTC+1 en verano). Esta
          separación da origen a la clásica coletilla de los medios de comunicación españoles: «una hora menos en
          Canarias».
        </p>
        <p>
          En todo el territorio nacional se aplica la Directiva 2000/84/CE de la Unión Europea sobre el cambio de hora
          estacional. Los relojes se adelantan una hora el último domingo de marzo (a las dos de la madrugada pasan a ser
          las tres) y se atrasan una hora el último domingo de octubre (a las tres de la madrugada vuelven a ser las dos).
        </p>

        <h3>La brecha horaria flotante entre España y Latinoamérica</h3>
        <p>
          Durante muchos años, la mayoría de países hispanohablantes modificaban sus relojes dos veces al año. Sin
          embargo, las reformas legislativas recientes en América Latina han cambiado las reglas de juego, provocando el
          fenómeno de la diferencia horaria flotante:
        </p>
        <p>
          En México, a finales de 2022 entró en vigor una nueva Ley de Husos Horarios que eliminó definitivamente el
          horario de verano en casi todo el país, salvo en una estrecha franja de municipios fronterizos con Estados
          Unidos para preservar su coordinación aduanera. Ciudad de México permanece fija todo el año en la Zona Centro
          (UTC-6). Por esta razón, cuando en España peninsular rige el horario de invierno (UTC+1), la diferencia con
          Ciudad de México es de 7 horas; pero cuando España activa el horario de verano en marzo (UTC+2), la diferencia
          se amplía automáticamente a 8 horas completas.
        </p>
        <p>
          Colombia y Perú mantienen su huso inalterable en UTC-5 durante los doce meses del año. La diferencia con Madrid
          es de 6 horas en el invierno europeo y asciende a 7 horas durante el verano europeo.
        </p>
        <p>
          Argentina tampoco aplica cambios estacionales desde el año 2009, permaneciendo fija en UTC-3. Esto sitúa a
          Buenos Aires a 4 horas de distancia de Madrid en invierno y a 5 horas en verano.
        </p>
        <p>
          En contraste, Chile continúa aplicando cambios estacionales de horario, pero al estar situado en el hemisferio
          sur sus estaciones están invertidas. Cuando Chile pasa a su horario de invierno en abril (UTC-4), España acaba
          de entrar en su horario de verano (UTC+2), generando una brecha temporal que fluctúa entre 4, 5 y hasta 6 horas
          a lo largo del año según el mes de la consulta.
        </p>

        <h3>La ventana de oro para reuniones y el cruce de fecha</h3>
        <p>
          Trabajar en equipos multinacionales distribuidos exige identificar la denominada franja de solapamiento útil:
        </p>
        <p>
          Entre las 15:00 y las 19:00 horas de España peninsular se produce la coincidencia laboral perfecta con los
          países hispanoamericanos. En esa franja, en Ciudad de México son entre las 07:00 u 08:00 y las 11:00 de la
          mañana, en Bogotá y Lima entre las 09:00 y las 13:00, y en Buenos Aires entre las 11:00 y las 15:00 horas.
        </p>
        <p>
          Al coordinar agendas hacia Asia u Oceanía, como Tokio (UTC+9) o Sídney (UTC+10/11), el desfase suele traspasar la
          medianoche, lo que significa que mientras en Madrid es lunes por la tarde, en Japón ya es martes por la mañana
          (+1 día). Nuestra calculadora destaca siempre este cambio de fecha para que nunca reserves una videollamada en
          el día equivocado.
        </p>
      </div>
    </article>
  );
}
