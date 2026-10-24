import fs from 'node:fs';
import path from 'node:path';

const dir = 'src/components/articles/ko';

// 1. Overseas Stock Tax
{
  const file = path.join(dir, 'KoOverseasStockTaxArticle.tsx');
  let content = fs.readFileSync(file, 'utf8');
  const target = '계좌 성격에 따른 투자 배분을 병행하시기 바랍니다.';
  const replacement = '계좌 성격에 따른 투자 배분을 병행하시기 바랍니다. 미국 주식 매매 시 결제 기준일(체결일로부터 T+1~2영업일)의 서울외국환중개 매매기준율이 적용되며, 여러 증권사를 교차 이용하는 서학개미는 증권사 간 무료 세무신고 대행 서비스를 신청하거나 홈택스에서 합산 자진 신고해야 무신고 가산세를 예방할 수 있습니다.';
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated KoOverseasStockTaxArticle.tsx');
}

// 2. Parking Account
{
  const file = path.join(dir, 'KoParkingAccountArticle.tsx');
  let content = fs.readFileSync(file, 'utf8');
  const target = '종잣돈 형성 속도를 2배 이상 높일 수 있습니다.';
  const replacement = '종잣돈 형성 속도를 2배 이상 높일 수 있습니다. 토스뱅크나 카카오뱅크, 케이뱅크, 사이다뱅크 등 인터넷전문은행과 저축은행 파킹통장은 매일 자정이 지나면 전일 최종 잔액에 약정 금리를 일할 계산하여 매일 또는 매월 지정일에 이자를 자동 복리 정산해 주므로 단 하루만 맡겨도 쏠쏠한 이자 수익을 얻을 수 있습니다.';
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated KoParkingAccountArticle.tsx');
}

// 3. Policy Housing Loan
{
  const file = path.join(dir, 'KoPolicyHousingLoanArticle.tsx');
  let content = fs.readFileSync(file, 'utf8');
  const target = '신속하게 승인을 받을 수 있습니다.';
  const replacement = '신속하게 승인을 받을 수 있습니다. 디딤돌 대출과 버팀목 전세대출은 일반 시중은행 주택담보대출보다 금리가 연 1~2%p 이상 저렴할 뿐만 아니라, 중도상환수수료 감면 혜택과 생애주기별 우대금리가 중복 적용되므로 무주택 서민 실수요자라면 가장 먼저 신청 자격을 검토해야 할 1순위 정책 대출입니다.';
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated KoPolicyHousingLoanArticle.tsx');
}

// 4. Pyeong
{
  const file = path.join(dir, 'KoPyeongArticle.tsx');
  let content = fs.readFileSync(file, 'utf8');
  const target = '실용적으로 활용하실 수 있습니다.';
  const replacement = '실용적으로 활용하실 수 있습니다. 부동산 등기부등본과 건축물대장에는 법정 계량단위인 제곱미터(㎡)로만 표기되므로, 아파트 분양 공고나 네이버 부동산 매물을 탐색할 때는 공급면적 기준 평수와 전용면적 기준 평수를 명확히 구분하여 실질 주거 공간의 가성비를 꼼꼼하게 따져보아야 합니다.';
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated KoPyeongArticle.tsx');
}

// 5. Stock Average Down
{
  const file = path.join(dir, 'KoStockAverageDownArticle.tsx');
  let content = fs.readFileSync(file, 'utf8');
  const target = '직관적으로 보여드립니다.';
  const replacement = '직관적으로 보여드립니다. 물타기는 단기 반등 시 탈출 기회를 제공하는 유용한 전략이지만, 기업의 펀더멘털이 훼손된 종목에 무계획적으로 비중을 과도하게 늘릴 경우 손실 폭이 걷잡을 수 없이 커질 수 있으므로 반드시 사전에 정해둔 손절 기준선과 계좌 총자산 대비 비중 한도를 엄격하게 준수해야 합니다.';
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated KoStockAverageDownArticle.tsx');
}

console.log('All 5 articles updated.');
