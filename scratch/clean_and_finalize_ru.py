import os
import re

base_dir = r"c:\Users\ravin\Videos\new secretke website\instacalc-main\instacalc-main"

files = [
    "cagrcalculator.html",
    "catagecalculator.html",
    "compoundinterest.html",
    "epfcalculator.html",
    "gratuitycalculator.html",
    "gstcalculator.html",
    "mutualfundreturncalculator.html",
    "npscalculator.html",
    "ppfcalculator.html",
    "duration/agecalculator.html",
    "moretools/diagonalcalculator.html",
    "moretools/trignometrycalculator.html"
]

general_replacements = {
    "Advanced Mode: On": "Расширенный режим: Вкл.",
    "Advanced Mode: Off": "Расширенный режим: Выкл.",
    "Copy Summary": "Копировать сводку",
    "Copied": "Скопировано",
    "Copy failed": "Ошибка копирования",
    'No log entries yet. Use "Add to Log".': 'Записей в логе пока нет. Используйте "Добавить в лог".',
    "Add to Log": "Добавить в лог",
    "Copied!": "Скопировано!",
}

file_specific_replacements = {
    "cagrcalculator.html": {
        "Enter valid values to calculate.": "Введите корректные значения для расчета.",
        "Enter valid growth values to view projection.": "Введите корректные значения для просмотра прогноза.",
        "Start": "Старт",
        "Year 0": "Год 0",
        "Year ": "Год ",
        "Years Required": "Необходимый срок",
        "Future Value": "Будущая стоимость",
        "Initial Inv.": "Начальные инвестиции",
        "Growth from ${fmtCur(pv)} to ${fmtCur(fv)} over ${t} years.": "Рост с ${fmtCur(pv)} до ${fmtCur(fv)} за ${t} лет.",
        "Invested ${fmtCur(pv)} @ ${rate}% for ${t} years.": "Инвестировано ${fmtCur(pv)} под ${rate}% на ${t} лет.",
        "To reach ${fmtCur(fv)} @ ${rate}% in ${t} years.": "Чтобы достичь ${fmtCur(fv)} под ${rate}% за ${t} лет.",
        "To grow ${fmtCur(pv)} to ${fmtCur(fv)} @ ${rate}%.": "Чтобы увеличить ${fmtCur(pv)} до ${fmtCur(fv)} под ${rate}%.",
        " Years": " лет",
        "cagrLog": "cagrLog_ru"
    },
    "catagecalculator.html": {
        " years</td>": " лет</td>",
        "Year ": "Год ",
        "Human age equivalent": "Человеческий эквивалент возраста",
        " years": " лет",
        "At cat age ": "В возрасте кошки ",
        " human years": " человеческих лет",
        "Progress toward expected lifespan of ": "Прогресс относительно ожидаемой продолжительности жизни в ",
        "Cat Age Summary\\n": "Сводка возраста кошки\\n",
        "Cat age: ": "Возраст кошки: ",
        " years\\n": " лет\\n",
        "Human equivalent: ": "Человеческий эквивалент: ",
        "Life stage: ": "Этап жизни: ",
        "\\n": "\\n",
        "Lifespan progress: ": "Прогресс жизни: ",
        "% of ": "% из ",
        "Cat Age (years)": "Возраст кошки (лет)",
        "Human Age Equivalent": "Человеческий эквивалент возраста",
        "Kitten": "Котенок",
        "Junior": "Юниор",
        "Prime Adult": "Зрелый",
        "Mature": "Пожилой",
        "Senior": "Престарелый",
        "Super Senior": "Долгожитель"
    },
    "compoundinterest.html": {
        "Gross Value": "Валовая стоимость",
        "Net Value": "Чистая стоимость",
        "Total Contributed": "Всего внесено",
        "Initial Principal": "Начальная сумма",
        "Recurring Contributions": "Периодические взносы",
        "Net Growth": "Чистый рост",
        "Deductions": "Вычеты",
        "year": "год",
        "quarter": "квартал",
        "month": "месяц",
        "Target too high": "Цель слишком высока",
        "Target reached with current assumptions.": "Цель достигнута при текущих предположениях.",
        "Current plan reaches ": "Текущий план достигает ",
        "% of target.": "% от цели.",
        "Add target amount to see progress.": "Добавьте целевую сумму, чтобы увидеть прогресс.",
        "Compound Interest Summary": "Сводка сложных процентов",
        "Currency: ": "Валюта: ",
        "Initial Principal: ": "Начальная сумма: ",
        "Contribution: ": "Взнос: ",
        "Effective Annual Rate: ": "Эффективная годовая ставка: ",
        "Duration: ": "Срок: ",
        " years": " лет",
        "Gross Future Value: ": "Валовая будущая стоимость: ",
        "Net Future Value: ": "Чистая будущая стоимость: ",
        "Inflation-Adjusted Net: ": "Чистая будущая стоимость с поправкой на инфляцию: ",
        "Effective Net CAGR: ": "Эффективный чистый среднегодовой темп роста (CAGR): ",
        "Year": "Год",
        "Cumulative Fees": "Накопленные сборы",
        "Estimated Net": "Расчетная чистая стоимость",
        "Year ": "Год ",
        "<td>Year ": "<td>Год ",
        " / year": " / год",
        " / quarter": " / квартал",
        " / month": " / месяц"
    },
    "epfcalculator.html": {
        "EPF Corpus": "Корпус EPF",
        "EPF Contributions": "Взносы EPF",
        "Opening Balance": "Начальный баланс",
        "Employee (EPF+VPF)": "Сотрудник (EPF+VPF)",
        "Employer EPF": "Работодатель EPF",
        "Interest Earned": "Начисленные проценты",
        "Target too high": "Цель слишком высока",
        "Target reached with current EPF assumptions.": "Цель достигнута при текущих предположениях EPF.",
        "Current plan reaches ": "Текущий план достигает ",
        "% of target.": "% от цели.",
        "Add target corpus to see progress.": "Добавьте целевой корпус, чтобы увидеть прогресс.",
        "EPF Summary": "Сводка EPF",
        "Monthly Basic + DA: ": "Ежемесячный оклад + DA: ",
        "Age Range: ": "Возрастной диапазон: ",
        " to ": " до ",
        " years": " лет",
        "Effective Interest: ": "Эффективная ставка: ",
        "% p.a.": "% годовых",
        "Opening Balance: ": "Начальный баланс: ",
        "Employee (EPF + VPF): ": "Сотрудник (EPF + VPF): ",
        "Employer EPF: ": "Работодатель EPF: ",
        "Interest Earned: ": "Начисленные проценты: ",
        "Final Corpus: ": "Итоговый корпус: ",
        "Inflation Adjusted Corpus: ": "Корпус с поправкой на инфляцию: ",
        "Estimated EPS Pension / Month: ": "Оценочная пенсия EPS в месяц: ",
        "Year": "Год",
        "Age": "Возраст",
        "EPF Salary (Annual)": "Годовая зарплата EPF",
        "Employee + VPF": "Сотрудник + VPF",
        "EPS": "EPS",
        "Interest": "Проценты",
        "EPF Closing Balance": "Конечный баланс EPF",
        "<td>Year ": "<td>Год ",
        "Year ": "Год "
    },
    "gratuitycalculator.html": {
        " Years ": " лет ",
        " Mo": " мес",
        "Eligible": "Имеет право",
        "Not yet (Needs 5 yr)": "Еще нет (требуется 5 лет)",
        "Tax-Free": "Не облагается налогом",
        "Taxable": "Облагается налогом",
        "Covered": "Покрывается",
        "Not Covered": "Не покрывается"
    },
    "gstcalculator.html": {
        "Net Price (Before GST)": "Чистая цена (без GST)",
        "Price inclusive of GST": "Цена с учетом GST",
        "Base Price": "Базовая цена",
        "GST Amount": "Сумма GST",
        "Exclusive": "Без учета",
        "Inclusive": "С учетом"
    },
    "mutualfundreturncalculator.html": {
        "Gross Corpus": "Валовый корпус",
        "Net If Redeemed": "Чистый при выкупе",
        "Total Invested": "Всего инвестировано",
        "Invested": "Инвестировано",
        "Net Gain": "Чистая прибыль",
        "Deductions": "Вычеты",
        "Add valid target": "Добавьте корректную цель",
        "% p.a.": "% годовых",
        "Target reached with current assumptions.": "Цель достигнута при текущих предположениях.",
        "Current plan reaches ": "Текущий план достигает ",
        "% of target.": "% от цели.",
        "Add target corpus to see progress.": "Добавьте целевой корпус, чтобы увидеть прогресс.",
        "Mutual Fund Summary": "Сводка взаимного фонда",
        "Initial Investment: ": "Начальные инвестиции: ",
        "Monthly Top-up: ": "Ежемесячное пополнение: ",
        "Return Rate: ": "Ставка доходности: ",
        "% p.a. (scenario adjusted)": "% годовых (с поправкой на сценарий)",
        "Duration: ": "Срок: ",
        " years": " лет",
        "Total Invested: ": "Всего инвестировано: ",
        "Gross Corpus: ": "Валовый корпус: ",
        "Net Redeemable Corpus: ": "Чистый корпус при выкупе: ",
        "Inflation Adjusted Net: ": "Чистый корпус с поправкой на инфляцию: ",
        "Effective Net CAGR: ": "Эффективный чистый CAGR: ",
        "Year": "Год",
        "Cumulative SWP": "Накопленный SWP",
        "Estimated Net If Redeemed": "Расчетная чистая сумма при выкупе",
        "<td>Year ": "<td>Год ",
        "Year ": "Год "
    },
    "npscalculator.html": {
        "Age must be less than 60": "Возраст должен быть меньше 60 лет",
        "Invested Principal": "Инвестированная сумма",
        "Market Gains": "Рыночный доход",
        "Lump Sum (to you)": "Единовременная выплата (вам)",
        "Annuity Corpus": "Аннуитетный фонд"
    },
    "ppfcalculator.html": {
        " Years": " лет",
        "Start": "Старт",
        "Year ": "Год ",
        "Maturity Value": "Сумма к выплате"
    },
    "duration/agecalculator.html": {
        "Years, ": "лет, ",
        "Months, ": "месяцев, ",
        "Days": "дней",
        " total seconds alive": " всего секунд жизни",
        "d": "дн",
        "Mercury": "Меркурий",
        "Venus": "Венера",
        "Mars": "Марс",
        "Jupiter": "Юпитер",
        "Saturn": "Сатурн",
        "Neptune": "Нептун",
        "Garnet": "Гранат",
        "Amethyst": "Аметист",
        "Aquamarine": "Аквамарин",
        "Diamond": "Алмаз",
        "Emerald": "Изумруд",
        "Pearl": "Жемчуг",
        "Ruby": "Рубин",
        "Peridot": "Перидот",
        "Sapphire": "Сапфир",
        "Opal": "Опал",
        "Topaz": "Топаз",
        "Turquoise": "Бирюза",
        "Cap": "Коз",
        "Aqu": "Вод",
        "Pis": "Рыб",
        "Ari": "Ове",
        "Tau": "Тел",
        "Gem": "Бли",
        "Can": "Рак",
        "Leo": "Лев",
        "Vir": "Дев",
        "Lib": "Вес",
        "Sco": "Ско",
        "Sag": "Стр"
    },
    "moretools/diagonalcalculator.html": {
        "Enter valid values to calculate.": "Введите корректные значения для расчета.",
        "Enter rectangle length and width for live diagram.": "Введите длину и ширину прямоугольника для просмотра диаграммы.",
        "Length = ": "Длина = ",
        "Width = ": "Ширина = ",
        "Diagonal = ": "Диагональ = ",
        "Rectangle live diagram updates with length and width.": "Диаграмма прямоугольника обновляется при вводе длины и ширины.",
        "Enter square side for live diagram.": "Введите сторону квадрата для просмотра диаграммы.",
        "Side = ": "Сторона = ",
        "All 4 sides are equal": "Все 4 стороны равны",
        "Square live diagram updates with side length.": "Диаграмма квадрата обновляется при вводе стороны.",
        "Enter parallelogram sides and angle for live diagram.": "Введите стороны и угол параллелограмма для просмотра диаграммы.",
        "Sides = ": "Стороны = ",
        "Angle = ": "Угол = ",
        "p = ": "p = ",
        "q = ": "q = ",
        "Parallelogram diagram with both diagonals.": "Диаграмма параллелограмма с обеими диагоналями.",
        "Enter rhombus side and angle for live diagram.": "Введите сторону и угол ромба для просмотра диаграммы.",
        " (perpendicular)": " (перпендикулярно)",
        "Rhombus diagram with perpendicular diagonals.": "Диаграмма ромба с перпендикулярными диагоналями.",
        "Enter cuboid length, width, and height for live diagram.": "Введите длину, ширину и высоту параллелепипеда для просмотра диаграммы.",
        "Height = ": "Высота = ",
        "Cuboid live diagram shows projected space diagonal.": "Диаграмма параллелепипеда показывает пространственную диагональ.",
        "Enter polygon sides n >= 3 for live diagram.": "Введите число сторон многоугольника n >= 3 для просмотра диаграммы.",
        " sides": " сторон",
        " (visual capped at 16)": " (визуально ограничено 16)",
        "Sample diagonals highlighted": "Выделены некоторые диагонали",
        "Polygon live diagram updates with side count.": "Диаграмма многоугольника обновляется при вводе числа сторон.",
        "Enter screen width and height in pixels for live diagram.": "Введите ширину и высоту экрана в пикселях для просмотра диаграммы.",
        "Aspect ": "Соотношение ",
        "Screen live diagram shows display diagonal and aspect ratio.": "Диаграмма экрана показывает диагональ и соотношение сторон.",
        "Enter room length and width for live diagram.": "Введите длину и ширину комнаты для просмотра диаграммы.",
        "Measured = ": "Измерено = ",
        "Expected diagonal = ": "Ожидаемая диагональ = ",
        "Room live diagram compares expected diagonal with measured input.": "Диаграмма комнаты сравнивает ожидаемую и измеренную диагональ.",
        "Choose a mode to view live diagram.": "Выберите режим для просмотра живой диаграммы.",
        "Rectangle diagonal": "Диагональ прямоугольника",
        "Enter positive length and width.": "Введите положительные длину и ширину.",
        "Square diagonal": "Диагональ квадрата",
        "Enter positive side length.": "Введите положительную сторону.",
        "Parallelogram diagonal": "Диагональ параллелограмма",
        "Enter positive sides and angle (0-180).": "Введите положительные стороны и угол (0-180).",
        "Shorter diagonal using law of cosines.": "Меньшая диагональ вычислена по теореме косинусов.",
        "Rhombus diagonal": "Диагональ ромба",
        "Enter positive side and angle (0-180).": "Введите положительную сторону и угол (0-180).",
        "Cuboid diagonal": "Диагональ прямоугольного параллелепипеда",
        "Enter positive length, width, and height.": "Введите положительные длину, ширину и высоту.",
        "Cuboid space diagonal": "Пространственная диагональ параллелепипеда",
        "3d diagonal of box formula used.": "Используется формула 3D диагонали.",
        "Polygon diagonals": "Диагонали многоугольника",
        "Enter n >= 3.": "Введите n >= 3.",
        "Total diagonals": "Всего диагоналей",
        "Screen diagonal": "Диагональ экрана",
        "Enter valid resolution.": "Введите корректное разрешение.",
        "Calculated from pixels and PPI.": "Вычислено на основе пикселей и PPI.",
        "Add PPI": "Укажите PPI",
        "Add PPI for inch and cm conversion.": "Укажите PPI для перевода в дюймы и см.",
        "Enter valid room size": "Введите корректный размер комнаты",
        "Room diagonal": "Диагональ комнаты",
        "Looks square (within 0.5%)": "Выглядит прямоугольным (в пределах 0.5%)",
        "Out of square; adjust corners": "Не прямоугольный; выровняйте углы",
        "Add measured value": "Добавьте измеренное значение",
        "Use measured diagonal to compare": "Используйте измеренную диагональ для сравнения",
        "Expected room diagonal": "Ожидаемая диагональ комнаты",
        "diagLog": "diagLog_ru"
    },
    "moretools/trignometrycalculator.html": {
        "Enter valid values to calculate.": "Введите корректные значения для расчета.",
        "Enter valid values to view diagram.": "Введите корректные значения для просмотра диаграммы.",
        "Enter positive leg lengths.": "Введите положительные длины катетов.",
        "Enter positive lengths.": "Введите положительные длины.",
        "Error: Hypotenuse must be longer than leg.": "Ошибка: Гипотенуза должна быть длиннее катета.",
        "Angle A must be between 0 and 90.": "Угол A должен быть от 0 до 90 градусов.",
        "sq units": "кв. ед.",
        "Enter all three sides.": "Введите все три стороны.",
        "Invalid: Sum of 2 sides must be > 3rd side.": "Недействительно: Сумма любых 2 сторон должна быть больше 3-й стороны.",
        "Enter valid sides and an angle < 180°.": "Введите корректные стороны и угол < 180°.",
        "Enter positive values.": "Введите положительные значения.",
        "Error: Sum of angles A + B must be < 180°.": "Ошибка: Сумма углов A + B должна быть < 180°.",
        "triLog": "triLog_ru"
    }
}

safe_raw_keys = [
    "Years, ", "Months, ", "Days", " total seconds alive",
    "Length = ", "Width = ", "Diagonal = ", "Side = ", "Sides = ", "Angle = ",
    "p = ", "q = ", "Height = ", " sides", " (visual capped at 16)",
    "Sample diagonals highlighted", "Aspect ", "Measured = ", "Expected diagonal = ",
    "Choose a mode to view live diagram.", "Rectangle diagonal",
    "Square diagonal", "Parallelogram diagonal", "Rhombus diagonal",
    "Cuboid diagonal", "Cuboid space diagonal", "Polygon diagonals",
    "Screen diagonal", "Room diagonal", "Expected room diagonal",
    "At cat age ", " human years", "Progress toward expected lifespan of ",
    "Cat Age Summary\n", "Cat age: ", " years\n", "Human equivalent: ",
    "Life stage: ", "Lifespan progress: ", "% of ", "Cat Age (years)",
    "Human Age Equivalent", "Year 0", "Year ", "Years Required",
    "Future Value", "Initial Inv.", " Years", "Gross Value", "Net Value",
    "Total Contributed", "Initial Principal", "Recurring Contributions",
    "Net Growth", "Deductions", "Target too high",
    "Target reached with current assumptions.", "Current plan reaches ",
    "% of target.", "Add target amount to see progress.",
    "Compound Interest Summary", "Currency: ", "Initial Principal: ",
    "Contribution: ", "Effective Annual Rate: ", "Duration: ",
    "Gross Future Value: ", "Net Future Value: ", "Inflation-Adjusted Net: ",
    "Effective Net CAGR: ", "Cumulative Fees", "Estimated Net",
    " / year", " / quarter", " / month", "EPF Corpus", "EPF Contributions",
    "Opening Balance", "Employee (EPF+VPF)", "Employer EPF",
    "Interest Earned", "Target reached with current EPF assumptions.",
    "Add target corpus to see progress.", "EPF Summary",
    "Monthly Basic + DA: ", "Age Range: ", " to ", "Effective Interest: ",
    "% p.a.", "Opening Balance: ", "Employee (EPF + VPF): ",
    "Employer EPF: ", "Interest Earned: ", "Final Corpus: ",
    "Inflation Adjusted Corpus: ", "Estimated EPS Pension / Month: ",
    "EPF Salary (Annual)", "Employee + VPF", "EPS", "Interest",
    "EPF Closing Balance", " Years ", " Mo", "Eligible", "Not yet (Needs 5 yr)",
    "Tax-Free", "Taxable", "Covered", "Not Covered", "Net Price (Before GST)",
    "Price inclusive of GST", "Base Price", "GST Amount", "Exclusive",
    "Inclusive", "Gross Corpus", "Net If Redeemed", "Total Invested",
    "Invested", "Net Gain", "Add valid target", "Net Redeemable Corpus: ",
    "Cumulative SWP", "Estimated Net If Redeemed", "Age must be less than 60",
    "Invested Principal", "Market Gains", "Lump Sum (to you)",
    "Annuity Corpus", "Maturity Value"
]

def replace_js_string_safely(script, eng_str, ru_str):
    # Try replacing quoted and template versions
    script = script.replace(f'"{eng_str}"', f'"{ru_str}"')
    script = script.replace(f"'{eng_str}'", f"'{ru_str}'")
    script = script.replace(f"`{eng_str}`", f"`{ru_str}`")
    
    # Try raw replacement if it's a known safe key or contains structural punctuation/spaces
    is_safe = eng_str in safe_raw_keys or any(c in eng_str for c in [" ", ",", ":", "%", "\\", "\n", "=", "<", ">"])
    if is_safe:
        script = script.replace(eng_str, ru_str)
        
    return script

def find_outer_block(text, start_keyword="const langSelect"):
    idx = text.find(start_keyword)
    if idx == -1:
        return None
    # Now find the first "if" after start_keyword
    if_idx = text.find("if", idx)
    if if_idx == -1:
        return None
    # Find the first open brace "{" after "if"
    brace_idx = text.find("{", if_idx)
    if brace_idx == -1:
        return None
    # Now match curly braces
    count = 1
    current = brace_idx + 1
    while count > 0 and current < len(text):
        if text[current] == "{":
            count += 1
        elif text[current] == "}":
            count -= 1
        current += 1
    # The block ends at current
    return text[idx:current]

log_lines = []

for f in files:
    eng_path = os.path.join(base_dir, f)
    ru_path = os.path.join(base_dir, "ru", f)
    
    if not os.path.exists(eng_path) or not os.path.exists(ru_path):
        log_lines.append(f"[-] Missing: {f}")
        continue
        
    with open(eng_path, "r", encoding="utf-8") as file:
        eng_content = file.read()
    with open(ru_path, "r", encoding="utf-8") as file:
        ru_content = file.read()
        
    # Get relative prefix based on depth of the file
    depth = f.count("/")
    if depth == 0:
        rel_prefix_en = "../" + f
        rel_prefix_ja = "../ja/" + f
    elif depth == 1:
        rel_prefix_en = "../../" + f
        rel_prefix_ja = "../../ja/" + f
    else:
        rel_prefix_en = "../" + f
        rel_prefix_ja = "../ja/" + f

    # Find calculation script in English
    eng_scripts = re.findall(r"<script\b[^>]*>([\s\S]*?)</script>", eng_content)
    calc_script = None
    for s in eng_scripts:
        if "(function" in s or "function calculate" in s or "const defaults" in s:
            if calc_script is None or len(s) > len(calc_script):
                calc_script = s
                
    if not calc_script:
        log_lines.append(f"[-] Script not found in English: {f}")
        continue
        
    # Translate strings in JavaScript
    localized_script = calc_script
    
    # 1. Apply general replacements
    for eng_str, ru_str in general_replacements.items():
        localized_script = replace_js_string_safely(localized_script, eng_str, ru_str)
        
    # 2. Apply file-specific replacements
    if f in file_specific_replacements:
        for eng_str, ru_str in file_specific_replacements[f].items():
            localized_script = replace_js_string_safely(localized_script, eng_str, ru_str)
            
    # 3. Replace langSelect logic using curly-brace-matching
    russian_lang_select_js = f"""const langSelect = document.getElementById('langSelect');
        if (langSelect) {{
          langSelect.value = 'ru';
          langSelect.addEventListener('change', function () {{
            if (this.value === 'en') {{
              localStorage.setItem('user_lang', 'en');
              window.location.href = '{rel_prefix_en}';
            }} else if (this.value === 'ja') {{
              localStorage.setItem('user_lang', 'ja');
              window.location.href = '{rel_prefix_ja}';
            }}
          }});
        }}"""
        
    lang_select_block = find_outer_block(localized_script, "const langSelect")
    if lang_select_block:
        localized_script = localized_script.replace(lang_select_block, russian_lang_select_js)
    else:
        log_lines.append(f"[!] Custom langSelect replacement block finding failed for {f}")

    # Now we parse the Russian file and rewrite its standard inline script tags
    script_matches = list(re.finditer(r"(<script\b[^>]*>)([\s\S]*?)(</script>)", ru_content))
    
    inline_script_indices = []
    for idx, m in enumerate(script_matches):
        opening_tag = m.group(1)
        if "src=" not in opening_tag and "application/ld+json" not in opening_tag:
            inline_script_indices.append(idx)
            
    if len(inline_script_indices) < 1:
        log_lines.append(f"[-] No standard inline script tags found in Russian: {f}")
        continue
        
    log_lines.append(f"[*] File {f} has {len(inline_script_indices)} standard inline script tags")
    
    new_ru_content = ""
    last_end = 0
    
    first_inline_idx = inline_script_indices[0]
    last_inline_idx = inline_script_indices[-1]
    
    placeholder_script_tag = """<script>
    (function () {
      localStorage.setItem('user_lang', 'ru');
    })();
  </script>"""
  
    calc_script_tag = f"<script>\n{localized_script}\n  </script>"
    
    for idx, m in enumerate(script_matches):
        span = m.span()
        new_ru_content += ru_content[last_end:span[0]]
        
        if idx in inline_script_indices:
            if idx == first_inline_idx:
                new_ru_content += placeholder_script_tag
            elif idx == last_inline_idx and last_inline_idx != first_inline_idx:
                new_ru_content += calc_script_tag
            else:
                # Remove middle duplicate script tag
                pass
        else:
            new_ru_content += m.group(0)
            
        last_end = span[1]
        
    new_ru_content += ru_content[last_end:]
    
    # If there was only 1 inline script tag, append the calc_script_tag at the bottom of the body
    if len(inline_script_indices) == 1:
        body_end = new_ru_content.find("</body>")
        if body_end != -1:
            new_ru_content = new_ru_content[:body_end] + "\n  " + calc_script_tag + "\n" + new_ru_content[body_end:]
            log_lines.append(f"  [+] Injected calc script before </body> since only 1 inline script existed")
        else:
            log_lines.append(f"  [-] Could not find </body> to inject calc script!")
            
    # Update langSelect HTML dropdown options
    standard_dropdown_html = """      <div class="lang-switch">
        <select id="langSelect" aria-label="Выберите язык">
          <option value="en">English</option>
          <option value="ru" selected>Русский</option>
          <option value="ja">日本語</option>
        </select>
      </div>"""
      
    lang_switch_pattern = r'<div class="lang-switch">[\s\S]*?</div>'
    match_switch = re.search(lang_switch_pattern, new_ru_content)
    if match_switch:
        if depth == 0:
            new_ru_content = new_ru_content.replace(match_switch.group(0), standard_dropdown_html)
            
    with open(ru_path, "w", encoding="utf-8") as file:
        file.write(new_ru_content)
        
    log_lines.append(f"[+] Successfully cleaned and synchronized: {f}")

with open(os.path.join(base_dir, "scratch", "cleanup_output.txt"), "w", encoding="utf-8") as out_file:
    out_file.write("\n".join(log_lines))
print("Cleanup output written to scratch/cleanup_output.txt")
