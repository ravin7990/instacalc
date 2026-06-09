import os
import re

# Ensure directory ru/ exists
os.makedirs('ru', exist_ok=True)

# Define global replacement rules that apply to all files
GLOBAL_REPLACEMENTS = [
    # Meta Lang
    ('html lang="en"', 'html lang="ru"'),
    ('html lang="ja"', 'html lang="ru"'),
    ("localStorage.setItem('user_lang', 'en')", "localStorage.setItem('user_lang', 'ru')"),
    ("localStorage.setItem('user_lang', 'ja')", "localStorage.setItem('user_lang', 'ru')"),
    ("localStorage.setItem('user_lang', 'ko')", "localStorage.setItem('user_lang', 'ru')"),
    
    # Path adjusts (from root to ru/ folder)
    ('href="favicon.ico"', 'href="../favicon.ico"'),
    ('href="favicon.webp"', 'href="../favicon.webp"'),
    ('href="index.html"', 'href="index.html"'),
    ('href="aboutus.html"', 'href="aboutus.html"'),
    ('href="contactus.html"', 'href="contactus.html"'),
    ('href="privacypolicy.html"', 'href="privacypolicy.html"'),
    ('href="sipcalculator.html"', 'href="sipcalculator.html"'),
    ('href="emicalculator.html"', 'href="emicalculator.html"'),
    ('href="fdcalculator.html"', 'href="fdcalculator.html"'),
    ('href="rdcalculator.html"', 'href="rdcalculator.html"'),
    ('href="compoundinterest.html"', 'href="compoundinterest.html"'),
    ('href="simpleinterestcalculator.html"', 'href="simpleinterestcalculator.html"'),
    ('href="sipcalculatorlumpsump.html"', 'href="sipcalculatorlumpsump.html"'),
    ('href="swpcalculator.html"', 'href="swpcalculator.html"'),
    ('href="gstcalculator.html"', 'href="gstcalculator.html"'),
    ('href="retirementcalculator.html"', 'href="retirementcalculator.html"'),
    ('href="epfcalculator.html"', 'href="epfcalculator.html"'),
    ('href="ppfcalculator.html"', 'href="ppfcalculator.html"'),
    ('href="npscalculator.html"', 'href="npscalculator.html"'),
    ('href="gratuitycalculator.html"', 'href="gratuitycalculator.html"'),
    ('href="cagrcalculator.html"', 'href="cagrcalculator.html"'),
    ('href="catagecalculator.html"', 'href="catagecalculator.html"'),
    ('href="moretools/concretecalculator.html"', 'href="moretools/concretecalculator.html"'),
    ('href="moretools/diagonalcalculator.html"', 'href="moretools/diagonalcalculator.html"'),
    ('href="moretools/trignometrycalculator.html"', 'href="moretools/trignometrycalculator.html"'),
    ('href="duration/agecalculator.html"', 'href="duration/agecalculator.html"'),
    ('src="logo.png"', 'src="../logo.png"'),
    ('src="currency-manager.js"', 'src="../currency-manager.js"'),
    
    # Navigation / Brand links
    ('InstaCalc.in', 'InstaCalc.in'),
    ('<span>InstaCalc.in</span>', '<span>InstaCalc.in</span>'),
    ('class="brand"', 'class="brand"'),
    
    # Lang Switch Options
    ('<option value="en" selected>English</option>', '<option value="en">English</option>'),
    ('<option value="ru">Русский</option>', '<option value="ru" selected>Русский</option>'),
    ('<option value="ja">日本語</option>', '<option value="ja">日本語</option>'),
    ('<option value="ko">한국어</option>', '<option value="ko">한국어</option>'),
    
    # General footer and header navigation translations (common across files)
    ('>Home</a>', '>Главная</a>'),
    ('>About Us</a>', '>О нас</a>'),
    ('>Contact Us</a>', '>Контакты</a>'),
    ('>Privacy Policy</a>', '>Конфиденциальность</a>'),
    ('>Support</a>', '>Поддержка</a>'),
    
    # Standard labels
    ('Monthly Deposit', 'Ежемесячный взнос'),
    ('Expected Return Rate', 'Ожидаемая доходность'),
    ('Time Period', 'Срок инвестирования'),
    ('Calculate', 'Рассчитать'),
    ('Reset', 'Сбросить'),
    ('Result Summary', 'Результаты расчета'),
    ('Total Investment', 'Всего инвестировано'),
    ('Est. Returns', 'Ожидаемый доход'),
    ('Total Value', 'Итоговая сумма'),
]

# Map file specific translation lists
FILE_TRANSLATIONS = {
    'index.html': [
        ('InstaCalc.in - All-in-One Online Calculators and Unit Converters', 'InstaCalc.in - Все онлайн-калькуляторы и конвертеры величин'),
        ('InstaCalc.in offers 40+ free tools including financial calculators, unit converters, time calculators, and construction tools.', 'InstaCalc.in предлагает более 40 бесплатных инструментов, включая финансовые калькуляторы, конвертеры единиц, калькуляторы времени и строительные инструменты.'),
        ('InstaCalc, online calculator, unit converter, SIP calculator, EMI calculator, GST calculator, age calculator', 'InstaCalc, онлайн калькулятор, конвертер величин, SIP калькулятор, EMI калькулятор, калькулятор НДС, калькулятор возраста'),
        ('Use smart financial calculators, fast unit converters, and time tools at InstaCalc.in.', 'Используйте умные финансовые калькуляторы, быстрые конвертеры величин и инструменты времени на InstaCalc.in.'),
        ('A clean calculator toolkit for SIP, EMI, GST, age, duration, and many more.', 'Удобный набор калькуляторов для SIP, EMI, НДС, возраста, длительности и многого другого.'),
        ('Instantly Calculate Anything', 'Мгновенные вычисления на все случаи жизни'),
        ('Fast, accurate, and free online calculators for finance, math, construction, and daily planning.', 'Быстрые, точные и бесплатные онлайн-калькуляторы для финансов, математики, строительства и повседневного планирования.'),
        ('Search for a tool or unit...', 'Поиск инструмента или единицы...'),
        ('Financial Calculators', 'Финансовые калькуляторы'),
        ('Unit Converters', 'Конвертеры величин'),
        ('Time & Date', 'Время и дата'),
        ('Construction Tools', 'Строительные инструменты'),
        ('SIP Calculator', 'SIP калькулятор'),
        ('EMI Calculator', 'EMI калькулятор'),
        ('FD Calculator', 'Калькулятор вкладов (FD)'),
        ('RD Calculator', 'Калькулятор накоплений (RD)'),
        ('Compound Interest', 'Сложные проценты'),
        ('Simple Interest', 'Простые проценты'),
        ('GST Calculator', 'Калькулятор НДС'),
        ('EPF Calculator', 'Пенсионный калькулятор EPF'),
        ('NPS Calculator', 'Калькулятор NPS'),
        ('Mutual Fund Returns', 'Доходность ПИФов'),
        ('Gratuity Calculator', 'Калькулятор выходного пособия'),
        ('Retirement Calculator', 'Пенсионный калькулятор'),
        ('SWP Calculator', 'SWP калькулятор'),
        ('CAGR Calculator', 'Калькулятор CAGR'),
        ('Age Calculator', 'Калькулятор возраста'),
        ('Concrete Calculator', 'Расчет бетона'),
        ('Diagonal Calculator', 'Калькулятор диагонали'),
        ('Trigonometry Calculator', 'Тригонометрический калькулятор'),
    ],
    # Add more translations for other files below dynamically
}

def localize_file(filename):
    print(f'Localizing {filename} to Russian...')
    
    # Read the original file in English (root)
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Apply global replacements
    for target, replacement in GLOBAL_REPLACEMENTS:
        content = content.replace(target, replacement)
        
    # Apply file-specific replacements if available
    if filename in FILE_TRANSLATIONS:
        for target, replacement in FILE_TRANSLATIONS[filename]:
            content = content.replace(target, replacement)
            
    # Save the output file in ru/
    output_path = os.path.join('ru', filename)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Saved localized {output_path}')

if __name__ == '__main__':
    localize_file('index.html')
