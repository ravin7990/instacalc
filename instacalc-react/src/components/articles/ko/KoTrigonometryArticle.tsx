export function KoTrigonometryArticle() {
  return (
    <article className="section prose-page">
      <div className="container">
        <h2>삼각형 및 삼각함수 계산기 가이드: 빗변·각도·넓이·사인·코사인법칙의 모든 것</h2>
        <p>
          삼각형은 모든 다각형의 기초가 되는 기하학적 도형으로, 건축 구조 설계, 토목 측량, 기계 공학,
          천문학, 컴퓨터 그래픽스(3D 모델링)의 근간을 이룹니다. 직각삼각형의 빗변을 구하는 피타고라스 정리부터
          일반 임의 삼각형을 해석하는 사인법칙과 코사인법칙까지, 본 계산기는 세 변(SSS), 두 변과 끼인각(SAS),
          한 변과 양 끝각(ASA) 등 주어진 조건에 맞추어 누락된 변의 길이, 세 내각, 넓이, 둘레, 그리고 삼각비(sin, cos, tan)를
          정밀하게 자동 계산합니다.
        </p>

        <h3>1. 직각삼각형과 삼각비(Trigonometric Ratios)의 정의</h3>
        <p>
          직각삼각형에서 직각(90°)을 마주보는 가장 긴 변을 <strong>빗변(Hypotenuse, c)</strong>이라 하며,
          기준각 $\theta$에 대하여 마주보는 변을 <strong>대변(Opposite, a)</strong>, 이웃한 변을
          <strong>밑변(Adjacent, b)</strong>이라 합니다. 세 변의 길이 비율로 정의되는 세 가지 기본 삼각비는 다음과 같습니다:
        </p>
        <ul>
          <li><strong>사인 (sin θ):</strong> <code>대변 / 빗변 = a / c</code></li>
          <li><strong>코사인 (cos θ):</strong> <code>밑변 / 빗변 = b / c</code></li>
          <li><strong>탄젠트 (tan θ):</strong> <code>대변 / 밑변 = a / b = sin θ / cos θ</code></li>
          <li>
            <strong>특수각의 삼각비:</strong>
            <ul>
              <li><strong>30°:</strong> sin = 1/2, cos = √3/2, tan = 1/√3</li>
              <li><strong>45°:</strong> sin = 1/√2, cos = 1/√2, tan = 1 (변의 비 1 : 1 : √2)</li>
              <li><strong>60°:</strong> sin = √3/2, cos = 1/2, tan = √3 (변의 비 1 : √3 : 2)</li>
            </ul>
          </li>
        </ul>

        <h3>2. 일반 삼각형 해석의 두 기둥: 사인법칙과 코사인법칙</h3>
        <p>
          직각삼각형이 아닌 예각삼각형이나 둔각삼각형을 해석할 때는 고등학교 수학의 핵심 원리인
          <strong>사인법칙</strong>과 <strong>코사인법칙</strong>을 적용합니다:
        </p>
        <ol>
          <li>
            <strong>사인법칙 (Law of Sines):</strong> 외접원의 반지름을 $R$이라 할 때,
            <code>a / sin A = b / sin B = c / sin C = 2R</code>이 항상 성립합니다.
            한 변의 길이와 두 각을 알 때(ASA, AAS), 또는 두 변과 그 중 한 대각을 알 때 다른 변과 각을
            구하는 데 사용됩니다.
          </li>
          <li>
            <strong>코사인법칙 (Law of Cosines):</strong> 피타고라스 정리를 일반 삼각형으로 확장한 공식으로,
            <code>c² = a² + b² - 2ab · cos C</code>가 성립합니다.
            두 변의 길이와 그 끼인각을 알 때(SAS) 나머지 한 변을 구하거나, 세 변의 길이만 알 때(SSS)
            각도를 역추적(arccos)할 때 필수적입니다.
          </li>
        </ol>

        <h3>3. 세 변의 길이로 넓이를 구하는 헤론의 공식 (Heron's Formula)</h3>
        <p>
          삼각형의 높이를 모르고 세 변의 길이 $a, b, c$만 알고 있을 때, 가장 빠르고 정확하게 넓이 $S$를
          구하는 공식이 <strong>헤론의 공식</strong>입니다:
        </p>
        <ul>
          <li>둘레의 절반: <code>s = (a + b + c) / 2</code></li>
          <li>삼각형 넓이: <code>S = √(s · (s - a) · (s - b) · (s - c))</code></li>
        </ul>
        <p>
          예를 들어 세 변이 7m, 8m, 9m인 부지의 경우, 둘레 반값 s = (7 + 8 + 9) / 2 = 12이며,
          넓이 S = √(12 × 5 × 4 × 3) = √720 ≈ 26.83m²로 즉시 산출됩니다.
        </p>

        <h3>4. 삼각형의 결정조건과 SSA 모호한 경우(Ambiguous Case)</h3>
        <p>
          삼각형이 기하학적으로 유일하게 단 하나로 확정되는 조건은 <strong>SSS(세 변의 길이)</strong>,
          <strong>SAS(두 변과 그 끼인각)</strong>, <strong>ASA/AAS(한 변과 양 끝각)</strong> 세 가지입니다.
          단, 두 변의 합이 나머지 한 변보다 항상 커야 한다는 <em>삼각형의 부등식(a + b {">"} c)</em>을
          만족해야 합니다.
        </p>
        <p>
          반면, <strong>SSA 조건(두 변과 끼이지 않은 각)</strong>은 원호를 그렸을 때 교점이 0개(삼각형 불성립),
          1개(직각삼각형 접함), 또는 2개(예각/둔각 삼각형 2가지 형태 공존)가 생길 수 있는
          '모호한 경우(Ambiguous Case)'가 발생하므로 구조 설계 시 각별히 주의해야 합니다.
        </p>

        <h3>5. 삼각측량(Triangulation)과 지적·토목 현장 응용</h3>
        <p>
          강 건너편 나무나 산봉우리처럼 직접 줄자를 댈 수 없는 원거리 목표점의 좌표와 높이는
          <strong>삼각측량법(Triangulation)</strong>으로 측정합니다. 지상에서 정확히 측정 가능한
          기선(Baseline) 양 끝점에서 데오돌라이트(경위의)나 토털 스테이션으로 목표점을 조준하여
          두 수평각을 측정하면, <strong>한 변과 양 끝각(ASA 조건)</strong>에 의해 사인법칙으로
          목표점까지의 거리와 수직 고도차를 밀리미터 오차 이내로 정밀 산출할 수 있습니다.
        </p>
        <p>
          이는 국토지리정보원의 국가 기준점 측량, 드론 항공측량(LiDAR), GPS 삼각망 형성, 터널 굴착 관통선
          유지 등 국가 인프라 구축의 근간이 되는 핵심 공학 수학입니다.
        </p>
      </div>
    </article>
  );
}
