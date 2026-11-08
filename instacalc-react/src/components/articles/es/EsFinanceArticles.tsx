export function EsCompoundArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Cómo exprimir el interés compuesto: la guía práctica para ver crecer tu dinero</h2>
        <p className="lead">
          El interés compuesto tiene fama de magia financiera. No hay ningún truco en él, solo una fórmula matemática
          implacable que premia la paciencia y castiga a quien pospone el ahorro.
        </p>
        <p>
          La idea de fondo es casi ridículamente sencilla: los intereses que ganas hoy no se van a tu cuenta corriente
          para gastarlos el fin de semana. Se quedan en la inversión. El mes siguiente, esos mismos intereses generan
          nuevos rendimientos junto a tu capital original. Al principio parece que no pasa nada. Los números apenas se
          mueven y la tentación de abandonar es enorme. Pero si mantienes el rumbo diez o quince años, la curva se empina
          de repente y las ganancias anuales empiezan a superar con creces a tu propio sueldo ahorrado.
        </p>

        <h3>La fórmula sin rodeos técnicos</h3>
        <p>
          Para calcular cuánto dinero acumularás al cabo de varios años sin aportaciones intermedias, la matemática
          clásica utiliza esta ecuación:
        </p>
        <p>
          <strong>A = P × (1 + r / n)^(n × t)</strong>
        </p>
        <ul>
          <li>
            <strong>P:</strong> Capital inicial depositado al comenzar (por ejemplo, 5.000 €).
          </li>
          <li>
            <strong>r:</strong> Tipo de interés o rentabilidad anual en tanto por uno (un 7 % se escribe 0,07).
          </li>
          <li>
            <strong>n:</strong> Frecuencia con que se liquidan los intereses al año (12 mensual, 4 trimestral, 1 anual).
          </li>
          <li>
            <strong>t:</strong> Tiempo total medido en años de inversión continua.
          </li>
        </ul>
        <p>
          Cuando sumas aportaciones mensuales fijas (la forma en que ahorra casi cualquier persona con nómina), la
          fórmula añade el valor futuro de una anualidad constante. Esta calculadora resuelve esa suma en tiempo real
          para que no tengas que pelearte con exponentes ni fracciones complejas.
        </p>

        <h3>Un ejemplo con números reales sobre la mesa</h3>
        <p>
          Imagina dos personas de 28 años: Lucía y Marcos.
        </p>
        <p>
          Lucía empieza hoy con 3.000 € y programa una transferencia automática de 150 € cada mes hacia una cartera
          diversificada de fondos indexados globales. Supongamos un rendimiento medio del 7 % anual. Al cabo de 20 años,
          Lucía habrá puesto de su bolsillo exactamente 39.000 €. Sin embargo, su saldo final rondará los 82.500 €. Más de
          la mitad de su patrimonio final son beneficios puros generados por el interés compuesto.
        </p>
        <p>
          Marcos decide esperar. Prefiere disfrutar su dinero ahora y empezar a los 38 años, diez años más tarde que
          Lucía. Para intentar alcanzarla, aporta el doble: 300 € al mes durante 10 años. A los 48 años, Marcos ha puesto
          exactamente los mismos 39.000 € que Lucía. ¿Su saldo final? Apenas 51.500 €.
        </p>
        <p>
          Lucía le saca más de 30.000 € de ventaja habiendo puesto la misma cantidad de dinero. Ese es el precio de
          esperar diez años. El tiempo hace el trabajo pesado, no la cantidad que metes el último año.
        </p>

        <h3>Los tres frenos invisibles que las calculadoras tradicionales callan</h3>
        <p>
          Casi cualquier simulador que encuentres por internet dibuja una curva suave y perfecta hacia arriba. En la vida
          real hay tres factores que muerden esa curva si no los vigilas de cerca:
        </p>
        <ul>
          <li>
            <strong>La mordida de los impuestos anuales:</strong> Si inviertes en una cuenta que te paga intereses cada mes
            o en acciones con dividendos en efectivo, pagas impuestos cada ejercicio (en España, entre el 19 % y el 28 %
            en las rentas del ahorro). Eso corta de raíz el efecto multiplicador. En cambio, con fondos de inversión de
            acumulación, las ganancias se reinvierten automáticamente sin pasar por el fisco hasta el día en que decides
            vender.
          </li>
          <li>
            <strong>Las comisiones bancarias abusivas:</strong> Un fondo tradicional con una comisión de gestión del
            1,70 % anual parece inofensivo sobre el papel. En un plazo de 25 años, esa comisión aparentemente pequeña se
            queda con más de un tercio de todo lo que habrías ganado. Busca vehículos de inversión con comisiones por
            debajo del 0,30 %.
          </li>
          <li>
            <strong>La inflación acumulada:</strong> Un capital de 100.000 € dentro de 25 años no comprará lo mismo que
            hoy. Con una inflación media del 2,5 %, su poder adquisitivo real equivaldrá a unos 54.000 € actuales. Por eso
            conviene simular rentabilidades netas de inflación (en torno al 4 % o 5 % real) para no hacerte ilusiones
            falsas.
          </li>
        </ul>

        <h3>La regla del 72 para hacer cuentas de cabeza</h3>
        <p>
          Si quieres saber cuántos años tardará tu dinero en duplicarse sin tocar la calculadora, divide 72 entre tu
          rentabilidad anual esperada:
        </p>
        <ul>
          <li>Al 4 % anual (un buen depósito o bono garantizado): 72 / 4 = 18 años para duplicar.</li>
          <li>Al 7 % anual (renta variable diversificada a largo plazo): 72 / 7 ≈ 10 años para duplicar.</li>
          <li>Al 10 % anual (renta variable histórica agresiva): 72 / 10 ≈ 7,2 años para duplicar.</li>
        </ul>
        <p>
          No es exacta al céntimo, pero clava el orden de magnitud para planificar objetivos de jubilación o compra de
          vivienda en dos segundos.
        </p>
      </div>
    </article>
  );
}

export function EsSimpleInterestArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Interés simple en la práctica: cómo calcularlo sin trampas financieras</h2>
        <p className="lead">
          El interés simple es la forma más honesta y directa de calcular el coste de un dinero prestado. Sin
          reinversiones ocultas, sin curvas exponenciales y sin sorpresas a final de mes.
        </p>
        <p>
          A diferencia del interés compuesto, donde cada euro ganado pasa a generar nuevos intereses en una bola de nieve
          continua, en el interés simple el rendimiento se calcula siempre sobre el capital original. Si prestas 10.000 €
          al 4 % anual durante tres años, cobrarás exactamente 400 € el primer año, 400 € el segundo y 400 € el tercero.
          Ni un céntimo más, ni un céntimo menos. La deuda o la ganancia avanza en una línea recta perfecta.
        </p>

        <h3>La fórmula básica y cómo fraccionar el tiempo</h3>
        <p>
          La ecuación matemática fundamental solo tiene tres elementos:
        </p>
        <p>
          <strong>I = P × r × t</strong> {" · "} <strong>Monto total (M) = P + I</strong>
        </p>
        <ul>
          <li>
            <strong>P (Principal):</strong> El dinero que prestas o depositas inicialmente (por ejemplo, 6.000 €).
          </li>
          <li>
            <strong>r (Tipo de interés anual):</strong> La tasa en tanto por uno (un 5 % anual se escribe 0,05).
          </li>
          <li>
            <strong>t (Tiempo en años):</strong> El plazo durante el cual el dinero está prestado.
          </li>
        </ul>
        <p>
          El tropiezo más habitual ocurre cuando el plazo no coincide con años completos. Si el acuerdo dura seis meses,
          el tiempo no es 6, sino 6 / 12 = 0,5 años. Si el plazo se cuenta por días (la práctica estándar en pagarés
          bancarios, Letras del Tesoro y retrasos de facturas), debes dividir los días transcurridos entre la base anual:
        </p>
        <ul>
          <li>
            <strong>Año natural (base 365 días):</strong> Utilizado en préstamos personales y deuda pública en la
            mayoría de países europeos.
          </li>
          <li>
            <strong>Año comercial (base 360 días):</strong> La vieja convención bancaria que asume doce meses idénticos
            de 30 días para simplificar cuentas mercantiles. En periodos cortos arroja un interés ligeramente superior al
            natural.
          </li>
        </ul>

        <h3>Dónde se utiliza el interés simple en la vida real</h3>
        <p>
          Mucha gente cree que el interés simple es solo un ejercicio escolar que nadie usa fuera del aula. La realidad
          es justo la contraria. Gobierna tres operaciones cotidianas de enorme peso económico:
        </p>

        <h4>1. Préstamos entre familiares o amigos sin sustos con Hacienda</h4>
        <p>
          Cuando prestas dinero a tu hijo para comprar un coche o a un hermano para la entrada de una vivienda, lo normal
          es no querer cobrarle intereses abusivos. De hecho, puedes fijar un interés del 0 % legalmente.
        </p>
        <p>
          Ahora bien, cuidado con las prisas. Si transfieres 20.000 € sin un contrato por escrito, la Agencia Tributaria
          puede sospechar que se trata de una donación encubierta y reclamar el Impuesto de Sucesiones y Donaciones. Para
          blindar la operación basta con redactar un contrato privado donde figuren los DNIs, la cuenta bancaria de
          origen, el calendario de devolución y la indicación expresa de interés simple (sea al 0 % o a una tasa módica).
          Después presentas el Modelo 600 ante tu comunidad autónoma; está totalmente exento de pago de impuestos, pero
          deja constancia oficial del préstamo.
        </p>

        <h4>2. Letras del Tesoro y pagarés de empresa</h4>
        <p>
          La deuda pública a corto plazo (a 3, 6, 9 o 12 meses) no paga cupones periódicos. Se emite al descuento.
          Compras una Letra con valor nominal de 1.000 € pagando por ejemplo 970 € el día de la subasta, y el Estado te
          devuelve los 1.000 € íntegros al vencimiento. Esos 30 € de beneficio se liquidan matemáticamente bajo el
          régimen de interés simple debido a su corta duración.
        </p>

        <h4>3. Facturas comerciales impagadas e interés legal de demora</h4>
        <p>
          Si un cliente tarda meses en pagar una factura profesional, la legislación mercantil te permite exigir
          intereses de demora calculados con interés simple diario sobre el importe neto adeudado. Se aplica el tipo
          oficial fijado semestralmente por el Banco Central o el interés legal del dinero, sin capitalización sobre
          retrasos previos.
        </p>
      </div>
    </article>
  );
}

export function EsEmiArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Calculadora de préstamos y cuota mensual: la verdad sobre la amortización francesa</h2>
        <p className="lead">
          Pedir un préstamo es comprometer una parte de tu trabajo futuro. Cuando firmas un crédito personal o la
          financiación de un coche, el banco te suele hablar únicamente de la cuota mensual para que te parezca asumible.
          Pero la cuota es solo la punta del iceberg.
        </p>
        <p>
          En España y en la inmensa mayoría de países hispanohablantes, los préstamos funcionan bajo el{" "}
          <strong>sistema de amortización francés</strong>. Su gran ventaja sobre el papel es la tranquilidad: pagas
          exactamente la misma cantidad cada mes si el tipo de interés es fijo. Sin embargo, su mecánica interna esconde
          un reparto asimétrico que conviene entender antes de estampar la firma.
        </p>

        <h3>Cómo funciona por dentro el sistema francés de amortización</h3>
        <p>
          Cada mensualidad que pagas se divide en dos trozos: una parte amortiza capital (reduce tu deuda real) y otra
          parte paga intereses al banco.
        </p>
        <p>
          La cuota mensual constante (<strong>C</strong>) se calcula mediante la fórmula financiera:
        </p>
        <p>
          <strong>C = P × [r / (1 - (1 + r)^(-n))]</strong>
        </p>
        <ul>
          <li>
            <strong>P:</strong> Capital total que te presta el banco (por ejemplo, 15.000 €).
          </li>
          <li>
            <strong>r:</strong> Tipo de interés mensual (el TIN anual dividido entre 12; un 7,2 % anual equivale a 0,006
            mensual).
          </li>
          <li>
            <strong>n:</strong> Número total de meses pactados (5 años son 60 meses).
          </li>
        </ul>
        <p>
          Lo crucial de este método es que los intereses de cada mes se calculan sobre el{" "}
          <strong>capital vivo pendiente</strong>. Como al principio debes todo el dinero, la factura de intereses es
          enorme y solo una pequeña fracción de tu cuota sirve para bajar la deuda. A medida que pasan los años y la deuda
          mengua, los intereses caen en picado y casi toda tu cuota mensual va directa a liquidar capital.
        </p>

        <h3>El espejismo del plazo: el coste real de una cuota cómoda</h3>
        <p>
          El error más extendido al solicitar financiación es alargar el plazo para pagar una mensualidad más baja. Parece
          un alivio. No lo es.
        </p>
        <p>
          Veamos los números fríos con un ejemplo real: necesitas 15.000 € para cambiar de vehículo a un TIN del 7,5 %.
        </p>
        <ul>
          <li>
            <strong>Opción A (plazo a 4 años, 48 meses):</strong> Pagas una cuota de 362 € al mes. Al terminar los
            cuatro años habrás devuelto los 15.000 € más 2.410 € de intereses totales.
          </li>
          <li>
            <strong>Opción B (plazo a 8 años, 96 meses):</strong> La cuota baja a unos tentadores 208 € al mes. Sin
            embargo, al finalizar los ocho años habrás pagado más de 5.020 € de intereses.
          </li>
        </ul>
        <p>
          Haz cuentas. Al duplicar el plazo, el coche te cuesta 2.610 € más de intereses limpios por el simple hecho de
          aplazar la devolución. Una cuota mensual desahogada sale carísima. Mucho ojo con los concesionarios que te
          exigen financiar a diez años para aplicarte un supuesto descuento en el precio de venta; el sobrecoste
          financiero suele duplicar con creces la rebaja inicial.
        </p>

        <h3>Amortización anticipada: ¿reducir cuota o acortar plazo?</h3>
        <p>
          Si ahorras algo de dinero y decides devolver parte de tu préstamo antes de tiempo, el banco te preguntará si
          prefieres bajar tu cuota mensual o recortar meses de contrato. Hay un debate eterno aquí:
        </p>
        <ul>
          <li>
            <strong>Acortar plazo:</strong> Es la opción financieramente superior si buscas ahorrar dinero. Al eliminar
            los meses finales, dejas de pagar los intereses asociados a ese tiempo y recortas al máximo la factura global.
            Punto.
          </li>
          <li>
            <strong>Reducir cuota:</strong> Mantienes la misma fecha de finalización pero rebajas tu compromiso mensual.
            Te da oxígeno y tranquilidad si tu presupuesto va justo, aunque el ahorro total de intereses es menor que en
            el recorte de plazo.
          </li>
        </ul>
        <p>
          Como regla general de solvencia, procura que la suma de todos tus préstamos (coche, compras a plazos y
          tarjetas) junto con el alquiler o la hipoteca nunca rebase el{" "}
          <strong>30 % o 35 % de tus ingresos netos mensuales</strong>. Rebasar ese límite te deja en una posición muy
          frágil ante cualquier imprevisto laboral o familiar. Si estás por encima del 40 %, estás en zona de peligro
          financiero.
        </p>
      </div>
    </article>
  );
}

export function EsMortgageArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Calculadora de hipoteca: el desglose real de cuota, entrada y gastos de compra</h2>
        <p className="lead">
          Comprar una casa es, para casi cualquiera, el compromiso económico más grande de toda su vida. Cuando entras
          en la oficina del banco o miras un portal inmobiliario, todo el mundo te habla de la cuota mensual. Te dicen
          que pagar 650 € al mes es más barato que un alquiler. Lo que nadie te cuenta de entrada es que el precio del
          anuncio es solo el principio de la cuenta.
        </p>
        <p>
          Para comprar una vivienda con cabeza necesitas resolver dos números clave: cuánto dinero líquido debes tener
          ahorrado hoy en tu cuenta corriente y cuál será el desembolso mensual real sumando comunidad, seguros e
          impuestos.
        </p>

        <h3>La regla del 20 % más el 10 % de gastos iniciales</h3>
        <p>
          El primer jarro de agua fría al buscar hipoteca llega con el ahorro previo. Los bancos conceden, salvo
          excepciones contadas para funcionarios o perfiles muy solventes, como máximo el{" "}
          <strong>80 % del valor de compraventa o de tasación</strong> (el menor de los dos importes).
        </p>
        <p>
          Eso significa dos cosas que debes tener muy claras:
        </p>
        <ul>
          <li>
            <strong>La entrada (el 20 %):</strong> Si el piso cuesta 200.000 €, tienes que poner 40.000 € de tu propio
            bolsillo desde el minuto uno.
          </li>
          <li>
            <strong>Los gastos e impuestos de compraventa (entre el 8 % y el 12 % adicional):</strong> En España, si la
            vivienda es de segunda mano pagarás el Impuesto de Transmisiones Patrimoniales (ITP), que oscila entre el 6 % y
            el 10 % según tu comunidad autónoma (Madrid aplica el 6 %, Cataluña o la Comunidad Valenciana el 10 %). Si la
            vivienda es de obra nueva, pagarás el 10 % de IVA más el impuesto de Actos Jurídicos Documentados (AJD). Añade
            unos 1.500 € o 2.000 € más entre notaría, registro de la propiedad y la tasación obligatoria del inmueble (unos
            350 € a 500 €).
          </li>
        </ul>
        <p>
          En resumen: para un piso modesto de 200.000 € necesitas tener en el banco cerca de{" "}
          <strong>60.000 € en efectivo</strong> antes de que el banco te firme la hipoteca. No tener ese colchón previo
          es el motivo por el que se caen ocho de cada diez operaciones hipotecarias de compradores primerizos.
        </p>

        <h3>Fija, variable o mixta: cómo elegir sin jugar a la ruleta</h3>
        <p>
          No hay una hipoteca perfecta para todo el mundo. Hay una hipoteca adecuada para tu tolerancia al insomnio
          financiero.
        </p>
        <p>
          Si buscas estabilidad absoluta, la hipoteca a tipo fijo es tu opción. Pagas religiosamente la misma cuota
          durante 25 o 30 años. Da igual que el Euríbor suba al 5 % o se hunda al 0 %. Si tu sueldo es predecible y no
          quieres sobresaltos en tu presupuesto familiar, la paz mental compensa con creces pagar unas décimas más al
          inicio.
        </p>
        <p>
          En cambio, la hipoteca variable se compone de un diferencial fijo más el Euríbor (por ejemplo, Euríbor +
          0,75 %). Si el Euríbor cae, tu cuota baja y ahorras dinero. Pero si sube como ocurrió en 2022 y 2023, tu
          mensualidad puede encarecerse 200 € o 300 € de golpe de un año a otro. Solo encaja si tienes margen de ahorro
          holgado para encajar subidas bruscas sin ahogarte.
        </p>
        <p>
          La hipoteca mixta se ha convertido en la gran favorita reciente. Te ofrece un tipo fijo muy competitivo durante
          los primeros 5 o 10 años (el periodo en el que más intereses pagas según el sistema francés) y pasa a variable en
          el tramo final, cuando la deuda pendiente ya es pequeña y las oscilaciones del Euríbor hacen mucho menos daño.
        </p>

        <h3>El coste real de la vivienda más allá de la letra del banco</h3>
        <p>
          El cálculo no termina en capital e intereses. Para saber si una casa encaja en tus cuentas mensuales, debes
          sumar tres costes fijos que todo propietario soporta.
        </p>
        <p>
          Empieza por el Impuesto sobre Bienes Inmuebles (IBI), que supone entre 300 € y 900 € al año según el municipio y
          el valor catastral del piso. Suma luego el seguro de hogar. Aunque el banco solo te exija una póliza básica de
          incendios, cualquier comprador sensato contrata cobertura multirriesgo de continente y contenido (entre 200 € y
          450 € anuales). Tampoco olvides la cuota de la comunidad de vecinos, que va desde 40 € al mes en una finca
          sencilla hasta más de 180 € mensuales si hay conserje o calefacción central.
        </p>
        <p>
          La regla de oro bancaria recomienda que la cuota hipotecaria más tus otros préstamos personales nunca supere el{" "}
          <strong>30 % o 35 % de los ingresos netos de la unidad familiar</strong>. Si entre los dos miembros de la
          pareja ingresáis 3.000 € netos al mes, vuestra cuota hipotecaria máxima prudente debería situarse en torno a los
          900 € o 1.000 €. Superar ese listón es comprar dolores de cabeza a treinta años vista.
        </p>
      </div>
    </article>
  );
}

export function EsSipArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Inversión periódica mensual (DCA): cómo multiplicar tu ahorro en fondos indexados</h2>
        <p className="lead">
          Invertir todo tu dinero de golpe da vértigo. Metes tus ahorros hoy y mañana la bolsa cae un 5 % por una noticia
          política. Te entra el pánico, vendes con pérdidas y juras no volver a acercarte a los mercados financieros
          jamás. Es la historia más repetida entre inversores principiantes.
        </p>
        <p>
          Para esquivar esa trampa psicológica existe una estrategia extraordinariamente sencilla: la inversión periódica
          mensual, conocida en el mundo financiero como <strong>Dollar-Cost Averaging (DCA)</strong>. En lugar de jugar a
          ser adivino intentando comprar en el punto más bajo del año, programas una cantidad fija de dinero (por ejemplo,
          150 € o 300 €) que se transfiere automáticamente a tu cartera de fondos indexados o ETFs todos los meses,
          llueva o haga sol.
        </p>

        <h3>La matemática del promediado de costes: cómo hacer de la volatilidad tu aliada</h3>
        <p>
          Cuando aportas siempre el mismo dinero con disciplina mensual, la volatilidad deja de ser un monstruo y pasa a
          trabajar a tu favor.
        </p>
        <p>
          Supón que compras participaciones de un fondo global con 200 € al mes:
        </p>
        <ul>
          <li>
            Si el mercado está en máximos y la participación cotiza a 50 €, tus 200 € compran exactamente 4 participaciones.
          </li>
          <li>
            Si el mercado sufre una corrección y la participación se desploma a 25 €, tus mismos 200 € compran de golpe 8
            participaciones completas.
          </li>
        </ul>
        <p>
          Sin hacer nada especial ni consultar gráficos técnicos a diario, compras pocas participaciones cuando la bolsa
          está cara y acumulas muchas más participaciones cuando está de rebajas. A largo plazo, el coste medio por
          participación que pagas resulta mucho más bajo que la media aritmética de los precios del mercado. Se elimina el
          estrés del cuándo entrar.
        </p>

        <h3>El efecto multiplicador del Step-Up (aportaciones crecientes)</h3>
        <p>
          La mayoría de simuladores de internet calculan una aportación fija e inamovible durante treinta años. Pero tu
          vida no es estática. A medida que pasan los años ganas experiencia laboral, asciendes en tu empresa o terminas
          de pagar deudas.
        </p>
        <p>
          Si aumentas tu aportación mensual un modesto 5 % o 10 % cada año (acompañando la subida de tu nómina o la
          inflación), los resultados se multiplican de forma espectacular:
        </p>
        <ul>
          <li>
            <strong>Aportando 200 € fijos al mes al 7 % durante 25 años:</strong> Aportas de tu bolsillo 60.000 € y
            acumulas un patrimonio final cercano a los 162.000 €.
          </li>
          <li>
            <strong>Aportando 200 € iniciales con un incremento anual del 5 % (Step-Up):</strong> Aportas 114.000 € y tu
            cartera final supera los 275.000 €.
          </li>
        </ul>
        <p>
          Ese pequeño incremento anual apenas se nota en tu bolsillo mes a mes, pero añade más de 110.000 € limpios a tu
          jubilación.
        </p>

        <h3>El gran peligro psicológico: detener las aportaciones en plena caída</h3>
        <p>
          El talón de Aquiles de la inversión periódica no está en las matemáticas. Está en tu cabeza.
        </p>
        <p>
          Cuando las noticias anuncian caídas del 20 % en los telediarios y tus amigos dicen que van a esperar a que la
          tormenta pase, el impulso instintivo es pulsar el botón de pausa en tu aplicación bancaria. Es el peor error
          posible. Si detienes tus compras mensuales cuando los precios bajan, renuncias precisamente al beneficio del
          promediado de costes. Comprarás cuando todo esté caro y te asustarás cuando esté barato.
        </p>
        <p>
          Para que el DCA funcione de verdad, tienes que automatizar el proceso y olvidarte de mirar las cotizaciones cada
          semana. La riqueza a largo plazo no se construye acertando el día perfecto de entrada; se forja comprando
          pacientemente mes a mes mientras el resto del mundo entra en histeria.
        </p>

        <h3>El hábito del preahorro y la fiscalidad en España</h3>
        <p>
          Para que la inversión periódica funcione sin esfuerzo de fuerza de voluntad, debes aplicar el principio del{" "}
          <strong>preahorro</strong>. Consiste en programar una orden de transferencia automática el día 1 o 2 de cada mes,
          justo después de cobrar tu sueldo. Si esperas a final de mes para invertir lo que sobre, nunca sobrará nada; el
          dinero disponible en la cuenta corriente tiende a evaporarse en gastos prescindibles.
        </p>
        <p>
          En España, además, los fondos indexados cuentan con una ventaja fiscal única frente a las acciones o los ETFs:
          la <strong>traspasabilidad sin peaje fiscal</strong>. Puedes mover tu dinero de un fondo a otro (por ejemplo,
          para rebalancear tu cartera de renta variable a renta fija a medida que cumples años) sin tributar un solo
          céntimo por las plusvalías acumuladas. Solo pagas impuestos cuando decides reembolsar el dinero definitivamente
          a tu cuenta corriente, permitiendo que el 100 % de tus beneficios sigan multiplicándose año tras año.
        </p>
      </div>
    </article>
  );
}

export function EsLumpsumArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Inversión de suma global (Lump Sum): rentabilidad y estrategia de capital único</h2>
        <p className="lead">
          Recibir una cantidad cuantiosa de dinero de golpe altera los planes de cualquiera. Puede ser el cobro de una
          herencia legítima, la venta de un piso familiar, una indemnización por despido laboral o el ahorro acumulado
          durante años en una cuenta corriente que apenas paga intereses. Cuando ves una cifra importante en tu saldo
          bancario, surge de inmediato la gran pregunta: ¿conviene invertir todo de golpe hoy mismo o es más prudente
          repartirlo poco a poco a lo largo de varios meses?
        </p>
        <p>
          Esta herramienta calcula el crecimiento de tu capital cuando inviertes una suma inicial fija a un plazo
          determinado y con una rentabilidad anual esperada. A diferencia de las aportaciones periódicas mensuales, el
          capital único pone a trabajar cada céntimo desde el primer segundo bajo la fuerza del interés compuesto.
        </p>

        <h3>Qué dicen los datos históricos: Suma global frente a inversión fraccionada</h3>
        <p>
          Desde un punto de vista estrictamente estadístico y financiero, la evidencia empírica es contundente. Diversos
          estudios históricos elaborados por gestoras independientes como Vanguard sobre datos de mercados globales
          durante más de un siglo demuestran que invertir todo el capital de golpe (estrategia conocida en finanzas como
          Lump Sum) supera a la inversión fraccionada o Dollar-Cost Averaging en aproximadamente dos terceras partes de
          las ocasiones (entre el 66 % y el 68 % de los periodos analizados a diez años vista).
        </p>
        <p>
          El motivo técnico resulta muy sencillo de entender. A largo plazo, los mercados de valores mundiales presentan
          una clara tendencia alcista debido al crecimiento económico global, la innovación empresarial y la inflación.
          Por tanto, cuanto más tiempo pasa tu dinero invertido dentro del mercado, mayores probabilidades tienes de
          capturar las primas de riesgo de las empresas y los dividendos generados. Mantener una parte relevante de tu
          dinero en liquidez bancaria a la espera de un momento supuestamente mejor implica soportar un coste de
          oportunidad silencioso que merma la rentabilidad final de tu cartera.
        </p>

        <h3>El factor de la almohada: el riesgo de arrepentimiento</h3>
        <p>
          A pesar de que las matemáticas favorecen la entrada inmediata, las decisiones económicas no se toman en una
          hoja de cálculo. Se toman en la mesa de la cocina con emociones humanas reales.
        </p>
        <p>
          Imagina que decides invertir 60.000 euros en un fondo indexado global en una sola orden bancaria el lunes por
          la mañana. Durante las tres semanas siguientes, un conflicto geopolítico o una subida imprevista de tipos de
          interés provoca una corrección bursátil del 12 %. En cuestión de días tu cuenta refleja una pérdida latente de
          más de 7.000 euros. Para un inversor con experiencia curtido en ciclos bajistas, ese movimiento representa una
          simple fluctuación normal del mercado. Para alguien novato, la sensación de haber tomado la peor decisión de su
          vida resulta demoledora y suele desembocar en una venta precipitada con pérdidas reales.
        </p>
        <p>
          Si la incertidumbre te va a impedir dormir por las noches, la solución sensata no es dejar todo el dinero
          muerto en una cuenta corriente al 0 % donde la inflación se lo come año tras año. La alternativa inteligente
          consiste en diseñar una entrada en varios tramos programados de antemano (por ejemplo, en cuatro aportaciones
          trimestrales a lo largo de doce meses). Renuncias voluntariamente a una pequeña fracción de rentabilidad
          teórica a cambio de ganar tranquilidad emocional y blindar tu disciplina inversora.
        </p>

        <h3>La táctica del fondo monetario como puente fiscal en España</h3>
        <p>
          Para quienes deciden escalonar la entrada de una suma de dinero relevante en España, existe una vía
          enormemente ventajosa frente a la banca tradicional: utilizar un fondo monetario en euros como cuenta puente.
        </p>
        <p>
          En lugar de dejar 40.000 euros en una cuenta corriente bancaria con baja remuneración mientras esperas tu
          calendario de compras, puedes suscribir inicialmente un fondo monetario europeo. Estos instrumentos invierten en
          deuda pública a cortísimo plazo de máxima solvencia y devengan un rendimiento directamente ligado a los tipos
          de interés oficiales fijados por el Banco Central Europeo.
        </p>
        <p>
          La gran fortaleza en España radica en la normativa de los fondos de inversión regulados por la CNMV: la exención
          por traspaso. Puedes ordenar traspasos periódicos y automáticos desde tu fondo monetario hacia tu cartera de
          fondos indexados de renta variable sin tributar absolutamente nada en el IRPF por los rendimientos intermedios.
          Solo pasarás por el peaje de la Agencia Tributaria en el momento lejano en que decidas retirar el dinero a tu
          cuenta corriente personal para disfrutarlo.
        </p>
      </div>
    </article>
  );
}

export function EsDepositArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Depósito a plazo fijo (TIN y TAE): cómo calcular tu rentabilidad real neta</h2>
        <p className="lead">
          Aparcar el dinero en un depósito bancario a plazo fijo sigue siendo la alternativa predilecta para quienes
          buscan rentabilidad sin sobresaltos. No hay fluctuaciones bursátiles ni sustos en los telediarios. Sabes con
          exactitud matemática cuánto dinero vas a cobrar y el día exacto en que los intereses ingresarán en tu cuenta
          corriente.
        </p>
        <p>
          Sin embargo, comparar ofertas bancarias tiene más letra pequeña de la que parece a simple vista. Muchos bancos
          anuncian tipos atractivos en grandes pancartas publicitarias, pero mezclan el Tipo de Interés Nominal (TIN)
          con la Tasa Anual Equivalente (TAE), omiten las retenciones fiscales de Hacienda o aplican penalizaciones
          severas si necesitas recuperar tu capital antes de tiempo.
        </p>
        <p>
          Nuestra calculadora desglosa los rendimientos brutos y netos de tu imposición a plazo fijo (IPF),
          permitiéndote ajustar la frecuencia de cobro de cupones y calcular el beneficio real que llegará limpio a tu
          bolsillo.
        </p>

        <h3>TIN frente a TAE: en qué debes fijarte de verdad</h3>
        <p>
          El primer error del ahorrador principiante consiste en confundir el TIN con la TAE. No son lo mismo y la
          diferencia afecta directamente al dinero que ganas.
        </p>
        <p>
          El TIN es el porcentaje puro que la entidad acuerda pagarte por tu dinero en un año natural sin tener en cuenta
          gastos ni la frecuencia de liquidación. La TAE, en cambio, mide el coste o rendimiento efectivo anual
          integrando la capitalización de los intereses generados y las comisiones bancarias asociadas.
        </p>
        <p>
          Para entender la diferencia con cifras sobre la mesa: si contratas un depósito de 20.000 euros a doce meses con
          liquidación mensual de intereses a un 3 % TIN, vas cobrando 50 euros brutos cada mes. Esos intereses parciales
          quedan en tu cuenta corriente disponibles para reinvertirse, lo que eleva la TAE efectiva hasta el 3,04 %. Si
          el banco liquida los intereses únicamente al vencimiento final del año, el TIN y la TAE coinciden con
          exactitud en el 3,00 %. En imposiciones a dos o tres años, un producto que anuncie un 6 % total a vencimiento no
          te está ofreciendo un 6 % anual, sino un modesto 2,9 % TAE compuesto.
        </p>
        <p>
          La regla de oro para comparar dos ofertas de entidades bancarias diferentes es muy simple: ignora los carteles
          publicitarios del TIN y compara siempre la TAE oficial garantizada en el contrato.
        </p>

        <h3>La fiscalidad del depósito: lo que se queda Hacienda en España</h3>
        <p>
          Los intereses que genera un depósito a plazo fijo tienen la consideración legal de rendimientos del capital
          mobiliario y se integran dentro de la base imponible del ahorro del IRPF.
        </p>
        <p>
          En el momento exacto en que el banco liquida y abona tus intereses, la normativa tributaria española le obliga
          a practicar una retención automática a cuenta del 19 %. Por ejemplo, si tu imposición devenga 1.000 euros de
          intereses brutos al vencimiento, el banco transferirá 190 euros directamente a la Agencia Tributaria y tú
          recibirás 810 euros netos en tu cuenta.
        </p>
        <p>
          Esa retención del 19 % tiene carácter de anticipo a cuenta. En la Declaración de la Renta anual, las rentas
          del ahorro tributan por tramos progresivos: el 19 % se aplica a los primeros 6.000 euros de beneficio anual, el
          21 % grava la franja situada entre 6.000 y 50.000 euros, y a partir de esa cantidad los tipos suben al 23 %, 27 %
          y 28 % para patrimonios elevados.
        </p>
        <p>
          Si a lo largo del año natural has generado 8.000 euros en intereses entre varios depósitos y cuentas, los
          primeros 6.000 euros tributarán al 19 % y los 2.000 euros restantes liquidarán al 21 %, debiendo abonar la
          pequeña diferencia de dos puntos en el resultado final de tu IRPF.
        </p>

        <h3>Qué ocurre si cancelas el depósito antes de tiempo</h3>
        <p>
          La vida real está llena de imprevistos: una avería en el coche, una reforma urgente o un gasto médico
          inaplazable. Si necesitas tu dinero antes de que venza el plazo acordado, el contrato puede contemplar la
          cancelación anticipada.
        </p>
        <p>
          El Banco de España establece un límite legal tajante que protege al cliente: la comisión o penalización por
          cancelación anticipada nunca puede superar el importe total de los intereses brutos devengados desde el inicio
          de la imposición.
        </p>
        <p>
          Esto significa que, en el peor de los supuestos, la entidad bancaria puede retener el 100 % de los intereses
          acumulados hasta ese día, pero bajo ningún concepto puede mermar un solo céntimo del capital inicial que
          depositaste. Tu principal permanece siempre íntegro y protegido por ley.
        </p>
      </div>
    </article>
  );
}


export function EsRdArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Plan de ahorro programado (Aportación Periódica): haz crecer tu dinero mes a mes</h2>
        <p className="lead">
          Ahorrar dinero a final de mes suele ser una batalla perdida. Cuando intentas guardar lo que te sobra después
          de pagar el alquiler, las facturas, las salidas con amigos y las compras del supermercado, descubres con
          frustración que nunca sobra nada. El dinero disponible en la cuenta corriente tiende a evaporarse de forma casi
          imperceptible.
        </p>
        <p>
          Para romper esa dinámica frustrante existe un método infalible: el ahorro programado o depósito recurrente. En
          lugar de esperar a que termine el mes, configuras una transferencia automática que separa una cantidad fija de
          dinero el mismo día que cobras la nómina. Al automatizar ese hábito, tu patrimonio crece de forma constante sin
          exigir fuerza de voluntad diaria.
        </p>
        <p>
          Nuestra calculadora simula el crecimiento progresivo de tu plan de ahorro según tu aportación mensual, el tipo
          de interés garantizado y el horizonte temporal que te hayas marcado.
        </p>

        <h3>Cómo funciona el interés sobre un saldo creciente</h3>
        <p>
          A diferencia de un depósito bancario tradicional donde colocas una suma fija y la dejas inmovilizada, en un
          plan de ahorro programado el capital base aumenta cada treinta días gracias a tus nuevas aportaciones.
        </p>
        <p>
          Durante el primer mes, los intereses se calculan únicamente sobre tu aportación inicial. En el segundo mes, el
          banco calcula los intereses sobre la suma de la primera aportación, la segunda cuota recién ingresada y los
          intereses ya generados durante las primeras cuatro semanas. A medida que pasan los años, el volumen total de
          intereses mensuales empieza a superar a la propia cuota mensual que sale de tu bolsillo.
        </p>
        <p>
          Si ahorras 200 euros al mes en una cuenta remunerada o plan de ahorro garantizado al 2,5 % TAE durante cinco
          años, habrás apartado de tu nómina 12.000 euros netos y habrás ganado más de 780 euros limpios en intereses
          compuestos, sumando un colchón total cercano a los 12.800 euros.
        </p>

        <h3>La regla del 50/30/20 y las huchas virtuales</h3>
        <p>
          Para fijar una cuota de ahorro mensual realista que puedas sostener en el tiempo sin ahogarte económicamente,
          los expertos en finanzas personales recomiendan aplicar la regla del 50/30/20.
        </p>
        <p>
          Bajo este esquema presupuestario, destinas el 50 % de tus ingresos netos mensuales a gastos indispensables
          (vivienda, suministros básicos, alimentación y transporte), el 30 % a ocio y estilo de vida (restaurantes,
          vacaciones y compras personales) y el 20 % restante lo desvías de inmediato a tu plan de ahorro programado. Si
          ganas 1.600 euros limpios al mes, tu objetivo óptimo de ahorro automático se sitúa en torno a los 320 euros
          mensuales.
        </p>
        <p>
          Hoy en día, la mayoría de entidades bancarias permiten crear huchas virtuales o apartados dentro de sus
          aplicaciones móviles. Estas herramientas permiten etiquetar objetivos concretos con metas visuales (por
          ejemplo, fondo para imprevistos, entrada de una vivienda o vacaciones familiares). Además, muchas aplicaciones
          bancarias ofrecen la opción de redondeo en compras con tarjeta, desviando automáticamente los céntimos
          sobrantes de cada pago hacia tu hucha de ahorro.
        </p>

        <h3>Cuenta remunerada frente a depósito recurrente cerrado</h3>
        <p>
          A la hora de poner a trabajar tus aportaciones mensuales, existen dos formatos bancarios principales en el
          mercado:
        </p>
        <p>
          Por un lado, las cuentas de ahorro remuneradas ofrecen liquidez total inmediata. Puedes transferir tu dinero de
          vuelta a la cuenta corriente en cualquier momento sin penalizaciones, lo que las convierte en el vehículo ideal
          para construir tu fondo de emergencia de tres a seis meses de gastos. Sin embargo, su tipo de interés no está
          garantizado a largo plazo y la entidad puede modificarlo notificándolo con dos meses de antelación según
          evolucionen las decisiones del Banco Central Europeo.
        </p>
        <p>
          Por otro lado, los planes de ahorro a plazo o depósitos recurrentes comprometen una aportación mensual constante
          durante un periodo cerrado (por ejemplo, doce o veinticuatro meses) a cambio de blindar una TAE fija desde el
          primer día. Si decides interrumpir el plan o retirar el capital antes de tiempo, el banco puede aplicar una
          penalización sobre los intereses devengados, aunque tu capital inicial siempre permanece protegido por la
          normativa del Banco de España.
        </p>
      </div>
    </article>
  );
}

export function EsVatArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Cómo calcular el IVA: añadir impuesto a una base o desglosar un precio con IVA incluido</h2>
        <p className="lead">
          El Impuesto sobre el Valor Añadido (IVA) es el tributo indirecto más extendido en el mundo hispanohablante.
          Grava el consumo de bienes y servicios en cada eslabón de la cadena productiva. Sin embargo, para autónomos,
          pymes, contables y particulares, calcular el importe exacto de una factura o deducir el gasto de un ticket
          sigue generando constantes confusiones aritméticas.
        </p>
        <p>
          Tanto si necesitas añadir el impuesto sobre una base imponible presupuestada como si quieres desglosar el IVA
          de un precio final con impuestos incluidos, nuestra calculadora resuelve la operación de forma inmediata con
          total precisión decimal.
        </p>

        <h3>El error más común: cómo quitar o desglosar el IVA correctamente</h3>
        <p>
          Existe un fallo matemático extraordinariamente habitual en despachos y comercios: intentar quitar el IVA
          multiplicando el precio final por el porcentaje del impuesto y restando el resultado. Esa operación es
          incorrecta y descuadra los libros de contabilidad.
        </p>
        <p>
          Para entender el motivo con un caso práctico claro: si un servicio tiene una base imponible de 100 euros y le
          aplicas el 21 % de IVA, el impuesto asciende a 21 euros y el precio total de la factura es de 121 euros. Si
          ahora tomas esos 121 euros e intentas quitar el IVA calculando el 21 % sobre dicha cifra, obtienes 25,41 euros.
          Al restarlos, te queda una supuesta base de 95,59 euros, lo cual es falso y distorsiona el precio original.
        </p>
        <p>
          La regla matemática correcta para desglosar el IVA de cualquier importe consiste en dividir el precio total
          entre uno más el tipo impositivo en tanto por uno. Si el producto cuesta 121 euros con un IVA del 21 %, debes
          dividir 121 entre 1,21, obteniendo con exactitud la base imponible original de 100 euros. La cuota del impuesto
          será simplemente la resta entre el total y esa base obtenida (121 menos 100 igual a 21 euros).
        </p>
        <p>
          Si se trata de un tipo reducido del 10 %, la fórmula exige dividir entre 1,10. Cuando el producto tributa al
          superreducido del 4 %, el divisor pasa a ser 1,04. En el caso del IVA del 16 % habitual en México, la cifra
          adecuada para la división es 1,16.
        </p>

        <h3>Tipos impositivos vigentes en España y Latinoamérica</h3>
        <p>
          Cada país establece diferentes tramos en función de la naturaleza de los bienes y servicios adquiridos en el
          mercado.
        </p>
        <p>
          En España peninsular y las Islas Baleares conviven tres tipos oficiales principales. El tipo general del 21 %
          se aplica por defecto a la inmensa mayoría de productos comerciales, servicios profesionales, tecnología, ropa,
          suministros y reparaciones. El tipo reducido del 10 % grava los servicios de hostelería, restauración,
          transporte de viajeros, agua para consumo y la compra de vivienda de obra nueva. Por su parte, el tipo
          superreducido del 4 % queda reservado para productos de primera necesidad, como pan, leche, huevos, fruta,
          verduras, medicamentos con receta médica, libros y prótesis sanitarias.
        </p>
        <p>
          En cuanto a regímenes especiales, las Islas Canarias no aplican IVA sino el Impuesto General Indirecto Canario
          (IGIC), con un tipo general del 7 %, mientras que las ciudades autónomas de Ceuta y Melilla aplican el Impuesto
          sobre la Producción, los Servicios y la Importación (IPSI).
        </p>
        <p>
          En el ámbito hispanoamericano, los tipos generales más comunes son del 16 % en México (con tasa reducida del
          8 % en la región fronteriza norte), 19 % en Colombia y Chile, 18 % en Perú bajo la denominación de Impuesto
          General a las Ventas (IGV), y 21 % en Argentina (con tramo reducido del 10,5 % para bienes de capital y
          granos).
        </p>

        <h3>El IVA en la vida del autónomo: repercutido frente a soportado</h3>
        <p>
          Para un profesional por cuenta propia o una empresa, el IVA nunca forma parte de sus ingresos ni de sus
          gastos reales. El autónomo actúa como un simple recaudador voluntario para la Agencia Tributaria.
        </p>
        <p>
          El IVA que cobras a tus clientes en las facturas que emites se denomina <strong>IVA repercutido</strong>. Ese
          dinero no te pertenece: lo retienes temporalmente para transferirlo a Hacienda. Por contra, el impuesto que
          abonas a tus proveedores al comprar material de oficina, herramientas o alquilar tu local se conoce como{" "}
          <strong>IVA soportado deducible</strong>.
        </p>
        <p>
          Cada tres meses, los autónomos y sociedades presentan el Modelo 303 ante la Agencia Tributaria. En ese
          documento oficial se resta el IVA soportado del IVA repercutido. Si has cobrado más IVA del que has pagado a tus
          proveedores, debes ingresar la diferencia en la cuenta del Tesoro Público. Si has pagado más IVA del que has
          ingresado (algo frecuente al arrancar un negocio con compras elevadas), el saldo queda a compensar para los
          trimestres siguientes. En enero, se presenta además el Modelo 390 como resumen informativo de todo el ejercicio.
        </p>
      </div>
    </article>
  );
}

export function EsCagrArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Qué es el CAGR (Tasa de Crecimiento Anual Compuesto) y cómo interpretar tus inversiones</h2>
        <p className="lead">
          Comparar la rentabilidad de dos inversiones con horizontes temporales distintos resulta a menudo confuso. Si
          una acción ha subido un 65 % a lo largo de cuatro años y un fondo indexado ha ganado un 120 % durante ocho
          años, ¿cuál de los dos activos ha sido más eficiente generando riqueza?
        </p>
        <p>
          Sumar porcentajes o calcular una media simple no sirve de nada en finanzas. El valor del dinero cambia cada
          ejercicio sobre el capital acumulado en el periodo previo. Para evaluar y comparar de forma honesta cualquier
          activo, los analistas recurren al <strong>CAGR</strong> (siglas en inglés de <em>Compound Annual Growth
          Rate</em>), conocido en español como la <strong>Tasa de Crecimiento Anual Compuesto</strong>.
        </p>
        <p>
          Nuestra calculadora calcula con exactitud matemática la tasa anual constante equivalente que habría necesitado
          tu dinero para pasar del valor inicial al valor final en el plazo fijado, permitiéndote además proyectar el
          crecimiento futuro de tu cartera.
        </p>

        <h3>La trampa de la media aritmética: por qué los folletos bancarios engañan</h3>
        <p>
          El motivo fundamental por el que los profesionales descartan la media aritmética para medir rentabilidades
          históricas es que sobrestima de forma sistemática el rendimiento real de activos con volatilidad.
        </p>
        <p>
          Imagina un caso práctico evidente: comienzas el año con 10.000 euros en una cartera de acciones. Durante el
          primer ejercicio, el mercado vive una gran euforia y tu inversión se dispara un 50 %, alcanzando un valor de
          15.000 euros. En el segundo ejercicio, estalla una crisis económica y tu cartera sufre un desplome del 50 %.
        </p>
        <p>
          Si calculas la media aritmética tradicional sumando ambas cifras (más 50 % menos 50 % dividido entre dos),
          obtendrías un resultado aparente del 0 %. Podrías pensar ingenuamente que te has quedado igual. Sin embargo, la
          realidad de tu cuenta bancaria es muy dolorosa: el 50 % de pérdida del segundo año se aplicó sobre los 15.000
          euros acumulados, dejando tu saldo final en 7.500 euros. Has perdido una cuarta parte de tu patrimonio.
        </p>
        <p>
          El CAGR no se deja engañar por ese espejismo aritmético. Al aplicar la fórmula geométrica entre los 10.000
          euros iniciales y los 7.500 euros finales en dos años, el cálculo arroja un <strong>-13,4 % anual</strong>. Esa
          es la tasa real y honesta de destrucción de capital que ha sufrido tu dinero.
        </p>

        <h3>Cómo calcular el CAGR: la fórmula matemática</h3>
        <p>
          La fórmula matemática del CAGR necesita únicamente tres datos fundamentales: el valor inicial de partida, el
          valor final de llegada y el número exacto de periodos (habitualmente medido en años):
        </p>
        <p>
          El cálculo divide el valor final entre el valor inicial, eleva ese cociente a la potencia de uno dividido
          entre el número de años, y finalmente resta uno al resultado. En notación matemática:{" "}
          <code>CAGR = (Valor Final / Valor Inicial)^(1 / n) − 1</code>.
        </p>
        <p>
          Si compraste una vivienda por 180.000 euros y la vendes diez años después por 260.000 euros, la rentabilidad
          total acumulada habrá sido del 44,4 %. Sin embargo, al aplicar la fórmula del CAGR descubres que el crecimiento
          anualizado equivalente ha sido de un modesto 3,74 % anual compuesto. Esa cifra anualizada es la que te permite
          comparar la operación inmobiliaria con lo que habrías obtenido invirtiendo en deuda pública o en un fondo de
          bolsa global.
        </p>

        <h3>Aplicaciones prácticas y limitaciones que debes vigilar</h3>
        <p>
          El CAGR es una métrica indispensable en el análisis financiero, pero es vital comprender qué mide y qué
          información oculta.
        </p>
        <p>
          Resulta ideal para comparar carteras de inversión con distintas fechas de inicio, analizar la evolución de
          ventas o beneficios de una empresa en análisis fundamental de acciones, o medir el crecimiento histórico de un
          fondo de inversión frente a su índice de referencia de mercado.
        </p>
        <p>
          No obstante, su principal limitación es que asume una trayectoria de crecimiento completamente lineal y suave.
          El CAGR imagina que tu inversión avanzó a un ritmo idéntico y plácido todos los meses, ignorando por completo los
          altibajos intermedios, las caídas bruscas y los periodos de estancamiento prolongado. Por esa razón, un buen
          análisis inversor debe complementar siempre el CAGR con métricas de riesgo como la volatilidad histórica y la
          caída máxima registrada (máximo drawdown).
        </p>
      </div>
    </article>
  );
}

export function EsRetirementArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Planificación de la jubilación: cómo calcular tu retiro y complementar la pensión pública</h2>
        <p className="lead">
          Confiar exclusivamente en la pensión pública para sostener tu nivel de vida futuro es una apuesta arriesgada.
          En España y en la mayoría de economías occidentales, el sistema de pensiones se basa en un modelo de reparto:
          las cotizaciones que pagan los trabajadores en activo financian las prestaciones de quienes ya se han
          retirado.
        </p>
        <p>
          Con la jubilación masiva de la generación del baby boom y una esperanza de vida que supera con holgura los 83
          años, la tasa de reemplazo (el porcentaje del último salario que cubre la pensión pública) tenderá a reducirse
          en las próximas décadas. Para un profesional que gana 2.500 euros netos al mes, pasar a cobrar la pensión
          máxima legal supone una merma inmediata en sus ingresos familiares.
        </p>
        <p>
          Nuestra calculadora te ayuda a planificar tu retiro con números reales. Calcula el capital total que
          necesitarás acumular para cubrir la brecha entre tus gastos previstos y tu pensión pública estimada, teniendo
          en cuenta la inflación acumulada y la rentabilidad esperada de tus ahorros.
        </p>

        <h3>La brecha de jubilación: cuánto dinero te faltará cada mes</h3>
        <p>
          La clave para no pasar apuros económicos tras dejar de trabajar consiste en calcular tu brecha de ingresos.
        </p>
        <p>
          Imagina que tus gastos mensuales para mantener tu estilo de vida actual (viajes, suministros del hogar, ocio y
          salud) ascienden a 2.200 euros en valores de hoy. Al consultar el simulador oficial de la Seguridad Social,
          descubres que tu pensión pública neta estimada rondará los 1.600 euros al mes.
        </p>
        <p>
          Esa diferencia mensual de 600 euros representa tu brecha de jubilación. En un año completo, te faltarán 7.200
          euros limpios para vivir con la comodidad que deseas. Si te jubilas a los 67 años y tu horizonte de vida
          alcanza los 87 años, tendrás que financiar ese déficit durante al menos dos décadas.
        </p>
        <p>
          Para calcular el colchón de ahorro e inversión que necesitas para cubrir esa brecha sin riesgo de agotar tu
          capital, la regla empírica del 4 % sugiere multiplicar tus necesidades anuales por 25. En este caso concreto,
          7.200 euros anuales multiplicados por 25 equivalen a un patrimonio acumulado de 180.000 euros invertido en una
          cartera diversificada que bata a la inflación.
        </p>

        <h3>El veneno invisible: la inflación acumulada a veinte o treinta años</h3>
        <p>
          El mayor error de cálculo al planificar la jubilación es olvidar que el coste de la vida no permanece
          congelado en el tiempo.
        </p>
        <p>
          Si hoy tienes 40 años y gastas 1.800 euros al mes, una inflación media moderada del 2,5 % anual encarecerá el
          coste de la vida de forma implacable. Cuando cumplas los 67 años, necesitarás exactamente 3.500 euros al mes
          para comprar los mismos bienes, pagar las mismas facturas y disfrutar de los mismos servicios que hoy compras
          con 1.800 euros.
        </p>
        <p>
          Por esta razón, dejar el dinero de tu jubilación parado en una cuenta corriente al 0 % no es una opción
          conservadora: es una garantía matemática de perder poder de compra año tras año. Para proteger tu vejez, tus
          ahorros periódicos deben estar colocados en activos productivos que generen una rentabilidad real por encima
          del índice de precios al consumo.
        </p>

        <h3>Planes de pensiones frente a fondos indexados en España</h3>
        <p>
          A la hora de canalizar tu ahorro privado para la jubilación en España, existen dos herramientas principales con
          tratamientos fiscales muy diferentes:
        </p>
        <p>
          Los planes de pensiones individuales permiten desgravar las aportaciones directamente en la base imponible
          general del IRPF, con un límite legal anual fijado en 1.500 euros (ampliable hasta 8.500 euros adicionales
          mediante planes de empleo empresariales). Sin embargo, su gran inconveniente surge al jubilarse: el dinero
          rescatado tributa íntegramente como rendimiento del trabajo. Si decides retirar un capital acumulado de golpe,
          Hacienda te aplicará los tramos más altos del IRPF, pudiendo perder más del 40 % de tus ahorros en impuestos.
        </p>
        <p>
          Los fondos de inversión indexados, por su parte, no ofrecen deducción fiscal inmediata en la aportación, pero
          gozan de dos ventajas gigantescas: permiten aportar cualquier cantidad sin límites y disfrutan de
          traspasabilidad sin peaje fiscal. Puedes rebalancear tu cartera de renta variable a renta fija según cumples
          años sin tributar un solo euro. Al jubilarte, solo pagas impuestos por la plusvalía real en las rentas del
          ahorro (entre el 19 % y el 28 %), manteniendo la liquidez total en caso de imprevistos graves.
        </p>
      </div>
    </article>
  );
}

export function EsFireArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Movimiento FIRE y la regla del 4 %: calcula tu número de independencia financiera</h2>
        <p className="lead">
          La idea de trabajar cuarenta y cinco años seguidos para esperar a la jubilación oficial a los sesenta y siete
          no encaja con las prioridades de todo el mundo. Cada vez más personas prefieren tomar el control de su tiempo
          mucho antes. De esa aspiración nace el movimiento <strong>FIRE</strong> (acrónimo inglés de <em>Financial
          Independence, Retire Early</em>, o Independencia Financiera y Retiro Temprano).
        </p>
        <p>
          El principio básico del movimiento FIRE es sencillo de enunciar pero exige disciplina: ahorrar e invertir una
          parte sustancial de tus ingresos mensuales (a menudo entre el 40 % y el 60 %) en activos productivos globales
          hasta que los rendimientos pasivos de tu cartera cubran la totalidad de tus gastos de vida anuales. A partir de
          ese momento, trabajar deja de ser una obligación para pagar facturas y se convierte en una elección puramente
          voluntaria.
        </p>
        <p>
          Nuestra calculadora calcula tu <strong>número FIRE</strong> objetivo, proyecta en cuántos años alcanzarás la
          libertad financiera según tu tasa de ahorro actual y evalúa las distintas modalidades de retiro temprano.
        </p>

        <h3>La regla del 4 % y el Estudio Trinity: cómo calcular tu número objetivo</h3>
        <p>
          El pilar cuantitativo del movimiento FIRE descansa sobre la célebre <strong>regla del 4 %</strong>, derivada
          del histórico <em>Estudio Trinity</em> elaborado por profesores de la Universidad Trinity en Texas.
        </p>
        <p>
          Los investigadores analizaron el comportamiento de carteras compuestas por acciones y bonos estadounidenses a
          lo largo de diversos ciclos económicos durante el siglo XX. La conclusión principal fue que un inversor que
          retire un 4 % de su patrimonio inicial durante el primer año de jubilación y actualice esa cantidad cada año
          con la inflación tiene una probabilidad superior al 95 % de que su capital no se agote durante un periodo de
          treinta años.
        </p>
        <p>
          A partir de esta tasa segura de retiro (denominada en finanzas <em>Safe Withdrawal Rate</em> o SWR), surge la
          regla matemática para calcular tu capital objetivo: multiplicar tus gastos anuales por 25.
        </p>
        <p>
          Si calculas que necesitas 24.000 euros al año (2.000 euros al mes) para vivir confortablemente, tu número
          FIRE estándar será de 600.000 euros (24.000 multiplicado por 25). Al alcanzar ese patrimonio invertido en
          fondos indexados globales diversificados, podrías retirar 24.000 euros el primer año sin deteriorar la
          viabilidad de tu cartera.
        </p>
        <p>
          Sin embargo, para retiros tempranos muy precoces (por ejemplo, jubilarse a los 35 o 40 años), un horizonte de
          treinta años se queda corto. En esos casos, los analistas recomiendan adoptar una tasa más prudente del 3,25 %
          o 3,5 %, lo que exige multiplicar los gastos anuales por 28 o 30 veces para blindar el patrimonio frente a
          periodos de retiro que superen el medio siglo.
        </p>

        <h3>Las cuatro variantes del movimiento FIRE</h3>
        <p>
          No todos los partidarios de la independencia financiera buscan el mismo estilo de vida. Con el tiempo han
          surgido distintas variantes adaptadas a prioridades dispares:
        </p>
        <ul>
          <li>
            <strong>FIRE Estándar:</strong> Consiste en acumular 25 veces tu gasto anual actual para mantener exactamente
            tu mismo nivel de vida y consumo sin depender de un sueldo.
          </li>
          <li>
            <strong>Lean FIRE:</strong> Pensado para personas con valores minimalistas y austeros. Reducen sus gastos al
            70 % u 75 % del consumo medio, lo que permite fijar un número objetivo mucho más bajo y alcanzar la libertad
            laboral en bastantes menos años de esfuerzo.
          </li>
          <li>
            <strong>Fat FIRE:</strong> El extremo opuesto para quienes no quieren privarse de viajes frecuentes,
            restaurantes de alto nivel o vivienda amplia. Cubre entre un 125 % y un 150 % del gasto estándar y exige
            acumular patrimonios superiores al millón de euros.
          </li>
          <li>
            <strong>Barista FIRE y Coast FIRE:</strong> Modelos híbridos muy populares. En Barista FIRE el patrimonio
            cubre la mayoría de gastos fijos pero mantienes un empleo a tiempo parcial o vocacional sin estrés. En Coast
            FIRE acumulas un capital potente en tus primeros años laborales y dejas que el interés compuesto crezca por
            sí solo hasta la vejez sin necesidad de añadir más ahorros.
          </li>
        </ul>

        <h3>El riesgo de secuencia de retornos y el colchón de seguridad</h3>
        <p>
          El mayor peligro matemático al que se enfrenta quien se retira joven no es una crisis a los veinte años de
          jubilarse. Es el llamado <strong>riesgo de secuencia de retornos</strong>.
        </p>
        <p>
          Si estalla un mercado bajista severo con caídas del 30 % durante los primeros tres años de tu retiro, verte
          obligado a vender participaciones depreciadas para pagar la comida deteriora de forma irreversible la capacidad
          de recuperación de tu cartera.
        </p>
        <p>
          Para desactivar esta amenaza, los inversores FIRE en España y Europa suelen mantener un <strong>colchón de
          liquidez</strong> de entre dos y tres años de gastos anuales en fondos monetarios o cuentas remuneradas. Si la
          bolsa sufre una corrección prolongada, suspendes temporalmente las ventas de acciones y vives de ese colchón
          seguro hasta que las cotizaciones bursátiles recuperen sus máximos históricos.
        </p>
      </div>
    </article>
  );
}

export function EsSwpArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Plan de Retiro Sistemático (SWP): cómo generar una renta mensual de tus inversiones</h2>
        <p className="lead">
          Durante décadas, la educación financiera tradicional se centra exclusivamente en la fase de acumulación:
          ahorrar con disciplina mes a mes, invertir en fondos diversificados y ver crecer el patrimonio gracias al
          interés compuesto. Sin embargo, cuando llega el momento de disfrutar de ese dinero acumulado (ya sea por
          jubilación, independencia financiera o un año sabático), la mayoría de personas se enfrenta a un vacío
          operativo: ¿cómo sacar dinero de la cartera sin arruinarla ni pagar una fortuna a Hacienda?
        </p>
        <p>
          Para resolver esa incógnita existe el <strong>Plan de Retiro Sistemático</strong> (conocido internacionalmente
          por sus siglas en inglés <strong>SWP</strong>, <em>Systematic Withdrawal Plan</em>). Funciona exactamente al
          revés que las aportaciones periódicas: programas reembolsos automáticos mensuales de una cantidad fija para
          cubrir tus gastos mientras el capital restante continúa invertido en los mercados generando rendimientos.
        </p>
        <p>
          Nuestra calculadora simula con rigor matemático la evolución de tu fondo, determinando cuántos años durará tu
          patrimonio o qué capital conservarás según la renta mensual que decidas retirar, la rentabilidad anual
          esperada y el impacto de la inflación.
        </p>

        <h3>Cómo funciona la desacumulación: preservar frente a consumir el capital</h3>
        <p>
          Al configurar un plan de retiro sistemático sobre una cartera de inversión, existen dos filosofías patrimoniales
          opuestas:
        </p>
        <p>
          La primera opción es la <strong>preservación íntegra del capital</strong>. Si tu patrimonio acumulado es de
          400.000 euros y genera una rentabilidad media real neta del 4 % anual (16.000 euros limpios al año), puedes
          retirar unos 1.330 euros mensuales de forma perpetua sin tocar un solo céntimo de tu capital principal. Tu
          dinero durará indefinidamente y podrás legar íntegro el patrimonio a tus herederos.
        </p>
        <p>
          La segunda opción es el <strong>consumo ordenado del patrimonio</strong>. Si no tienes intención de dejar
          herencias cuantiosas o necesitas una renta mensual superior a la rentabilidad que genera tu cartera (por
          ejemplo, retirar 2.200 euros al mes sobre esos mismos 400.000 euros), el fondo irá reduciendo su saldo de forma
          paulatina. La calculadora te permite conocer con precisión el año exacto en que se agotará el saldo,
          garantizando que el dinero te acompañe durante toda tu esperanza de vida.
        </p>
        <p>
          Para que los retiros no pierdan poder adquisitivo con el paso de los años, es fundamental activar el ajuste por
          inflación. Retirar 1.500 euros mensuales hoy te permite llenar la cesta de la compra y viajar; dentro de quince
          años, con una inflación media del 2,5 %, necesitarás más de 2.170 euros mensuales para comprar exactamente las
          mismas cosas.
        </p>

        <h3>La gran ventaja fiscal en España: SWP frente al cobro de dividendos</h3>
        <p>
          En España, utilizar un plan de retiros periódicos sobre fondos de inversión de acumulación es aplastantemente
          más eficiente que vivir del cobro de dividendos de acciones tradicionales.
        </p>
        <p>
          Cuando una empresa te paga dividendos, Hacienda te obliga a tributar de forma inmediata por el 100 % de cada
          euro recibido en el IRPF (entre el 19 % y el 28 % en la base del ahorro), sin que puedas evitarlo ni diferirlo.
        </p>
        <p>
          En cambio, cuando realizas un reembolso parcial de un fondo de inversión, cada transferencia bancaria que
          recibes en tu cuenta se divide en dos componentes:
        </p>
        <ul>
          <li>
            <strong>El capital principal original:</strong> La parte de dinero que tú mismo aportaste en su día vuelve a
            tu bolsillo completamente libre de impuestos, ya que tributó en su momento.
          </li>
          <li>
            <strong>La plusvalía generada:</strong> Únicamente tributas por el porcentaje de beneficio o ganancia
            patrimonial que contiene esa retirada específica.
          </li>
        </ul>
        <p>
          Si retiras 1.500 euros al mes de un fondo que ha ganado un 40 % de rentabilidad histórica acumulada, unos 1.070
          euros corresponden a tu propio capital inicial exento de impuestos y solo 430 euros computan como ganancia
          patrimonial sujeta a retención fiscal. El tipo impositivo efectivo real sobre el dinero que llega limpio a tu
          banco se reduce a una fracción minúscula, maximizando los ingresos disponibles para tu vida diaria.
        </p>

        <h3>La regla FIFO y el colchón de liquidez ante mercados bajistas</h3>
        <p>
          Al ejecutar ventas parciales periódicas en España, la Agencia Tributaria aplica de forma obligatoria el
          criterio <strong>FIFO</strong> (del inglés <em>First In, First Out</em>): las primeras participaciones que
          compraste en el pasado son las primeras que se consideran vendidas. Dado que las participaciones más antiguas
          suelen acumular las mayores plusvalías, la carga fiscal tiende a ser algo más elevada al principio del retiro
          y disminuye progresivamente en las participaciones más recientes.
        </p>
        <p>
          Por último, ningún rentista prudente debería liquidar acciones en pleno desplome del mercado. Para protegerte
          del riesgo de secuencia de retornos, la práctica recomendada consiste en mantener un fondo monetario o cuenta
          remunerada con dos años de gastos fijos. Si la bolsa entra en pérdidas temporales, suspendes los reembolsos de
          renta variable y cubres tus mensualidades con ese colchón de efectivo seguro hasta que las cotizaciones reboten.
        </p>
      </div>
    </article>
  );
}

export function EsMutualFundArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>Rentabilidad de fondos de inversión y ETFs: el impacto real de las comisiones y los impuestos</h2>
        <p className="lead">
          Invertir en fondos de inversión o ETFs (fondos cotizados en bolsa) se ha convertido en el camino predilecto
          para el ahorrador que busca batir a la inflación sin dedicar horas a analizar balances empresariales. Sin
          embargo, dos carteras que inviertan en las mismas acciones del mundo pueden terminar entregando resultados
          radicalmente opuestos tras veinte años.
        </p>
        <p>
          El culpable de esa enorme divergencia no es la mala suerte ni los vaivenes de la bolsa. Es el coste invisible
          de las comisiones de gestión y la fricción fiscal de las decisiones intermedias.
        </p>
        <p>
          Nuestra calculadora proyecta el crecimiento de tu capital combinando una aportación inicial y cuotas mensuales
          periódicas, permitiéndote comparar el impacto real del ratio de gastos totales (TER) y evaluar escenarios de
          rentabilidad conservadores, moderados y dinámicos ajustados por inflación.
        </p>

        <h3>El impacto destructivo del TER a largo plazo: el ladrón silencioso</h3>
        <p>
          En los folletos publicitarios de la banca tradicional, una comisión de gestión del 1,75 % o 2 % anual se
          presenta a menudo como un detalle técnico menor. La realidad matemática del interés compuesto demuestra todo lo
          contrario.
        </p>
        <p>
          Supón que dos personas invierten 300 euros al mes durante 25 años en carteras que obtienen una rentabilidad
          bruta de mercado del 8 % anual antes de comisiones:
        </p>
        <ul>
          <li>
            La primera persona contrata un <strong>fondo indexado global</strong> con un ratio de gastos totales (TER)
            del 0,18 % anual. Al cabo de 25 años, su cartera habrá acumulado un patrimonio neto aproximado de 265.000
            euros.
          </li>
          <li>
            La segunda persona contrata un <strong>fondo de gestión activa</strong> comercializado por su sucursal
            bancaria de toda la vida, con un TER del 1,85 % anual. Al finalizar los mismos 25 años, su capital final se
            sitúa en torno a los 187.000 euros.
          </li>
        </ul>
        <p>
          La diferencia es sobrecogedora: la segunda persona ha dejado evaporarse más de 78.000 euros limpios por el
          camino únicamente en comisiones de gestión y custodia. Las comisiones altas actúan como un peaje constante que
          se cobra todos los días laborables sobre el patrimonio total acumulado, tanto si el fondo sube como si se hunde.
        </p>
        <p>
          Además, los informes empíricos independientes elaborados anualmente por entidades de análisis de mercados
          (como los prestigiosos estudios SPIVA de S&P Dow Jones Indices) demuestran de forma reiterada que más del 90 %
          de los fondos de renta variable gestionados activamente no logran superar a su índice de referencia a plazos de
          quince o veinte años.
        </p>

        <h3>Fondos indexados frente a ETFs en España: la ventaja fiscal del traspaso</h3>
        <p>
          A la hora de elegir entre fondos indexados tradicionales y ETFs, la legislación tributaria de España marca una
          diferencia fundamental que no existe en otros países.
        </p>
        <p>
          Los fondos de inversión convencionales disfrutan de la <strong>exención por traspaso</strong>. Esto significa
          que puedes mover tu dinero de un fondo a otro (por ejemplo, para rebalancear tu cartera de bolsa a deuda
          pública conforme cumples años, o para cambiarte a otra gestora más barata) sin necesidad de tributar en el
          IRPF por las ganancias acumuladas. Todo el beneficio permanece invertido y continúa generando interés compuesto
          sin peajes fiscales intermedios.
        </p>
        <p>
          En cambio, los ETFs cotizan en bolsa y tributan exactamente igual que las acciones de empresas individuales. Si
          deseas cambiar de un ETF a otro o ajustar tus porcentajes de cartera vendiendo participaciones con beneficio, la
          ley te obliga a pagar entre el 19 % y el 28 % en la base del ahorro del IRPF en ese ejercicio fiscal. Ese
          mordisco tributario prematuro merma el capital disponible para reinvertir.
        </p>
        <p>
          Por este motivo, para el inversor particular residente en España con horizonte a largo plazo, los fondos
          indexados de acumulación resultan claramente superiores a los ETFs en términos de eficiencia fiscal y
          sencillez operativa.
        </p>
      </div>
    </article>
  );
}
