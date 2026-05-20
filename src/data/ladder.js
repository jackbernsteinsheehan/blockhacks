export default [
  { "id": "member_1", "level": 5 },
  { "id": "member_2", "level": 7 },
  { "id": "member_3", "level": 9 },
  { "id": "dev_1", "level": 12 },
  { "id": "dev_2", "level": 14 },
  { "id": "dev_3", "level": 16 },
  { "id": "researcher_1", "level": 19 },
  { "id": "researcher_2", "level": 21 },
  { "id": "security_lead", "level": 24 },
  { "id": "events_lead", "level": 27 },
  { "id": "treasurer", "level": 30 },
  { "id": "vp", "level": 34 },
  { "id": "president", "level": 40, "boss": true, "party": [
    { "id": "vp", "level": 36 },
    { "id": "treasurer", "level": 36 },
    { "id": "president", "level": 40 }
  ]}
]
;
