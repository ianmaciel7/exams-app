# Crucial Exams — organização da informação

Consulta em 2026-11-19. Estrutura de URLs e hierarquia vistas no HTML público e no menu.

## Hierarquia
```
Home
├─ Exams → fornecedor (/exams/<fornecedor>/practice-tests-questions-flashcards)
│          └─ exame (/exams/<fornecedor>/<certificação>/<código>/practice-tests-practice-questions)
│              ├─ Practice Tests  (/study/tests/<fornecedor>/<código>/auto)
│              ├─ Practice Questions / Study Mode (/study/questions/exam/<código>)
│              ├─ Flashcards (/study/<código>/flashcards/<deck>?mode=Table|Matching)
│              └─ PBQs
├─ AI Instructor (/tools/ai-bot)
├─ Discount Vouchers (/store)
├─ Educators · App · Pricing (3 pacotes) · More
└─ Login / Sign Up (/user/login) · Leaderboards · Contato (/contact)
```

## Agrupamentos do menu (Confirmado)
- IT: CompTIA, Cisco, AWS, Microsoft, ISC2, EC-Council, GCP, Tableau.
- Project Management: PMI e PeopleCert (PMP, CAPM, PgMP, PRINCE2).
- Medical and Nursing: AAMA, BCEN, NCSBN.
- Pacotes de preço: IT & Cybersecurity, Project Management, Nursing and Medical Assistants.

## Modelo de dados provável (Inferência)
Fornecedor → Certificação → Exame (código, versão) → Domínios/objetivos → Questões (alternativas, explicação) · Decks → Cartões · PBQs · Usuário → Tentativas, Patches, Marcações · Pacote/Plano · Voucher.

## Observações
- Versão do exame faz parte do nome (ex.: A+ 220-1201 (V15)).
- Cada exame tem sua própria página com contagens (questões, cartões, PBQs).
- Aplicativos iOS e Android existem (links para App Store e Google Play na home).
