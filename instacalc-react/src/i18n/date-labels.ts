import type { Locale } from "@/config/site";

/** Labels for the date and time based tools. */
export interface DateCopy {
  eyebrow: string;
  age: string;
  years: string;
  dob: string;
  target: string;
  today: string;
  oneYearAgo: string;
  tenYearsAgo: string;
  twentyFiveYearsAgo: string;
  pickDate: string;
  nextBirthday: string;
  totalMonths: string;
  totalWeeks: string;
  totalDays: string;
  totalHours: string;
  totalMinutes: string;
  bornOn: string;
  zodiac: string;
  birthstone: string;
  leapYears: string;
  days: string;
  weeks: string;
  fromDate: string;
  toDate: string;
  calendarDays: string;
  businessDays: string;
  weeksBetween: string;
  isoWeek: string;
  isoYear: string;
  addWeeks: string;
  resultDate: string;
  minutes: string;
  hours: string;
  decimalHours: string;
  timeHms: string;
  totalTime: string;
  startTime: string;
  endTime: string;
  breakTime: string;
  days_: string;
  nextFallsOn: string;
  halfLifetime: string;
  nextBirthdayDate: string;
}

const en: DateCopy = {
  eyebrow: "Date and Time",
  age: "Exact Age",
  years: "Years",
  dob: "Date of Birth",
  target: "Age at Date",
  today: "Today",
  oneYearAgo: "1 year ago",
  tenYearsAgo: "10 years ago",
  twentyFiveYearsAgo: "25 years ago",
  pickDate: "Choose a date to calculate.",
  nextBirthday: "Next Birthday",
  totalMonths: "Total Months",
  totalWeeks: "Total Weeks",
  totalDays: "Total Days",
  totalHours: "Total Hours",
  totalMinutes: "Total Minutes",
  bornOn: "Born On",
  zodiac: "Zodiac Sign",
  birthstone: "Birthstone",
  leapYears: "Leap Years",
  days: "days",
  weeks: "weeks",
  fromDate: "From Date",
  toDate: "To Date",
  calendarDays: "Calendar Days",
  businessDays: "Working Days",
  weeksBetween: "Weeks Between",
  isoWeek: "ISO Week Number",
  isoYear: "ISO Week Year",
  addWeeks: "Add / Subtract Weeks",
  resultDate: "Result Date",
  minutes: "Minutes",
  hours: "Hours",
  decimalHours: "Decimal Hours",
  timeHms: "Time (HH:MM:SS)",
  totalTime: "Total Time",
  startTime: "Start Time",
  endTime: "End Time",
  breakTime: "Break (minutes)",
  days_: "Days",
  nextFallsOn: "Next Falls On",
  halfLifetime: "Half Lifetime",
  nextBirthdayDate: "Next Birthday Date",
};

const ja: DateCopy = {
  ...en,
  eyebrow: "日付と時間",
  age: "正確な年齢",
  years: "年",
  dob: "生年月日",
  target: "計算基準日",
  today: "今日",
  oneYearAgo: "1年前",
  tenYearsAgo: "10年前",
  twentyFiveYearsAgo: "25年前",
  pickDate: "日付を選択してください。",
  nextBirthday: "次の誕生日",
  totalMonths: "合計月数",
  totalWeeks: "合計週数",
  totalDays: "合計日数",
  totalHours: "合計時間",
  totalMinutes: "合計分数",
  bornOn: "生まれた曜日",
  nextFallsOn: "次の誕生日の曜日",
  halfLifetime: "人生の折り返し日数",
  nextBirthdayDate: "次の誕生日（日付）",
  zodiac: "星座",
  birthstone: "誕生石",
  leapYears: "閏年",
  days: "日",
  weeks: "週間",
  fromDate: "開始日",
  toDate: "終了日",
  calendarDays: "暦日",
  businessDays: "平日",
  weeksBetween: "週数差",
  isoWeek: "ISO週番号",
  isoYear: "ISO年",
  addWeeks: "週数を加算／減算",
  resultDate: "結果日",
  minutes: "分",
  hours: "時間",
  decimalHours: "十進時間",
  timeHms: "時刻 (時:分:秒)",
  totalTime: "合計時間",
  startTime: "開始時刻",
  endTime: "終了時刻",
  breakTime: "休憩（分）",
  days_: "日",
};

const ru: DateCopy = {
  ...en,
  eyebrow: "Дата и время",
  age: "Точный возраст",
  years: "Лет",
  dob: "Дата рождения",
  target: "Возраст на дату",
  today: "Сегодня",
  oneYearAgo: "1 год назад",
  tenYearsAgo: "10 лет назад",
  twentyFiveYearsAgo: "25 лет назад",
  pickDate: "Выберите дату для расчёта.",
  nextBirthday: "Следующий день рождения",
  totalMonths: "Всего месяцев",
  totalWeeks: "Всего недель",
  totalDays: "Всего дней",
  totalHours: "Всего часов",
  totalMinutes: "Всего минут",
  bornOn: "День недели рождения",
  zodiac: "Знак зодиака",
  birthstone: "Камень-талисман",
  leapYears: "Високосные годы",
  days: "дней",
  weeks: "недель",
  fromDate: "Дата начала",
  toDate: "Дата окончания",
  calendarDays: "Календарных дней",
  businessDays: "Рабочих дней",
  weeksBetween: "Недель между",
  isoWeek: "Номер недели ISO",
  isoYear: "Год недели ISO",
  addWeeks: "Добавить / вычесть недели",
  resultDate: "Итоговая дата",
  minutes: "Минуты",
  hours: "Часы",
  decimalHours: "Часы в десятичном виде",
  timeHms: "Время (Ч:ММ:СС)",
  totalTime: "Общее время",
  startTime: "Начало",
  endTime: "Конец",
  breakTime: "Перерыв (минуты)",
  days_: "Дни",
};

const us: DateCopy = { ...en, eyebrow: "Date and Time" };

const ko: DateCopy = {
  ...en,
  eyebrow: "날짜 및 시간",
  age: "정확한 나이",
  years: "세",
  dob: "생년월일",
  target: "계산 기준일",
  today: "오늘",
  oneYearAgo: "1년 전",
  tenYearsAgo: "10년 전",
  twentyFiveYearsAgo: "25년 전",
  pickDate: "계산할 날짜를 선택하세요.",
  nextBirthday: "다음 생일",
  totalMonths: "총 개월",
  totalWeeks: "총 주",
  totalDays: "총 일수",
  totalHours: "총 시간",
  totalMinutes: "총 분",
  bornOn: "태어난 요일",
  zodiac: "별자리",
  birthstone: "보석",
  leapYears: "윤년",
  days: "일",
  weeks: "주",
  fromDate: "시작일",
  toDate: "종료일",
  calendarDays: "달력일",
  businessDays: "근무일",
  weeksBetween: "주 차이",
  isoWeek: "ISO 주차 번호",
  isoYear: "ISO 연도",
  addWeeks: "주 더하기 / 빼기",
  resultDate: "결과 날짜",
  minutes: "분",
  hours: "시간",
  decimalHours: "소수 시간",
  timeHms: "시간 (시:분:초)",
  totalTime: "총 시간",
  startTime: "시작 시간",
  endTime: "종료 시간",
  breakTime: "휴식 (분)",
  days_: "일",
};

const ALL: Record<Locale, DateCopy> = { en, us, ja, ru, ko };

export function ageCopy(locale: Locale): DateCopy {
  return ALL[locale] ?? en;
}

export function dateCopy(locale: Locale): DateCopy {
  return ALL[locale] ?? en;
}
