# wip-resource-generator

이게뭐약 DB 리소스 파일 생성기

# Database

- [의약품 낱알식별정보 데이터](https://data.mfds.go.kr/OPCAC01F05?srchSrvcKorNm=%EC%9D%98%EC%95%BD%ED%92%88%20%EB%82%B1%EC%95%8C%EC%8B%9D%EB%B3%84%EC%A0%95%EB%B3%B4%20%EB%8D%B0%EC%9D%B4%ED%84%B0)
- [완제 의약품 허가 상세 데이터](https://data.mfds.go.kr/OPCAC01F05/search?loginCk=false&aplyYn=&taskDivsCd=&srchSrvcKorNm=%EC%99%84%EC%A0%9C+%EC%9D%98%EC%95%BD%ED%92%88+%ED%97%88%EA%B0%80+%EC%83%81%EC%84%B8+%EB%8D%B0%EC%9D%B4%ED%84%B0)

# Execute

- Resource generate

```bash
yarn start
```

- Resource decrypt (for encrypt test)

```bash
yarn start decrypt
```

# Requirement

- ./res

  - 원본 리소스 디렉터리
  - drug_recognition (의약품 낱알식별정보 데이터)
  - finished_medecine_permisstion_details (완제 의약품 허가 상세 데이터)

- ./encrypted_red

  - 프로그램 실행 후 암호화된 리소스 파일이 위치하는 디렉터리

- ./decrypted_res

  - 프로그램 실행 후 복호화된 리소스 파일이 위치하는 디렉터리

- ./secret.json
  - AES 암호화 정보

```json
{
  "aesKey": "",
  "aesIv": ""
}
```
