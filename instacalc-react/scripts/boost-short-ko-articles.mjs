import fs from 'node:fs';
import path from 'node:path';

const dir = 'src/components/articles/ko';

// 1. Annual Leave Pay
{
  const file = path.join(dir, 'KoAnnualLeavePayArticle.tsx');
  let content = fs.readFileSync(file, 'utf8');
  const target = '열람할 수 있도록 지원해야 법적 분쟁을 미연에 방지할 수 있습니다.';
  const replacement = '열람할 수 있도록 지원해야 법적 분쟁을 미연에 방지할 수 있습니다. 특히 퇴직 시 미사용 연차수당은 퇴사일로부터 14일 이내에 전액 현금 지급되어야 하며, 당사자 간 합의 없이 기한을 넘길 경우 근로기준법상 연 20%의 지연이자가 부과됩니다.';
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated KoAnnualLeavePayArticle.tsx');
  }
}

// 2. Inheritance Gift Tax
{
  const file = path.join(dir, 'KoInheritanceGiftTaxArticle.tsx');
  let content = fs.readFileSync(file, 'utf8');
  const target = '최종 자진납부 세액을 즉시 산출해 드립니다.';
  const replacement = '최종 자진납부 세액을 즉시 산출해 드립니다. 증여세는 증여일이 속한 달의 말일부터 3개월 이내, 상속세는 상속개시일이 속한 달의 말일부터 6개월 이내에 국세청 홈택스 또는 주소지 관할 세무서에 자진 신고해야 3%의 신고세액공제를 적용받고 무신고 가산세(20%)를 피할 수 있습니다.';
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated KoInheritanceGiftTaxArticle.tsx');
  }
}

// 3. National Pension
{
  const file = path.join(dir, 'KoNationalPensionArticle.tsx');
  let content = fs.readFileSync(file, 'utf8');
  const target = '안정적인 연금 현금 흐름을 미리 설계해 보시기 바랍니다.';
  const replacement = '안정적인 연금 현금 흐름을 미리 설계해 보시기 바랍니다. 국민연금의 가장 독보적인 장점은 민간 개인연금과 달리 매년 통계청 발표 전년도 전국 소비자물가상승률을 100% 반영하여 수령 연금액이 평생 인상되므로 화폐가치 하락에 따른 인플레이션을 완벽하게 방어한다는 점입니다.';
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated KoNationalPensionArticle.tsx');
  }
}

// 4. Overseas Stock Tax
{
  const file = path.join(dir, 'KoOverseasStockTaxArticle.tsx');
  let content = fs.readFileSync(file, 'utf8');
  const target = '양도소득세 신고서 작성 시 반드시 증권사 거래내역과 대조하시기 바랍니다.';
  const replacement = '양도소득세 신고서 작성 시 반드시 증권사 거래내역과 대조하시기 바랍니다. 미국 주식 매매 시 결제 기준일(체결일로부터 T+1~2영업일)의 서울외국환중개 매매기준율이 적용되며, 여러 증권사를 교차 이용하는 서학개미는 증권사 간 무료 세무신고 대행 서비스를 신청하거나 홈택스에서 합산 자진 신고해야 무신고 가산세를 예방할 수 있습니다.';
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated KoOverseasStockTaxArticle.tsx');
  }
}

// 5. Parking Account
{
  const file = path.join(dir, 'KoParkingAccountArticle.tsx');
  let content = fs.readFileSync(file, 'utf8');
  const target = '현금 흐름 자산 관리 플랜을 완성해 보시기 바랍니다.';
  const replacement = '현금 흐름 자산 관리 플랜을 완성해 보시기 바랍니다. 토스뱅크나 카카오뱅크, 케이뱅크, 사이다뱅크 등 인터넷전문은행과 저축은행 파킹통장은 매일 자정이 지나면 전일 최종 잔액에 약정 금리를 일할 계산하여 매일 또는 매월 지정일에 이자를 자동 복리 정산해 주므로 단 하루만 맡겨도 쏠쏠한 이자 수익을 얻을 수 있습니다.';
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated KoParkingAccountArticle.tsx');
  }
}

// 6. Policy Housing Loan
{
  const file = path.join(dir, 'KoPolicyHousingLoanArticle.tsx');
  let content = fs.readFileSync(file, 'utf8');
  const target = '맞춤형 정책금융 상품을 스마트하게 비교해 보시기 바랍니다.';
  const replacement = '맞춤형 정책금융 상품을 스마트하게 비교해 보시기 바랍니다. 디딤돌 대출과 버팀목 전세대출은 일반 시중은행 주택담보대출보다 금리가 연 1~2%p 이상 저렴할 뿐만 아니라, 중도상환수수료 감면 혜택과 생애주기별 우대금리가 중복 적용되므로 무주택 서민 실수요자라면 가장 먼저 신청 자격을 검토해야 할 1순위 정책 대출입니다.';
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated KoPolicyHousingLoanArticle.tsx');
  }
}

// 7. Pyeong
{
  const file = path.join(dir, 'KoPyeongArticle.tsx');
  let content = fs.readFileSync(file, 'utf8');
  const target = '실제 생활 면적을 오차 없이 계산해 보시기 바랍니다.';
  const replacement = '실제 생활 면적을 오차 없이 계산해 보시기 바랍니다. 부동산 등기부등본과 건축물대장에는 법정 계량단위인 제곱미터(㎡)로만 표기되므로, 아파트 분양 공고나 네이버 부동산 매물을 탐색할 때는 공급면적 기준 평수와 전용면적 기준 평수를 명확히 구분하여 실질 주거 공간의 가성비를 꼼꼼하게 따져보아야 합니다.';
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated KoPyeongArticle.tsx');
  }
}

// 8. Stock Average Down
{
  const file = path.join(dir, 'KoStockAverageDownArticle.tsx');
  let content = fs.readFileSync(file, 'utf8');
  const target = '추가 매수 계획을 수립하시기 바랍니다.';
  const replacement = '추가 매수 계획을 수립하시기 바랍니다. 물타기는 단기 반등 시 탈출 기회를 제공하는 유용한 전략이지만, 기업의 펀더멘털이 훼손된 종목에 무계획적으로 비중을 과도하게 늘릴 경우 손실 폭이 걷잡을 수 없이 커질 수 있으므로 반드시 사전에 정해둔 손절 기준선과 계좌 총자산 대비 비중 한도를 엄격하게 준수해야 합니다.';
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated KoStockAverageDownArticle.tsx');
  }
}

console.log('Done boosting 8 Korean articles.');
