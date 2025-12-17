-- Seed for DISC Test
-- Inserts the standard DISC assessment into the tests table

INSERT INTO public.tests (title, description, questions)
VALUES (
  'Avaliação DISC',
  'Descubra seu perfil comportamental predominante (Dominância, Influência, Estabilidade, Conformidade).',
  '[
    {
      "id": 1,
      "text": "Em um ambiente de trabalho, eu geralmente sou:",
      "options": [
        {"text": "Assertivo e direto ao ponto", "type": "D"},
        {"text": "Comunicativo e persuasivo", "type": "I"},
        {"text": "Calmo e bom ouvinte", "type": "S"},
        {"text": "Analítico e detalhista", "type": "C"}
      ]
    },
    {
      "id": 2,
      "text": "Diante de um conflito, minha tendência é:",
      "options": [
        {"text": "Assumir o controle e resolver logo", "type": "D"},
        {"text": "Tentar apaziguar e manter o clima bom", "type": "I"},
        {"text": "Evitar o confronto e buscar harmonia", "type": "S"},
        {"text": "Analisar os fatos e regras antes de agir", "type": "C"}
      ]
    },
    {
      "id": 3,
      "text": "O que mais me motiva é:",
      "options": [
        {"text": "Desafios e resultados", "type": "D"},
        {"text": "Reconhecimento e interação social", "type": "I"},
        {"text": "Segurança e estabilidade", "type": "S"},
        {"text": "Qualidade e precisão", "type": "C"}
      ]
    },
    {
      "id": 4,
      "text": "Ao tomar decisões, eu priorizo:",
      "options": [
        {"text": "A rapidez e o objetivo", "type": "D"},
        {"text": "O impacto nas pessoas", "type": "I"},
        {"text": "O consenso e a segurança", "type": "S"},
        {"text": "Os dados e a lógica", "type": "C"}
      ]
    }
  ]'::jsonb
);
