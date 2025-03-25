import React, { useState } from 'react';
import { Box, Button, Container, Heading, Input, Text, Select } from '@chakra-ui/react';

function App() {
  // 상태 관리
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [dividends, setDividends] = useState<number>(0);
  const [exchangeRate, setExchangeRate] = useState<number>(1300);
  const [taxResults, setTaxResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('calculate');
  const [currency, setCurrency] = useState<string>('KRW'); // 'KRW' 또는 'USD'

  // 세금 계산 함수
  const calculateTax = () => {
    try {
      // 기본 데이터 검증
      if (purchasePrice < 0 || salePrice < 0 || dividends < 0 || exchangeRate <= 0) {
        alert('모든 값은 0 이상이어야 하며, 환율은 0보다 커야 합니다.');
        return;
      }

      // 미국 측 세금 계산
      const capitalGain = salePrice - purchasePrice; // 양도소득
      const usDividendTax = dividends * 0.15; // 미국 배당세 (한미 조세조약에 따라 15%)

      // 한국 측 세금 계산 (2023년 금융투자소득세 기준)
      // 금융투자소득세는 양도소득에 대해 기본공제 5천만원 후 22% (지방소득세 포함 24.2%)
      const krwCapitalGain = capitalGain * exchangeRate;
      const basicDeduction = 50000000; // 5천만원 기본공제
      const taxableCapitalGain = Math.max(0, krwCapitalGain - basicDeduction);
      const capitalGainTaxRate = 0.242; // 22% + 지방소득세 2.2%
      const krCapitalGainTax = taxableCapitalGain * capitalGainTaxRate;

      // 배당소득세 계산 (종합소득세율 적용, 간소화를 위해 22% 가정)
      const krwDividends = dividends * exchangeRate;
      const dividendTaxRate = 0.242; // 22% + 지방소득세 2.2%
      const krDividendTax = krwDividends * dividendTaxRate;

      // 외국납부세액공제 계산
      // 외국납부세액공제 한도 = 한국 세금 × (국외원천소득 / 총소득)
      const foreignTaxCredit = Math.min(usDividendTax * exchangeRate, krDividendTax);

      // 최종 납부세액 계산
      const totalKrTax = krCapitalGainTax + krDividendTax - foreignTaxCredit;

      // 결과 설정
      setTaxResults({
        // 미국 세금
        usDividendTax,
        usDividendTaxKRW: usDividendTax * exchangeRate,
        
        // 한국 세금 (양도소득)
        krwCapitalGain,
        basicDeduction,
        taxableCapitalGain,
        krCapitalGainTax,
        
        // 한국 세금 (배당소득)
        krwDividends,
        krDividendTax,
        
        // 외국납부세액공제
        foreignTaxCredit,
        
        // 최종 납부세액
        totalKrTax,
      });

      alert('세금 계산이 완료되었습니다.');
    } catch (error) {
      alert('세금 계산 중 오류가 발생했습니다.');
      console.error('Tax calculation error:', error);
    }
  };

  // 숫자 포맷 함수
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  // 통화 변환 함수
  const convertCurrency = (amount: number, toUSD: boolean = false) => {
    if (toUSD) {
      return amount / exchangeRate; // KRW -> USD
    } else {
      return amount * exchangeRate; // USD -> KRW
    }
  };

  // 통화 표시 함수
  const formatCurrency = (amount: number, isUSD: boolean = false) => {
    if (currency === 'USD' || isUSD) {
      return `$${formatNumber(isUSD ? amount : convertCurrency(amount, true))}`;
    } else {
      return `${formatNumber(isUSD ? convertCurrency(amount) : amount)}원`;
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box textAlign="center" mb={8}>
        <Heading as="h1" size="xl" mb={2}>
          미국 주식 세금 계산기
        </Heading>
        <Text color="gray.600">
          한국 투자자를 위한 미국 주식 매매 및 배당 세금 계산기
        </Text>
      </Box>

      {/* 탭 메뉴 */}
      <Box display="flex" justifyContent="center" mb={8}>
        <Button 
          colorScheme={activeTab === 'calculate' ? 'blue' : 'gray'} 
          onClick={() => setActiveTab('calculate')}
          mr={4}
        >
          세금 계산
        </Button>
        <Button 
          colorScheme={activeTab === 'info' ? 'blue' : 'gray'} 
          onClick={() => setActiveTab('info')}
        >
          세금 정보
        </Button>
      </Box>

      {/* 세금 계산 탭 */}
      {activeTab === 'calculate' && (
        <>
          <Box boxShadow="md" p={6} bg="white" borderRadius="md" mb={8}>
            <Heading size="md" mb={4}>투자 정보 입력</Heading>
            
            {/* 통화 선택 */}
            <Box mb={6}>
              <Text mb={2} fontWeight="bold">결과 표시 통화</Text>
              <Select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
                width="200px"
              >
                <option value="KRW">원화 (KRW)</option>
                <option value="USD">달러 (USD)</option>
              </Select>
            </Box>
            
            <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} mb={6}>
              <Box>
                <Text mb={2} fontWeight="bold">매수 금액 (USD)</Text>
                <Input 
                  type="number" 
                  min={0} 
                  placeholder="예: 10000" 
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                />
              </Box>

              <Box>
                <Text mb={2} fontWeight="bold">매도 금액 (USD)</Text>
                <Input 
                  type="number" 
                  min={0} 
                  placeholder="예: 12000" 
                  onChange={(e) => setSalePrice(Number(e.target.value))}
                />
              </Box>

              <Box>
                <Text mb={2} fontWeight="bold">배당금 (USD)</Text>
                <Input 
                  type="number" 
                  min={0} 
                  placeholder="예: 500" 
                  onChange={(e) => setDividends(Number(e.target.value))}
                />
              </Box>

              <Box>
                <Text mb={2} fontWeight="bold">환율 (KRW/USD)</Text>
                <Input 
                  type="number" 
                  min={1} 
                  value={exchangeRate} 
                  placeholder="예: 1300" 
                  onChange={(e) => setExchangeRate(Number(e.target.value))}
                />
              </Box>
            </Box>

            <Button colorScheme="blue" size="lg" onClick={calculateTax} width="100%">
              세금 계산하기
            </Button>
          </Box>

          {taxResults && (
            <Box boxShadow="md" p={6} bg="white" borderRadius="md" mb={8}>
              <Heading size="md" mb={4}>세금 계산 결과</Heading>
              
              <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} mb={6}>
                <Box>
                  <Text fontWeight="bold">양도소득</Text>
                  <Text fontSize="2xl">
                    {currency === 'KRW' 
                      ? `${formatNumber(taxResults.krwCapitalGain)}원` 
                      : `$${formatNumber(salePrice - purchasePrice)}`}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {currency === 'KRW' 
                      ? `$${formatNumber(salePrice - purchasePrice)} × ${formatNumber(exchangeRate)}원` 
                      : `${formatNumber((salePrice - purchasePrice) * exchangeRate)}원 ÷ ${formatNumber(exchangeRate)}`}
                  </Text>
                </Box>

                <Box>
                  <Text fontWeight="bold">배당소득</Text>
                  <Text fontSize="2xl">
                    {currency === 'KRW' 
                      ? `${formatNumber(taxResults.krwDividends)}원` 
                      : `$${formatNumber(dividends)}`}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {currency === 'KRW' 
                      ? `$${formatNumber(dividends)} × ${formatNumber(exchangeRate)}원` 
                      : `${formatNumber(dividends * exchangeRate)}원 ÷ ${formatNumber(exchangeRate)}`}
                  </Text>
                </Box>
              </Box>

              <Box height="1px" bg="gray.200" my={4} />

              <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} mb={6}>
                <Box>
                  <Text fontWeight="bold">미국 배당세 (15%)</Text>
                  <Text fontSize="2xl">
                    {currency === 'KRW' 
                      ? `${formatNumber(taxResults.usDividendTaxKRW)}원` 
                      : `$${formatNumber(taxResults.usDividendTax)}`}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {currency === 'KRW' 
                      ? `$${formatNumber(taxResults.usDividendTax)} × ${formatNumber(exchangeRate)}원` 
                      : `${formatNumber(dividends)} × 15%`}
                  </Text>
                </Box>

                <Box>
                  <Text fontWeight="bold">한국 양도소득세</Text>
                  <Text fontSize="2xl">
                    {currency === 'KRW' 
                      ? `${formatNumber(taxResults.krCapitalGainTax)}원` 
                      : `$${formatNumber(taxResults.krCapitalGainTax / exchangeRate)}`}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {currency === 'KRW' 
                      ? `(${formatNumber(taxResults.krwCapitalGain)}원 - ${formatNumber(taxResults.basicDeduction)}원) × 24.2%` 
                      : `$${formatNumber((taxResults.krwCapitalGain - taxResults.basicDeduction) / exchangeRate)} × 24.2%`}
                  </Text>
                </Box>

                <Box>
                  <Text fontWeight="bold">한국 배당소득세</Text>
                  <Text fontSize="2xl">
                    {currency === 'KRW' 
                      ? `${formatNumber(taxResults.krDividendTax)}원` 
                      : `$${formatNumber(taxResults.krDividendTax / exchangeRate)}`}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {currency === 'KRW' 
                      ? `${formatNumber(taxResults.krwDividends)}원 × 24.2%` 
                      : `$${formatNumber(dividends)} × 24.2%`}
                  </Text>
                </Box>
              </Box>

              <Box height="1px" bg="gray.200" my={4} />

              <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                <Box>
                  <Text fontWeight="bold">외국납부세액공제</Text>
                  <Text fontSize="2xl">
                    {currency === 'KRW' 
                      ? `${formatNumber(taxResults.foreignTaxCredit)}원` 
                      : `$${formatNumber(taxResults.foreignTaxCredit / exchangeRate)}`}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    미국에서 납부한 세금에 대한 공제액
                  </Text>
                </Box>

                <Box>
                  <Text fontWeight="bold">최종 납부세액 (한국)</Text>
                  <Text fontSize="2xl" color="red.500">
                    {currency === 'KRW' 
                      ? `${formatNumber(taxResults.totalKrTax)}원` 
                      : `$${formatNumber(taxResults.totalKrTax / exchangeRate)}`}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    양도소득세 + 배당소득세 - 외국납부세액공제
                  </Text>
                </Box>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* 세금 정보 탭 */}
      {activeTab === 'info' && (
        <Box boxShadow="md" p={6} bg="white" borderRadius="md" mb={8}>
          <Heading size="md" mb={4}>미국 주식 세금 정보</Heading>
          
          <Box mb={6}>
            <Heading size="sm" mb={2}>미국 측 세금</Heading>
            <Text>
              1. <strong>배당금에 대한 원천징수세</strong>: 미국 주식에서 발생하는 배당금에 대해 일반적으로 30%의 원천징수세가 부과됩니다. 
              하지만 한미 조세조약에 따라 한국 투자자는 15%로 감면받을 수 있습니다.
            </Text>
            <Text mt={2}>
              2. <strong>양도소득세</strong>: 비거주자(한국 투자자)는 일반적으로 미국 주식 매매 차익에 대한 양도소득세가 면제됩니다.
            </Text>
          </Box>

          <Box height="1px" bg="gray.200" my={4} />

          <Box mb={6}>
            <Heading size="sm" mb={2}>한국 측 세금</Heading>
            <Text>
              1. <strong>금융투자소득세</strong>: 2023년부터 주식 양도소득에 대해 금융투자소득세가 적용됩니다. 
              기본공제 5천만원 이후 22%(지방소득세 포함 24.2%)의 세율이 적용됩니다.
            </Text>
            <Text mt={2}>
              2. <strong>배당소득세</strong>: 해외 주식 배당금은 종합소득세 과세대상입니다. 
              종합소득 구간에 따라 6.6%~49.5%(지방소득세 포함)의 세율이 적용됩니다.
            </Text>
            <Text mt={2}>
              3. <strong>외국납부세액공제</strong>: 미국에서 납부한 세금은 한국 세금에서 공제받을 수 있습니다. 
              공제한도는 '한국 세금 × (국외원천소득 / 총소득)'입니다.
            </Text>
          </Box>

          <Box height="1px" bg="gray.200" my={4} />

          <Box>
            <Heading size="sm" mb={2}>주의사항</Heading>
            <Text>
              - 이 계산기는 참고용으로만 사용하시고, 정확한 세금 계산은 전문가와 상담하세요.
            </Text>
            <Text mt={2}>
              - 세법은 매년 변경될 수 있으므로 최신 정보를 확인하세요.
            </Text>
            <Text mt={2}>
              - 종합소득세 신고 시 해외 금융계좌 신고 의무가 있을 수 있습니다.
            </Text>
          </Box>
        </Box>
      )}

      <Box textAlign="center" fontSize="sm" color="gray.500">
        <Text>© 2024 미국 주식 세금 계산기. 이 계산기는 참고용으로만 사용하세요.</Text>
        <Text mt={1}>
          세금 관련 정확한 정보는{' '}
          <a href="https://www.nts.go.kr" target="_blank" rel="noopener noreferrer" style={{ color: '#3182ce' }}>
            국세청
          </a>
          에서 확인하세요.
        </Text>
      </Box>
    </Container>
  );
}

export default App;
